export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string } }>;
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

export interface ErrorResponse {
  error: string;
  message: string;
}

