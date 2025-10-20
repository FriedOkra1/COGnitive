import express from 'express';
import { chatCompletion } from '../services/openai';
import { ChatRequest, ChatResponse, ErrorResponse } from '../types';

const router = express.Router();

/**
 * @openapi
 * /api/chat:
 *   post:
 *     tags:
 *       - Chat
 *     summary: Send chat message
 *     description: Send a message to the AI assistant with optional context and images for multimodal conversations
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - messages
 *             properties:
 *               messages:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/ChatMessage'
 *                 description: Array of conversation messages
 *               context:
 *                 type: string
 *                 description: Optional context about the content being discussed
 *                 example: "a document about machine learning"
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of base64-encoded image URLs for vision analysis
 *     responses:
 *       200:
 *         description: Successful response from AI
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: AI assistant's response
 *                 role:
 *                   type: string
 *                   example: assistant
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', async (req, res) => {
  try {
    const { messages, context, images } = req.body as ChatRequest;

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

    // Process messages with images if provided
    let processedMessages = [...messages];
    
    // If images are provided, add them to the last user message
    if (images && images.length > 0 && processedMessages.length > 0) {
      const lastMessageIndex = processedMessages.length - 1;
      const lastMessage = processedMessages[lastMessageIndex];
      
      if (lastMessage.role === 'user' && typeof lastMessage.content === 'string') {
        // Convert to vision format with text and images
        const contentArray: Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string } }> = [
          { type: 'text', text: lastMessage.content }
        ];
        
        // Add all images
        images.forEach(imageUrl => {
          contentArray.push({
            type: 'image_url',
            image_url: { url: imageUrl }
          });
        });
        
        processedMessages[lastMessageIndex] = {
          ...lastMessage,
          content: contentArray
        };
      }
    }

    const messagesWithSystem = [systemMessage, ...processedMessages];

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

