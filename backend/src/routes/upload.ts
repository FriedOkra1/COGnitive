import express from 'express';
import { uploadDocument, uploadAudio, uploadImage } from '../middleware/upload';
import { extractTextFromDocument, cleanupFile } from '../services/documentProcessor';
import { transcribeAudio, generateSummary } from '../services/openai';
import { UploadDocumentResponse, UploadAudioResponse, UploadImageResponse, ErrorResponse } from '../types';
import fs from 'fs/promises';

const router = express.Router();

/**
 * @openapi
 * /api/upload/document:
 *   post:
 *     tags:
 *       - Upload
 *     summary: Upload and process document
 *     description: Upload a PDF, DOCX, or TXT document for text extraction and AI summarization
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Document file (PDF, DOCX, DOC, or TXT)
 *     responses:
 *       200:
 *         description: Document processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 text:
 *                   type: string
 *                   description: Extracted text from document
 *                 fileName:
 *                   type: string
 *                   description: Original file name
 *                 summary:
 *                   type: string
 *                   description: AI-generated summary
 *       400:
 *         description: Invalid request or empty document
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Processing failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/document', uploadDocument.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please upload a document file',
      } as ErrorResponse);
    }

    const { path: filePath, mimetype, originalname } = req.file;

    // Extract text from document
    const extractedText = await extractTextFromDocument(filePath, mimetype);

    if (!extractedText || extractedText.trim().length === 0) {
      await cleanupFile(filePath);
      return res.status(400).json({
        error: 'Empty document',
        message: 'Could not extract any text from the document',
      } as ErrorResponse);
    }

    // Generate summary
    const summary = await generateSummary(extractedText);

    // Clean up uploaded file
    await cleanupFile(filePath);

    res.json({
      success: true,
      text: extractedText,
      fileName: originalname,
      summary: summary,
    } as UploadDocumentResponse);
  } catch (error: any) {
    console.error('Document upload error:', error);
    
    // Clean up file if it exists
    if (req.file?.path) {
      await cleanupFile(req.file.path);
    }

    res.status(500).json({
      error: 'Document processing failed',
      message: error.message,
    } as ErrorResponse);
  }
});

/**
 * @openapi
 * /api/upload/audio:
 *   post:
 *     tags:
 *       - Upload
 *     summary: Upload and transcribe audio
 *     description: Upload an audio file for transcription using OpenAI Whisper
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - audio
 *             properties:
 *               audio:
 *                 type: string
 *                 format: binary
 *                 description: Audio file (MP3, WAV, M4A, WEBM, etc.)
 *     responses:
 *       200:
 *         description: Audio transcribed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 transcription:
 *                   type: string
 *                   description: Transcribed text from audio
 *       400:
 *         description: No file uploaded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Transcription failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/audio', uploadAudio.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please upload an audio file',
      } as ErrorResponse);
    }

    const { path: filePath, originalname } = req.file;

    // Read the audio file
    const audioBuffer = await fs.readFile(filePath);

    // Transcribe using Whisper
    const transcription = await transcribeAudio(audioBuffer, originalname);

    // Clean up uploaded file
    await cleanupFile(filePath);

    res.json({
      success: true,
      transcription: transcription,
    } as UploadAudioResponse);
  } catch (error: any) {
    console.error('Audio upload error:', error);
    
    // Clean up file if it exists
    if (req.file?.path) {
      await cleanupFile(req.file.path);
    }

    res.status(500).json({
      error: 'Audio processing failed',
      message: error.message,
    } as ErrorResponse);
  }
});

/**
 * @openapi
 * /api/upload/image:
 *   post:
 *     tags:
 *       - Upload
 *     summary: Upload and encode image
 *     description: Upload an image file and convert it to base64 for vision analysis
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file (JPEG, PNG, GIF, WEBP)
 *     responses:
 *       200:
 *         description: Image processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 imageData:
 *                   type: string
 *                   description: Base64-encoded image data URL
 *                 fileName:
 *                   type: string
 *                   description: Original file name
 *                 mimeType:
 *                   type: string
 *                   description: Image MIME type
 *       400:
 *         description: No file uploaded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Image processing failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/image', uploadImage.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please upload an image file',
      } as ErrorResponse);
    }

    const { path: filePath, mimetype, originalname } = req.file;

    // Read the image file and convert to base64
    const imageBuffer = await fs.readFile(filePath);
    const base64Image = imageBuffer.toString('base64');
    const imageData = `data:${mimetype};base64,${base64Image}`;

    // Clean up uploaded file
    await cleanupFile(filePath);

    res.json({
      success: true,
      imageData: imageData,
      fileName: originalname,
      mimeType: mimetype,
    } as UploadImageResponse);
  } catch (error: any) {
    console.error('Image upload error:', error);
    
    // Clean up file if it exists
    if (req.file?.path) {
      await cleanupFile(req.file.path);
    }

    res.status(500).json({
      error: 'Image processing failed',
      message: error.message,
    } as ErrorResponse);
  }
});

export default router;

