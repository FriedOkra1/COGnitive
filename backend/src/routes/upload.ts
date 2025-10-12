import express from 'express';
import { uploadDocument, uploadAudio } from '../middleware/upload';
import { extractTextFromDocument, cleanupFile } from '../services/documentProcessor';
import { transcribeAudio, generateSummary } from '../services/openai';
import { UploadDocumentResponse, UploadAudioResponse, ErrorResponse } from '../types';
import fs from 'fs/promises';

const router = express.Router();

// Document upload endpoint
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

// Audio upload endpoint
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

export default router;

