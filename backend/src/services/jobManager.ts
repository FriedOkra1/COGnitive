import fs from 'fs/promises';
import path from 'path';
import { LectureJob, LectureJobMetadata, JobStatus, ProcessingProgress } from '../types/lecture';

const LECTURES_DIR = path.join(process.cwd(), 'lectures');
const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// In-memory job storage for quick access
const jobs = new Map<string, LectureJob>();

/**
 * Initialize the job manager and ensure directories exist
 */
export async function initializeJobManager(): Promise<void> {
  try {
    await fs.mkdir(LECTURES_DIR, { recursive: true });
    console.log('Job manager initialized');
    
    // Load existing jobs from disk
    await loadExistingJobs();
    
    // Start cleanup routine
    startCleanupRoutine();
  } catch (error) {
    console.error('Failed to initialize job manager:', error);
  }
}

/**
 * Load existing jobs from disk into memory
 */
async function loadExistingJobs(): Promise<void> {
  try {
    const entries = await fs.readdir(LECTURES_DIR);
    
    for (const entry of entries) {
      const jobDir = path.join(LECTURES_DIR, entry);
      const stats = await fs.stat(jobDir);
      
      if (stats.isDirectory()) {
        const metadataPath = path.join(jobDir, 'metadata.json');
        try {
          const metadata = await fs.readFile(metadataPath, 'utf-8');
          const jobData: LectureJobMetadata = JSON.parse(metadata);
          
          jobs.set(entry, {
            ...jobData,
            createdAt: new Date(jobData.createdAt),
            updatedAt: new Date(jobData.updatedAt),
            completedAt: jobData.completedAt ? new Date(jobData.completedAt) : undefined,
          });
        } catch (err) {
          console.warn(`Could not load job ${entry}:`, err);
        }
      }
    }
    
    console.log(`Loaded ${jobs.size} existing jobs`);
  } catch (error) {
    console.warn('No existing jobs to load');
  }
}

/**
 * Create a new lecture job
 */
export async function createJob(fileName?: string, fileSize?: number): Promise<string> {
  const jobId = `lecture-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  
  const job: LectureJob = {
    jobId,
    status: 'pending',
    progress: 0,
    stage: 'Initializing',
    createdAt: new Date(),
    updatedAt: new Date(),
    fileName,
    fileSize,
  };
  
  jobs.set(jobId, job);
  
  // Create job directory
  const jobDir = path.join(LECTURES_DIR, jobId);
  await fs.mkdir(jobDir, { recursive: true });
  await fs.mkdir(path.join(jobDir, 'chunks'), { recursive: true });
  
  // Save metadata
  await saveJobMetadata(jobId);
  
  console.log(`Created job: ${jobId}`);
  return jobId;
}

/**
 * Get a job by ID
 */
export function getJob(jobId: string): LectureJob | undefined {
  return jobs.get(jobId);
}

/**
 * Update job progress
 */
export async function updateJobProgress(
  jobId: string,
  progress: ProcessingProgress
): Promise<void> {
  const job = jobs.get(jobId);
  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }
  
  job.status = progress.stage;
  job.progress = progress.progress;
  job.stage = progress.message;
  job.updatedAt = new Date();
  
  await saveJobMetadata(jobId);
}

/**
 * Mark job as completed
 */
export async function completeJob(
  jobId: string,
  transcript: string,
  notes: any
): Promise<void> {
  const job = jobs.get(jobId);
  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }
  
  job.status = 'completed';
  job.progress = 100;
  job.stage = 'Completed successfully';
  job.completedAt = new Date();
  job.updatedAt = new Date();
  job.transcript = transcript;
  job.notes = notes;
  
  await saveJobMetadata(jobId);
  console.log(`Job completed: ${jobId}`);
}

/**
 * Mark job as failed
 */
export async function failJob(jobId: string, error: string): Promise<void> {
  const job = jobs.get(jobId);
  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }
  
  job.status = 'failed';
  job.error = error;
  job.updatedAt = new Date();
  
  await saveJobMetadata(jobId);
  console.error(`Job failed: ${jobId} - ${error}`);
}

/**
 * Save job metadata to disk
 */
async function saveJobMetadata(jobId: string): Promise<void> {
  const job = jobs.get(jobId);
  if (!job) return;
  
  const metadata: LectureJobMetadata = {
    jobId: job.jobId,
    status: job.status,
    progress: job.progress,
    stage: job.stage,
    error: job.error,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
    completedAt: job.completedAt?.toISOString(),
    fileName: job.fileName,
    duration: job.duration,
    fileSize: job.fileSize,
  };
  
  const jobDir = path.join(LECTURES_DIR, jobId);
  const metadataPath = path.join(jobDir, 'metadata.json');
  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
}

/**
 * Get job directory path
 */
export function getJobDir(jobId: string): string {
  return path.join(LECTURES_DIR, jobId);
}

/**
 * Delete a job and all its files
 */
export async function deleteJob(jobId: string): Promise<void> {
  const jobDir = getJobDir(jobId);
  
  try {
    await fs.rm(jobDir, { recursive: true, force: true });
    jobs.delete(jobId);
    console.log(`Deleted job: ${jobId}`);
  } catch (error) {
    console.error(`Failed to delete job ${jobId}:`, error);
    throw error;
  }
}

/**
 * Start automatic cleanup routine for old jobs
 */
function startCleanupRoutine(): void {
  // Run cleanup every hour
  setInterval(async () => {
    await cleanupOldJobs();
  }, 60 * 60 * 1000);
  
  // Run cleanup on startup
  cleanupOldJobs();
}

/**
 * Clean up jobs older than 24 hours
 */
async function cleanupOldJobs(): Promise<void> {
  const now = Date.now();
  const jobsToDelete: string[] = [];
  
  for (const [jobId, job] of jobs.entries()) {
    const age = now - job.createdAt.getTime();
    if (age > CLEANUP_INTERVAL) {
      jobsToDelete.push(jobId);
    }
  }
  
  if (jobsToDelete.length > 0) {
    console.log(`Cleaning up ${jobsToDelete.length} old jobs`);
    for (const jobId of jobsToDelete) {
      try {
        await deleteJob(jobId);
      } catch (error) {
        console.error(`Failed to cleanup job ${jobId}:`, error);
      }
    }
  }
}

/**
 * Save transcript to disk
 */
export async function saveTranscript(jobId: string, transcript: string): Promise<void> {
  const jobDir = getJobDir(jobId);
  const transcriptPath = path.join(jobDir, 'transcript.txt');
  await fs.writeFile(transcriptPath, transcript, 'utf-8');
}

/**
 * Save notes to disk
 */
export async function saveNotes(jobId: string, notes: any): Promise<void> {
  const jobDir = getJobDir(jobId);
  const notesPath = path.join(jobDir, 'notes.json');
  await fs.writeFile(notesPath, JSON.stringify(notes, null, 2));
}

/**
 * Load transcript from disk
 */
export async function loadTranscript(jobId: string): Promise<string> {
  const jobDir = getJobDir(jobId);
  const transcriptPath = path.join(jobDir, 'transcript.txt');
  return await fs.readFile(transcriptPath, 'utf-8');
}

/**
 * Load notes from disk
 */
export async function loadNotes(jobId: string): Promise<any> {
  const jobDir = getJobDir(jobId);
  const notesPath = path.join(jobDir, 'notes.json');
  const data = await fs.readFile(notesPath, 'utf-8');
  return JSON.parse(data);
}

/**
 * Save generated content (flashcards or quiz)
 */
export async function saveGeneratedContent(
  jobId: string,
  type: 'flashcards' | 'quiz',
  content: any
): Promise<void> {
  const jobDir = getJobDir(jobId);
  const filePath = path.join(jobDir, `${type}.json`);
  await fs.writeFile(filePath, JSON.stringify(content, null, 2));
}

/**
 * Load generated content (flashcards or quiz)
 */
export async function loadGeneratedContent(
  jobId: string,
  type: 'flashcards' | 'quiz'
): Promise<any | null> {
  const jobDir = getJobDir(jobId);
  const filePath = path.join(jobDir, `${type}.json`);
  
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return null; // File doesn't exist yet
  }
}

