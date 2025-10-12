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

// Chat API
export async function sendChatMessage(messages: ChatMessage[], context?: string): Promise<string> {
  try {
    const response = await apiClient.post<ChatResponse>('/api/chat', {
      messages,
      context,
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

// Health check
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await apiClient.get('/health');
    return response.data.status === 'ok';
  } catch (error) {
    return false;
  }
}

