import OpenAI from 'openai';
import { ChatMessage } from '../types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function chatCompletion(messages: ChatMessage[]): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.7,
      // No max_tokens limit - allow model to use its full capacity
    });

    return response.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    throw new Error(`OpenAI API error: ${error.message}`);
  }
}

export async function transcribeAudio(audioBuffer: Buffer, filename: string): Promise<string> {
  try {
    // Create a File-like object for OpenAI
    const file = new File([audioBuffer], filename, { type: 'audio/webm' });
    
    const response = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'en',
    });

    return response.text;
  } catch (error: any) {
    console.error('Whisper API error:', error);
    throw new Error(`Transcription error: ${error.message}`);
  }
}

export async function generateSummary(text: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful study assistant. Create a comprehensive summary with key points from the provided text.',
        },
        {
          role: 'user',
          content: `Please summarize this content:\n\n${text}`,
        },
      ],
      temperature: 0.5,
      // No max_tokens limit for summary - allow full comprehensive summaries
    });

    return response.choices[0]?.message?.content || 'Could not generate summary.';
  } catch (error: any) {
    console.error('OpenAI summary error:', error);
    throw new Error(`Summary generation error: ${error.message}`);
  }
}

