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

export interface ErrorResponse {
  error: string;
  message: string;
}

