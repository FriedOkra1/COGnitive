import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

/**
 * Generate flashcards from transcript text
 */
export async function generateFlashcards(
  transcript: string,
  count: number = 15
): Promise<Flashcard[]> {
  try {
    const prompt = `You are an educational content creator. Based on the following video transcript, create ${count} flashcards to help students learn and remember the key concepts.

Create a mix of three types of flashcards:
1. **Basic** (term/definition): Simple vocabulary or concept definitions
2. **Concept** (concept/explanation): Deeper explanations of ideas or processes
3. **QA** (question/answer): Questions that test understanding

Distribute them roughly equally among the three types.

Transcript:
${transcript.substring(0, 12000)} ${transcript.length > 12000 ? '...(truncated)' : ''}

Return ONLY a valid JSON array with this exact structure:
[
  {
    "type": "basic",
    "front": "Term or concept",
    "back": "Definition or explanation"
  },
  {
    "type": "concept",
    "front": "Concept name",
    "back": "Detailed explanation"
  },
  {
    "type": "qa",
    "front": "Question about the content",
    "back": "Answer to the question"
  }
]

Make sure flashcards cover the most important topics from the video comprehensively.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert educational content creator. Always return valid JSON arrays only, with no additional text.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse the response
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      throw new Error('Failed to parse OpenAI response as JSON');
    }

    // Handle both array and object with array property
    let flashcardsData = Array.isArray(parsed) ? parsed : parsed.flashcards || [];

    // Validate that we have flashcards
    if (!Array.isArray(flashcardsData) || flashcardsData.length === 0) {
      throw new Error('No flashcards generated. The content may be too short or unclear.');
    }

    // Add IDs to flashcards and filter out invalid ones
    const flashcards: Flashcard[] = flashcardsData
      .filter((card: any) => card.front && card.back) // Only keep valid cards
      .map((card: any, index: number) => ({
        id: `flashcard-${Date.now()}-${index}`,
        type: card.type || 'basic',
        front: card.front.trim(),
        back: card.back.trim(),
      }));

    if (flashcards.length === 0) {
      throw new Error('Failed to generate valid flashcards. Please ensure your content has sufficient information.');
    }

    return flashcards;
  } catch (error: any) {
    console.error('Flashcard generation error:', error);
    throw new Error(`Failed to generate flashcards: ${error.message}`);
  }
}

/**
 * Generate quiz questions from transcript text
 */
export async function generateQuiz(
  transcript: string,
  count: number = 10
): Promise<QuizQuestion[]> {
  try {
    const prompt = `You are an educational assessment creator. Based on the following video transcript, create ${count} quiz questions to test student understanding.

Create a mix of three question types:
1. **Multiple Choice**: 4 options (A, B, C, D), only one correct
2. **True/False**: Statement that is either true or false
3. **Short Answer**: Open-ended question requiring a brief written response

Distribute questions roughly equally among types (but ensure good variety).

Transcript:
${transcript.substring(0, 12000)} ${transcript.length > 12000 ? '...(truncated)' : ''}

Return ONLY a valid JSON array with this exact structure:
[
  {
    "type": "multiple_choice",
    "question": "What is the main concept?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Brief explanation of why this is correct"
  },
  {
    "type": "true_false",
    "question": "Statement to evaluate",
    "options": ["True", "False"],
    "correctAnswer": "True",
    "explanation": "Why this statement is true/false"
  },
  {
    "type": "short_answer",
    "question": "Explain the concept",
    "correctAnswer": "Expected answer or key points",
    "explanation": "What a good answer should include"
  }
]

For multiple_choice, correctAnswer should be the index (0-3).
For true_false, correctAnswer should be "True" or "False".
For short_answer, correctAnswer should be an example of a good answer.

Focus on important concepts and ensure questions test real understanding, not just memorization.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert educational assessment creator. Always return valid JSON arrays only, with no additional text.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse the response
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      throw new Error('Failed to parse OpenAI response as JSON');
    }

    // Handle both array and object with array property
    let questionsData = Array.isArray(parsed) ? parsed : parsed.questions || [];

    // Validate that we have questions
    if (!Array.isArray(questionsData) || questionsData.length === 0) {
      throw new Error('No quiz questions generated. The content may be too short or unclear.');
    }

    // Add IDs to questions and filter out invalid ones
    const questions: QuizQuestion[] = questionsData
      .filter((q: any) => q.question && q.correctAnswer !== undefined) // Only keep valid questions
      .map((q: any, index: number) => ({
        id: `quiz-${Date.now()}-${index}`,
        type: q.type || 'multiple_choice',
        question: q.question.trim(),
        options: q.options || undefined,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || '',
      }));

    if (questions.length === 0) {
      throw new Error('Failed to generate valid quiz questions. Please ensure your content has sufficient information.');
    }

    return questions;
  } catch (error: any) {
    console.error('Quiz generation error:', error);
    throw new Error(`Failed to generate quiz: ${error.message}`);
  }
}

