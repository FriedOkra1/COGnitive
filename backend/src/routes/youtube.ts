import express from 'express';
import { extractVideoId, getVideoTranscript } from '../services/youtube';
import { generateFlashcards, generateQuiz } from '../services/contentGenerator';
import { generateSummary } from '../services/openai';
import { ErrorResponse } from '../types';

const router = express.Router();

interface AnalyzeRequest {
  url: string;
}

interface GenerateContentRequest {
  transcript: string;
  count?: number;
}

/**
 * @openapi
 * /api/youtube/analyze:
 *   post:
 *     tags:
 *       - YouTube
 *     summary: Analyze YouTube video
 *     description: Extract transcript from a YouTube video (via captions or audio download) and generate AI summary
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *                 description: YouTube video URL
 *                 example: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
 *     responses:
 *       200:
 *         description: Video analyzed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 videoId:
 *                   type: string
 *                   description: YouTube video ID
 *                 title:
 *                   type: string
 *                   description: Video title
 *                 transcript:
 *                   type: string
 *                   description: Full video transcript
 *                 summary:
 *                   type: string
 *                   description: AI-generated summary
 *                 duration:
 *                   type: number
 *                   description: Video duration in seconds
 *                 segments:
 *                   type: array
 *                   items:
 *                     type: object
 *                   description: Transcript segments with timestamps
 *       400:
 *         description: Invalid URL
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Analysis failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/analyze', async (req, res) => {
  try {
    const { url } = req.body as AnalyzeRequest;

    if (!url) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'YouTube URL is required',
      } as ErrorResponse);
    }

    // Extract video ID
    const videoId = extractVideoId(url);
    if (!videoId) {
      return res.status(400).json({
        error: 'Invalid URL',
        message: 'Could not extract video ID from URL. Please provide a valid YouTube URL.',
      } as ErrorResponse);
    }

    // Get transcript (tries captions first, falls back to audio download)
    console.log('Starting video analysis...');
    const { transcript, title, duration, method } = await getVideoTranscript(videoId);
    console.log(`Transcript obtained via: ${method}`);

    // Generate summary
    console.log('Generating AI summary...');
    const summary = await generateSummary(transcript);

    res.json({
      success: true,
      videoId,
      title,
      transcript,
      summary,
      duration,
      segments: [], // No segments with Whisper transcription (could add later)
    });
  } catch (error: any) {
    console.error('YouTube analyze error:', error);
    res.status(500).json({
      error: 'Analysis failed',
      message: error.message,
    } as ErrorResponse);
  }
});

/**
 * @openapi
 * /api/youtube/flashcards:
 *   post:
 *     tags:
 *       - YouTube
 *     summary: Generate flashcards from transcript
 *     description: Create study flashcards from YouTube video transcript using AI
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - transcript
 *             properties:
 *               transcript:
 *                 type: string
 *                 description: Video transcript text
 *               count:
 *                 type: number
 *                 default: 15
 *                 description: Number of flashcards to generate
 *     responses:
 *       200:
 *         description: Flashcards generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 flashcards:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Flashcard'
 *                 count:
 *                   type: number
 *                   description: Number of flashcards generated
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Generation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/flashcards', async (req, res) => {
  try {
    const { transcript, count = 15 } = req.body as GenerateContentRequest;

    if (!transcript) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Transcript is required',
      } as ErrorResponse);
    }

    const flashcards = await generateFlashcards(transcript, count);

    res.json({
      success: true,
      flashcards,
      count: flashcards.length,
    });
  } catch (error: any) {
    console.error('Flashcard generation error:', error);
    res.status(500).json({
      error: 'Flashcard generation failed',
      message: error.message,
    } as ErrorResponse);
  }
});

/**
 * @openapi
 * /api/youtube/quiz:
 *   post:
 *     tags:
 *       - YouTube
 *     summary: Generate quiz from transcript
 *     description: Create quiz questions from YouTube video transcript using AI
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - transcript
 *             properties:
 *               transcript:
 *                 type: string
 *                 description: Video transcript text
 *               count:
 *                 type: number
 *                 default: 10
 *                 description: Number of quiz questions to generate
 *     responses:
 *       200:
 *         description: Quiz generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 questions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/QuizQuestion'
 *                 count:
 *                   type: number
 *                   description: Number of questions generated
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Generation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/quiz', async (req, res) => {
  try {
    const { transcript, count = 10 } = req.body as GenerateContentRequest;

    if (!transcript) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Transcript is required',
      } as ErrorResponse);
    }

    const questions = await generateQuiz(transcript, count);

    res.json({
      success: true,
      questions,
      count: questions.length,
    });
  } catch (error: any) {
    console.error('Quiz generation error:', error);
    res.status(500).json({
      error: 'Quiz generation failed',
      message: error.message,
    } as ErrorResponse);
  }
});

/**
 * @openapi
 * /api/youtube/summary:
 *   post:
 *     tags:
 *       - YouTube
 *     summary: Generate summary from transcript
 *     description: Create an AI-generated summary from a provided transcript
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - transcript
 *             properties:
 *               transcript:
 *                 type: string
 *                 description: Transcript text to summarize
 *     responses:
 *       200:
 *         description: Summary generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 summary:
 *                   type: string
 *                   description: AI-generated summary
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Generation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/summary', async (req, res) => {
  try {
    const { transcript } = req.body;

    if (!transcript) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Transcript is required',
      } as ErrorResponse);
    }

    const summary = await generateSummary(transcript);

    res.json({
      success: true,
      summary,
    });
  } catch (error: any) {
    console.error('Summary generation error:', error);
    res.status(500).json({
      error: 'Summary generation failed',
      message: error.message,
    } as ErrorResponse);
  }
});

export default router;

