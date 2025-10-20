import OpenAI from 'openai';
import { ChatMessage } from '../types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function chatCompletion(messages: ChatMessage[]): Promise<string> {
  try {
    // Type assertion for OpenAI SDK compatibility
    const apiMessages = messages as any[];
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: apiMessages,
      temperature: 0.7,
      // No max_tokens limit - allow model to use its full capacity
    });

    const content = response.choices[0]?.message?.content;
    
    // Validate response is not empty or whitespace only
    if (!content || content.trim().length === 0) {
      console.error('Empty response from OpenAI');
      return 'I apologize, but I received an empty response. Please try rephrasing your question or try again.';
    }

    return content;
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

export interface LectureNotes {
  summary: string;
  keyPoints: string[];
  detailedNotes: string;
  topics: string[];
  actionItems?: string[];
}

export async function generateLectureNotes(transcript: string): Promise<LectureNotes> {
  try {
    const prompt = `You are an expert educational note-taker. Analyze the following lecture transcript and create comprehensive study notes.

Transcript:
${transcript.substring(0, 50000)} ${transcript.length > 50000 ? '...(truncated for length)' : ''}

Create structured notes with:
1. A concise summary (2-3 paragraphs) of the entire lecture
2. 5-10 key points or takeaways
3. Detailed notes organized by topics/sections
4. List of main topics covered
5. Action items or recommended follow-up activities

Return ONLY a valid JSON object with this structure:
{
  "summary": "Comprehensive overview of the lecture...",
  "keyPoints": ["Key point 1", "Key point 2", ...],
  "detailedNotes": "Detailed notes with sections and explanations...",
  "topics": ["Topic 1", "Topic 2", ...],
  "actionItems": ["Action 1", "Action 2", ...]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert educational note-taker. Always return valid JSON objects only, with no additional text.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.5,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const notes: LectureNotes = JSON.parse(content);
    return notes;
  } catch (error: any) {
    console.error('Lecture notes generation error:', error);
    throw new Error(`Failed to generate lecture notes: ${error.message}`);
  }
}

