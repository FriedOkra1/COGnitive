import express from 'express';
import { chatCompletion } from '../services/openai';
import { ChatRequest, ChatResponse, ErrorResponse } from '../types';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { messages, context } = req.body as ChatRequest;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Messages array is required',
      } as ErrorResponse);
    }

    // Add system message with context if provided
    const systemMessage = context
      ? {
          role: 'system' as const,
          content: `You are a helpful AI study assistant. The user is working with ${context}. Help them understand the content, answer questions, and assist with their studies.`,
        }
      : {
          role: 'system' as const,
          content: 'You are a helpful AI study assistant. Help users with their questions and provide educational support.',
        };

    const messagesWithSystem = [systemMessage, ...messages];

    const responseMessage = await chatCompletion(messagesWithSystem);

    res.json({
      message: responseMessage,
      role: 'assistant',
    } as ChatResponse);
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Chat failed',
      message: error.message,
    } as ErrorResponse);
  }
});

export default router;

