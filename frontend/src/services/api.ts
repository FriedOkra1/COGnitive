import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  context?: string;
  images?: string[];
}

export interface ChatResponse {
  message: string;
  role: 'assistant';
}

export interface UploadDocumentResponse {
  success: boolean;
  text: string;
  fileName: string;
  summary?: string;
}

export interface UploadAudioResponse {
  success: boolean;
  transcription: string;
}

export interface UploadImageResponse {
  success: boolean;
  imageData: string;
  fileName: string;
  mimeType: string;
}

// YouTube interfaces
export interface Flashcard {
  id: string;
  type: 'basic' | 'concept' | 'qa';
  front: string;
  back: string;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
}

export interface TranscriptSegment {
  text: string;
  offset: number;
  duration: number;
}

export interface YouTubeAnalysisResponse {
  success: boolean;
  videoId: string;
  title: string;
  transcript: string;
  summary: string;
  segments: TranscriptSegment[];
}

export interface FlashcardsResponse {
  success: boolean;
  flashcards: Flashcard[];
  count: number;
}

export interface QuizResponse {
  success: boolean;
  questions: QuizQuestion[];
  count: number;
}

// Chat API
export async function sendChatMessage(messages: ChatMessage[], context?: string, images?: string[]): Promise<string> {
  try {
    const response = await apiClient.post<ChatResponse>('/api/chat', {
      messages,
      context,
      images,
    } as ChatRequest);
    return response.data.message;
  } catch (error: any) {
    console.error('Chat API error:', error);
    throw new Error(error.response?.data?.message || 'Failed to send message');
  }
}

// Document upload API
export async function uploadDocument(file: File): Promise<UploadDocumentResponse> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<UploadDocumentResponse>('/api/upload/document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Document upload error:', error);
    throw new Error(error.response?.data?.message || 'Failed to upload document');
  }
}

// Audio upload API
export async function uploadAudio(audioBlob: Blob, fileName: string = 'recording.webm'): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, fileName);

    const response = await apiClient.post<UploadAudioResponse>('/api/upload/audio', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.transcription;
  } catch (error: any) {
    console.error('Audio upload error:', error);
    throw new Error(error.response?.data?.message || 'Failed to transcribe audio');
  }
}

// Image upload API
export async function uploadImage(file: File): Promise<UploadImageResponse> {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.post<UploadImageResponse>('/api/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Image upload error:', error);
    throw new Error(error.response?.data?.message || 'Failed to upload image');
  }
}

// Health check
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await apiClient.get('/health');
    return response.data.status === 'ok';
  } catch (error) {
    return false;
  }
}

// YouTube API
export async function analyzeYouTubeVideo(url: string): Promise<YouTubeAnalysisResponse> {
  try {
    const response = await apiClient.post<YouTubeAnalysisResponse>('/api/youtube/analyze', {
      url,
    }, {
      timeout: 180000, // 3 minutes timeout for audio download + transcription
    });
    return response.data;
  } catch (error: any) {
    console.error('YouTube analyze error:', error);
    throw new Error(error.response?.data?.message || 'Failed to analyze YouTube video');
  }
}

export async function generateFlashcards(transcript: string, count: number = 15): Promise<Flashcard[]> {
  try {
    const response = await apiClient.post<FlashcardsResponse>('/api/youtube/flashcards', {
      transcript,
      count,
    });
    return response.data.flashcards;
  } catch (error: any) {
    console.error('Flashcard generation error:', error);
    throw new Error(error.response?.data?.message || 'Failed to generate flashcards');
  }
}

export async function generateQuiz(transcript: string, count: number = 10): Promise<QuizQuestion[]> {
  try {
    const response = await apiClient.post<QuizResponse>('/api/youtube/quiz', {
      transcript,
      count,
    });
    return response.data.questions;
  } catch (error: any) {
    console.error('Quiz generation error:', error);
    throw new Error(error.response?.data?.message || 'Failed to generate quiz');
  }
}

