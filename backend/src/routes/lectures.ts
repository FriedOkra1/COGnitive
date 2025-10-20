import express from 'express';
import { uploadLecture } from '../middleware/upload';
import { processLecture } from '../services/lectureProcessor';
import {
  getJob,
  deleteJob,
  loadTranscript,
  loadNotes,
  saveGeneratedContent,
  loadGeneratedContent,
  initializeJobManager,
} from '../services/jobManager';
import { generateFlashcards, generateQuiz } from '../services/contentGenerator';
import { cleanupFile } from '../services/documentProcessor';

const router = express.Router();

// Initialize job manager on module load
initializeJobManager();

/**
 * @openapi
 * /api/lectures/upload:
 *   post:
 *     tags:
 *       - Lectures
 *     summary: Upload pre-recorded lecture
 *     description: Upload a pre-recorded audio or video lecture file for processing, transcription, and AI note generation
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - lecture
 *             properties:
 *               lecture:
 *                 type: string
 *                 format: binary
 *                 description: Lecture audio/video file (MP4, WEBM, MP3, WAV, etc.)
 *     responses:
 *       200:
 *         description: Upload successful, processing started
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 jobId:
 *                   type: string
 *                   description: Unique job identifier for tracking progress
 *                 status:
 *                   type: string
 *                   example: processing
 *                 message:
 *                   type: string
 *       400:
 *         description: No file uploaded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Upload failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/upload', uploadLecture.single('lecture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please upload a lecture audio or video file',
      });
    }

    const { path: filePath, originalname, size } = req.file;

    console.log(`📤 Received lecture upload: ${originalname} (${(size / 1024 / 1024).toFixed(2)}MB)`);

    // Create job first to get the ID
    const { createJob } = await import('../services/jobManager');
    const jobId = await createJob(originalname, size);

    // Start processing in background with the job ID
    processLecture(filePath, originalname, jobId)
      .then(async () => {
        console.log(`✅ Lecture processing completed: ${jobId}`);
        // Clean up temp file
        await cleanupFile(filePath);
      })
      .catch(async (error) => {
        console.error(`❌ Lecture processing failed:`, error);
        // Clean up temp file on error
        await cleanupFile(filePath);
      });

    // Return job ID immediately
    res.json({
      success: true,
      jobId,
      status: 'processing',
      message: 'Lecture upload received. Processing has started.',
    });
  } catch (error: any) {
    console.error('Lecture upload error:', error);

    // Clean up file if it exists
    if (req.file?.path) {
      await cleanupFile(req.file.path);
    }

    res.status(500).json({
      error: 'Lecture upload failed',
      message: error.message,
    });
  }
});

/**
 * @openapi
 * /api/lectures/record:
 *   post:
 *     tags:
 *       - Lectures
 *     summary: Process recorded lecture
 *     description: Process a browser-recorded lecture (real-time recording from the UI)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - lecture
 *             properties:
 *               lecture:
 *                 type: string
 *                 format: binary
 *                 description: Recorded lecture audio file
 *               fileName:
 *                 type: string
 *                 description: Custom file name for the recording
 *     responses:
 *       200:
 *         description: Recording received, processing started
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 jobId:
 *                   type: string
 *                   description: Unique job identifier
 *                 status:
 *                   type: string
 *                   example: processing
 *                 message:
 *                   type: string
 *       400:
 *         description: No recording provided
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
router.post('/record', uploadLecture.single('lecture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No recording provided',
        message: 'Please provide a recorded lecture',
      });
    }

    const { path: filePath, size } = req.file;
    const fileName = req.body.fileName || 'Recorded Lecture';

    console.log(`🎙️  Received lecture recording: ${fileName} (${(size / 1024 / 1024).toFixed(2)}MB)`);

    // Create job
    const { createJob } = await import('../services/jobManager');
    const jobId = await createJob(fileName, size);

    // Start processing in the background with the job ID
    processLecture(filePath, fileName, jobId)
      .then(async () => {
        console.log(`✅ Recording processing completed: ${jobId}`);
        await cleanupFile(filePath);
      })
      .catch(async (error) => {
        console.error(`❌ Recording processing failed:`, error);
        await cleanupFile(filePath);
      });

    res.json({
      success: true,
      jobId,
      status: 'processing',
      message: 'Recording received. Processing has started.',
    });
  } catch (error: any) {
    console.error('Recording upload error:', error);

    if (req.file?.path) {
      await cleanupFile(req.file.path);
    }

    res.status(500).json({
      error: 'Recording processing failed',
      message: error.message,
    });
  }
});

/**
 * @openapi
 * /api/lectures/status/{jobId}:
 *   get:
 *     tags:
 *       - Lectures
 *     summary: Get lecture processing status
 *     description: Check the processing status of a lecture job and retrieve results when complete
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job identifier
 *     responses:
 *       200:
 *         description: Job status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/LectureJob'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       description: Lecture data (only present when status is completed)
 *                       properties:
 *                         transcript:
 *                           type: string
 *                         notes:
 *                           type: object
 *       404:
 *         description: Job not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Status check failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/status/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = getJob(jobId);

    if (!job) {
      return res.status(404).json({
        error: 'Job not found',
        message: 'The specified job ID does not exist',
      });
    }

    // Include transcript and notes only if completed
    let data: any = undefined;
    if (job.status === 'completed') {
      data = {
        transcript: job.transcript,
        notes: job.notes,
      };
    }

    res.json({
      jobId: job.jobId,
      status: job.status,
      progress: job.progress,
      stage: job.stage,
      error: job.error,
      fileName: job.fileName,
      duration: job.duration,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      completedAt: job.completedAt,
      data,
    });
  } catch (error: any) {
    console.error('Status check error:', error);
    res.status(500).json({
      error: 'Status check failed',
      message: error.message,
    });
  }
});

/**
 * @openapi
 * /api/lectures/{jobId}/transcript:
 *   get:
 *     tags:
 *       - Lectures
 *     summary: Get lecture transcript
 *     description: Retrieve the full transcript for a completed lecture
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job identifier
 *     responses:
 *       200:
 *         description: Transcript retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 jobId:
 *                   type: string
 *                 transcript:
 *                   type: string
 *                   description: Full lecture transcript
 *       400:
 *         description: Transcript not ready
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Job not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Retrieval failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:jobId/transcript', async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = getJob(jobId);

    if (!job) {
      return res.status(404).json({
        error: 'Job not found',
      });
    }

    if (job.status !== 'completed') {
      return res.status(400).json({
        error: 'Transcript not ready',
        message: `Job status: ${job.status}`,
      });
    }

    const transcript = await loadTranscript(jobId);

    res.json({
      success: true,
      jobId,
      transcript,
    });
  } catch (error: any) {
    console.error('Transcript retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve transcript',
      message: error.message,
    });
  }
});

/**
 * @openapi
 * /api/lectures/{jobId}/notes:
 *   get:
 *     tags:
 *       - Lectures
 *     summary: Get lecture notes
 *     description: Retrieve AI-generated notes for a completed lecture
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job identifier
 *     responses:
 *       200:
 *         description: Notes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 jobId:
 *                   type: string
 *                 notes:
 *                   type: object
 *                   description: AI-generated lecture notes and summary
 *       400:
 *         description: Notes not ready
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Job not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Retrieval failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:jobId/notes', async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = getJob(jobId);

    if (!job) {
      return res.status(404).json({
        error: 'Job not found',
      });
    }

    if (job.status !== 'completed') {
      return res.status(400).json({
        error: 'Notes not ready',
        message: `Job status: ${job.status}`,
      });
    }

    const notes = await loadNotes(jobId);

    res.json({
      success: true,
      jobId,
      notes,
    });
  } catch (error: any) {
    console.error('Notes retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve notes',
      message: error.message,
    });
  }
});

/**
 * @openapi
 * /api/lectures/{jobId}/flashcards:
 *   post:
 *     tags:
 *       - Lectures
 *     summary: Generate flashcards from lecture
 *     description: Create study flashcards from a lecture transcript using AI
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job identifier
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
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
 *                 jobId:
 *                   type: string
 *                 flashcards:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Flashcard'
 *       400:
 *         description: Lecture not ready
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Job not found
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
router.post('/:jobId/flashcards', async (req, res) => {
  try {
    const { jobId } = req.params;
    const { count = 15 } = req.body;

    const job = getJob(jobId);

    if (!job) {
      return res.status(404).json({
        error: 'Job not found',
      });
    }

    if (job.status !== 'completed') {
      return res.status(400).json({
        error: 'Lecture not ready',
        message: `Job status: ${job.status}`,
      });
    }

    // Check if flashcards already exist
    let flashcards = await loadGeneratedContent(jobId, 'flashcards');

    if (!flashcards) {
      // Generate new flashcards
      console.log(`🃏 Generating ${count} flashcards for job ${jobId}`);
      const transcript = await loadTranscript(jobId);
      flashcards = await generateFlashcards(transcript, count);

      // Save for future requests
      await saveGeneratedContent(jobId, 'flashcards', flashcards);
    }

    res.json({
      success: true,
      jobId,
      flashcards,
    });
  } catch (error: any) {
    console.error('Flashcard generation error:', error);
    res.status(500).json({
      error: 'Failed to generate flashcards',
      message: error.message,
    });
  }
});

/**
 * @openapi
 * /api/lectures/{jobId}/quiz:
 *   post:
 *     tags:
 *       - Lectures
 *     summary: Generate quiz from lecture
 *     description: Create quiz questions from a lecture transcript using AI
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job identifier
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
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
 *                 jobId:
 *                   type: string
 *                 questions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/QuizQuestion'
 *       400:
 *         description: Lecture not ready
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Job not found
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
router.post('/:jobId/quiz', async (req, res) => {
  try {
    const { jobId } = req.params;
    const { count = 10 } = req.body;

    const job = getJob(jobId);

    if (!job) {
      return res.status(404).json({
        error: 'Job not found',
      });
    }

    if (job.status !== 'completed') {
      return res.status(400).json({
        error: 'Lecture not ready',
        message: `Job status: ${job.status}`,
      });
    }

    // Check if quiz already exists
    let quiz = await loadGeneratedContent(jobId, 'quiz');

    if (!quiz) {
      // Generate new quiz
      console.log(`📝 Generating ${count} quiz questions for job ${jobId}`);
      const transcript = await loadTranscript(jobId);
      quiz = await generateQuiz(transcript, count);

      // Save for future requests
      await saveGeneratedContent(jobId, 'quiz', quiz);
    }

    res.json({
      success: true,
      jobId,
      questions: quiz,
    });
  } catch (error: any) {
    console.error('Quiz generation error:', error);
    res.status(500).json({
      error: 'Failed to generate quiz',
      message: error.message,
    });
  }
});

/**
 * @openapi
 * /api/lectures/{jobId}:
 *   delete:
 *     tags:
 *       - Lectures
 *     summary: Delete lecture
 *     description: Delete a lecture and all associated files (transcript, notes, flashcards, quiz)
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job identifier
 *     responses:
 *       200:
 *         description: Lecture deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *       404:
 *         description: Job not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Delete failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = getJob(jobId);
    if (!job) {
      return res.status(404).json({
        error: 'Job not found',
      });
    }

    await deleteJob(jobId);

    res.json({
      success: true,
      message: 'Lecture deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete error:', error);
    res.status(500).json({
      error: 'Failed to delete lecture',
      message: error.message,
    });
  }
});

export default router;

