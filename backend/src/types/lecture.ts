export type JobStatus = 'pending' | 'splitting_audio' | 'transcribing' | 'generating_notes' | 'completed' | 'failed';

export interface LectureJob {
  jobId: string;
  status: JobStatus;
  progress: number; // 0-100
  stage: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  
  // Metadata
  fileName?: string;
  duration?: number; // in seconds
  fileSize?: number; // in bytes
  
  // Results
  transcript?: string;
  notes?: LectureNotes;
}

export interface LectureNotes {
  summary: string;
  keyPoints: string[];
  detailedNotes: string;
  topics: string[];
  actionItems?: string[];
}

export interface LectureJobMetadata {
  jobId: string;
  status: JobStatus;
  progress: number;
  stage: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  fileName?: string;
  duration?: number;
  fileSize?: number;
}

export interface ProcessingProgress {
  stage: JobStatus;
  progress: number;
  message: string;
}

