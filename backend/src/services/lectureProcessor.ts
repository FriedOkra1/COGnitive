import fs from 'fs/promises';
import path from 'path';
import {
  createJob,
  updateJobProgress,
  completeJob,
  failJob,
  getJobDir,
  saveTranscript,
  saveNotes,
} from './jobManager';
import {
  validateAudioFile,
  shouldChunkAudio,
  splitAudioIntoChunks,
  cleanupChunks,
  getAudioInfo,
} from './audioProcessor';
import { transcribeAudio, generateLectureNotes } from './openai';
import { ProcessingProgress } from '../types/lecture';

const MAX_RETRIES = 2;

/**
 * Process a lecture recording end-to-end
 */
export async function processLecture(
  audioPath: string,
  fileName?: string,
  existingJobId?: string
): Promise<string> {
  let jobId: string | null = existingJobId || null;

  try {
    // Get audio info
    const audioInfo = await getAudioInfo(audioPath);
    const stats = await fs.stat(audioPath);

    // Create job if not provided
    if (!jobId) {
      jobId = await createJob(fileName, stats.size);
    }
    console.log(`🎓 Processing lecture: ${jobId}`);

    // Validate audio file
    await updateProgress(jobId, 'pending', 5, 'Validating audio file');
    await validateAudioFile(audioPath);

    // Move audio to job directory
    const jobDir = getJobDir(jobId);
    const jobAudioPath = path.join(jobDir, 'audio.webm');
    await fs.copyFile(audioPath, jobAudioPath);

    // Determine if chunking is needed
    const needsChunking = await shouldChunkAudio(jobAudioPath);

    let transcript: string;

    if (needsChunking) {
      console.log('📦 Audio file needs chunking');
      transcript = await processLargeAudio(jobId, jobAudioPath, audioInfo.duration);
    } else {
      console.log('📝 Audio file can be processed directly');
      transcript = await processSmallAudio(jobId, jobAudioPath);
    }

    // Generate notes
    await updateProgress(jobId, 'generating_notes', 70, 'Generating lecture notes');
    const notes = await generateLectureNotes(transcript);

    // Save results
    await saveTranscript(jobId, transcript);
    await saveNotes(jobId, notes);

    // Mark as completed
    await completeJob(jobId, transcript, notes);

    return jobId;
  } catch (error: any) {
    console.error('Lecture processing error:', error);

    if (jobId) {
      await failJob(jobId, error.message);
    }

    throw error;
  }
}

/**
 * Process small audio files directly (< 20 minutes)
 */
async function processSmallAudio(jobId: string, audioPath: string): Promise<string> {
  await updateProgress(jobId, 'transcribing', 30, 'Transcribing audio with Whisper');

  const audioBuffer = await fs.readFile(audioPath);
  const fileName = path.basename(audioPath);

  const transcript = await transcribeAudioWithRetry(audioBuffer, fileName);

  await updateProgress(jobId, 'transcribing', 60, 'Transcription complete');

  return transcript;
}

/**
 * Process large audio files with chunking
 */
async function processLargeAudio(
  jobId: string,
  audioPath: string,
  totalDuration: number
): Promise<string> {
  // Split audio into chunks
  await updateProgress(jobId, 'splitting_audio', 10, 'Splitting audio into chunks');
  const chunks = await splitAudioIntoChunks(jobId, audioPath);

  console.log(`🔪 Split into ${chunks.length} chunks`);

  // Transcribe each chunk
  const transcripts: string[] = [];
  const baseProgress = 20;
  const transcriptionProgressRange = 50; // 20% to 70%

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const chunkProgress =
      baseProgress + (transcriptionProgressRange * (i + 1)) / chunks.length;

    await updateProgress(
      jobId,
      'transcribing',
      chunkProgress,
      `Transcribing chunk ${i + 1}/${chunks.length}`
    );

    const audioBuffer = await fs.readFile(chunk.path);
    const fileName = path.basename(chunk.path);

    const chunkTranscript = await transcribeAudioWithRetry(audioBuffer, fileName);
    transcripts.push(chunkTranscript);

    console.log(`✅ Chunk ${i + 1}/${chunks.length} transcribed (${chunkTranscript.length} chars)`);
  }

  // Combine transcripts
  const fullTranscript = transcripts.join(' ');

  // Cleanup chunks
  await cleanupChunks(jobId);

  return fullTranscript;
}

/**
 * Transcribe audio with retry logic
 */
async function transcribeAudioWithRetry(
  audioBuffer: Buffer,
  fileName: string,
  retries = 0
): Promise<string> {
  try {
    return await transcribeAudio(audioBuffer, fileName);
  } catch (error: any) {
    if (retries < MAX_RETRIES) {
      console.warn(`Transcription failed, retrying (${retries + 1}/${MAX_RETRIES})...`);
      await delay(2000); // Wait 2 seconds before retry
      return transcribeAudioWithRetry(audioBuffer, fileName, retries + 1);
    }
    throw error;
  }
}

/**
 * Helper to update job progress
 */
async function updateProgress(
  jobId: string,
  stage: ProcessingProgress['stage'],
  progress: number,
  message: string
): Promise<void> {
  await updateJobProgress(jobId, { stage, progress, message });
}

/**
 * Delay helper
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

