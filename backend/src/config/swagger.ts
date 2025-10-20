import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'COGnitive API',
    version: '1.0.0',
    description: 'REST API for COGnitive - An AI-powered study companion with lecture recording, document processing, YouTube analysis, and intelligent chat capabilities.',
    contact: {
      name: 'COGnitive Team',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'http://localhost:3001',
      description: 'Development server',
    },
    {
      url: 'https://your-production-url.com',
      description: 'Production server (replace with actual URL)',
    },
  ],
  tags: [
    {
      name: 'Health',
      description: 'Health check endpoints',
    },
    {
      name: 'Chat',
      description: 'AI chat and conversation endpoints',
    },
    {
      name: 'Upload',
      description: 'File upload and processing endpoints',
    },
    {
      name: 'Lectures',
      description: 'Lecture recording and processing endpoints',
    },
    {
      name: 'YouTube',
      description: 'YouTube video analysis endpoints',
    },
  ],
  components: {
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Error type or title',
          },
          message: {
            type: 'string',
            description: 'Detailed error message',
          },
        },
      },
      ChatMessage: {
        type: 'object',
        properties: {
          role: {
            type: 'string',
            enum: ['user', 'assistant', 'system'],
            description: 'The role of the message sender',
          },
          content: {
            oneOf: [
              { type: 'string' },
              {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    type: {
                      type: 'string',
                      enum: ['text', 'image_url'],
                    },
                    text: { type: 'string' },
                    image_url: {
                      type: 'object',
                      properties: {
                        url: { type: 'string' },
                      },
                    },
                  },
                },
              },
            ],
            description: 'Message content (text or multimodal)',
          },
        },
        required: ['role', 'content'],
      },
      Flashcard: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Unique flashcard identifier',
          },
          type: {
            type: 'string',
            enum: ['basic', 'concept', 'qa'],
            description: 'Type of flashcard',
          },
          front: {
            type: 'string',
            description: 'Front of the flashcard (question/prompt)',
          },
          back: {
            type: 'string',
            description: 'Back of the flashcard (answer/explanation)',
          },
        },
      },
      QuizQuestion: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Unique question identifier',
          },
          type: {
            type: 'string',
            enum: ['multiple_choice', 'true_false', 'short_answer'],
            description: 'Type of quiz question',
          },
          question: {
            type: 'string',
            description: 'The quiz question',
          },
          options: {
            type: 'array',
            items: { type: 'string' },
            description: 'Answer options (for multiple choice)',
          },
          correctAnswer: {
            oneOf: [{ type: 'string' }, { type: 'number' }],
            description: 'The correct answer',
          },
          explanation: {
            type: 'string',
            description: 'Explanation of the correct answer',
          },
        },
      },
      LectureJob: {
        type: 'object',
        properties: {
          jobId: {
            type: 'string',
            description: 'Unique job identifier',
          },
          status: {
            type: 'string',
            enum: ['processing', 'completed', 'failed'],
            description: 'Current job status',
          },
          progress: {
            type: 'number',
            minimum: 0,
            maximum: 100,
            description: 'Processing progress percentage',
          },
          stage: {
            type: 'string',
            description: 'Current processing stage',
          },
          fileName: {
            type: 'string',
            description: 'Original lecture file name',
          },
          duration: {
            type: 'number',
            description: 'Lecture duration in seconds',
          },
          error: {
            type: 'string',
            description: 'Error message if status is failed',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
          completedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
    },
    securitySchemes: {
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
        description: 'API key for authentication (if implemented)',
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts', './src/index.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);

