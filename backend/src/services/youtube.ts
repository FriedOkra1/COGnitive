import { YoutubeTranscript } from 'youtube-transcript';
import fs from 'fs';
import path from 'path';
import { transcribeAudio } from './openai';

export interface TranscriptSegment {
  text: string;
  offset: number;
  duration: number;
}

export interface VideoAnalysis {
  videoId: string;
  title: string;
  transcript: string;
  transcriptSegments: TranscriptSegment[];
}

/**
 * Extract YouTube video ID from various URL formats
 */
export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?\/]+)/,
    /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Get transcript from YouTube video using available methods
 */
export async function getVideoTranscript(videoId: string): Promise<{ 
  transcript: string; 
  title: string;
  duration: number;
  method: 'captions' | 'manual';
}> {
  console.log(`Attempting to get transcript for video: ${videoId}`);
  
  // Try captions first (fast and free)
  try {
    console.log('Trying caption-based transcript extraction...');
    const captionData = await YoutubeTranscript.fetchTranscript(videoId);
    
    if (captionData && captionData.length > 0) {
      const transcript = captionData.map(item => item.text).join(' ');
      
      console.log(`Caption extraction successful: ${transcript.length} characters`);
      
      return {
        transcript,
        title: 'YouTube Video',
        duration: 0,
        method: 'captions'
      };
    }
  } catch (captionError: any) {
    console.log(`Caption extraction failed: ${captionError.message}`);
  }
  
  // If captions fail, provide helpful error message with alternatives
  throw new Error(
    'This video does not have captions/subtitles available for automatic extraction. ' +
    'YouTube has restrictions that prevent downloading audio from most videos. ' +
    'Please try:\n\n' +
    '1. A different video that has captions enabled\n' +
    '2. Educational videos from channels like TED-Ed, Khan Academy, or Crash Course\n' +
    '3. Videos where the creator has enabled auto-generated captions\n\n' +
    'You can check if a video has captions by clicking the CC button on YouTube.'
  );
}

/**
 * Format timestamp from seconds to readable format
 */
export function formatTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Manual transcript input for videos without captions
 */
export async function processManualTranscript(transcript: string, title: string = 'YouTube Video'): Promise<{
  transcript: string;
  title: string;
  duration: number;
  method: 'manual';
}> {
  if (!transcript.trim()) {
    throw new Error('Transcript cannot be empty');
  }

  return {
    transcript: transcript.trim(),
    title,
    duration: 0,
    method: 'manual'
  };
}