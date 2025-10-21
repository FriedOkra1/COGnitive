import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs/promises';
import path from 'path';
import { getJobDir } from './jobManager';

const CHUNK_DURATION_SECONDS = 20 * 60; // 20 minutes per chunk
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB max file size
const MAX_DURATION_SECONDS = 2.5 * 60 * 60; // 2.5 hours max

export interface AudioInfo {
  duration: number; // in seconds
  fileSize: number; // in bytes
  format: string;
}

export interface AudioChunk {
  path: string;
  index: number;
  startTime: number; // in seconds
  duration: number; // in seconds
}

/**
 * Get audio file information
 */
export async function getAudioInfo(filePath: string): Promise<AudioInfo> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(new Error(`Failed to probe audio file: ${err.message}`));
        return;
      }

      const duration = metadata.format.duration || 0;
      const fileSize = metadata.format.size || 0;
      const format = metadata.format.format_name || 'unknown';

      resolve({ duration, fileSize, format });
    });
  });
}

/**
 * Validate audio file before processing
 */
export async function validateAudioFile(filePath: string): Promise<void> {
  const stats = await fs.stat(filePath);
  
  if (stats.size > MAX_FILE_SIZE) {
    throw new Error(`File too large: ${(stats.size / 1024 / 1024).toFixed(2)}MB (max: 500MB)`);
  }
  
  const info = await getAudioInfo(filePath);
  
  if (info.duration > MAX_DURATION_SECONDS) {
    const hours = (info.duration / 3600).toFixed(1);
    throw new Error(`Audio too long: ${hours} hours (max: 2.5 hours)`);
  }
}

/**
 * Check if audio file needs to be chunked
 * Files larger than ~20MB or longer than 20 minutes should be chunked
 */
export async function shouldChunkAudio(filePath: string): Promise<boolean> {
  const info = await getAudioInfo(filePath);
  const stats = await fs.stat(filePath);
  
  // Chunk if duration > 20 minutes OR file size > 20MB
  return info.duration > CHUNK_DURATION_SECONDS || stats.size > 20 * 1024 * 1024;
}

/**
 * Split audio file into chunks
 */
export async function splitAudioIntoChunks(
  jobId: string,
  audioPath: string
): Promise<AudioChunk[]> {
  const info = await getAudioInfo(audioPath);
  const jobDir = getJobDir(jobId);
  const chunksDir = path.join(jobDir, 'chunks');
  
  // Calculate number of chunks needed
  const numChunks = Math.ceil(info.duration / CHUNK_DURATION_SECONDS);
  const chunks: AudioChunk[] = [];
  
  console.log(`Splitting audio into ${numChunks} chunks of ${CHUNK_DURATION_SECONDS / 60} minutes each`);
  
  for (let i = 0; i < numChunks; i++) {
    const startTime = i * CHUNK_DURATION_SECONDS;
    const chunkPath = path.join(chunksDir, `chunk-${i}.webm`);
    
    await splitAudioChunk(audioPath, chunkPath, startTime, CHUNK_DURATION_SECONDS);
    
    const chunkInfo = await getAudioInfo(chunkPath);
    chunks.push({
      path: chunkPath,
      index: i,
      startTime,
      duration: chunkInfo.duration,
    });
    
    console.log(`Created chunk ${i + 1}/${numChunks}: ${chunkInfo.duration.toFixed(1)}s`);
  }
  
  return chunks;
}

/**
 * Split a single audio chunk using ffmpeg
 */
function splitAudioChunk(
  inputPath: string,
  outputPath: string,
  startTime: number,
  duration: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .setStartTime(startTime)
      .setDuration(duration)
      .audioCodec('libopus') // Use Opus codec for WebM
      .audioBitrate('64k') // Lower bitrate to reduce file size
      .audioFrequency(16000) // 16kHz is sufficient for speech (Whisper requirement)
      .audioChannels(1) // Mono audio
      .output(outputPath)
      .on('end', () => resolve())
      .on('error', (err) => reject(new Error(`FFmpeg error: ${err.message}`)))
      .run();
  });
}

/**
 * Clean up chunk files after processing
 */
export async function cleanupChunks(jobId: string): Promise<void> {
  const jobDir = getJobDir(jobId);
  const chunksDir = path.join(jobDir, 'chunks');
  
  try {
    const files = await fs.readdir(chunksDir);
    for (const file of files) {
      const filePath = path.join(chunksDir, file);
      await fs.unlink(filePath);
    }
    console.log(`Cleaned up ${files.length} audio chunks`);
  } catch (error) {
    console.warn('Failed to cleanup chunks:', error);
  }
}

/**
 * Convert uploaded audio to optimal format for Whisper
 */
export async function convertAudioForWhisper(
  inputPath: string,
  outputPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .audioCodec('libopus')
      .audioBitrate('64k')
      .audioFrequency(16000)
      .audioChannels(1)
      .output(outputPath)
      .on('end', () => {
        console.log('Audio converted for Whisper');
        resolve();
      })
      .on('error', (err) => reject(new Error(`Audio conversion failed: ${err.message}`)))
      .run();
  });
}

