# COGnitive Architecture

## Overview

COGnitive is a full-stack TypeScript application that provides AI-powered study assistance through lecture recording, document processing, YouTube analysis, and intelligent chat capabilities. The application follows a client-server architecture with a React frontend and Express backend.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Vite + React)               │
│  ┌────────────┬──────────────┬─────────────┬──────────────┐ │
│  │ Lecture    │ Chat         │ YouTube     │ Document     │ │
│  │ Recording  │ Interface    │ Analyzer    │ Upload       │ │
│  └────────────┴──────────────┴─────────────┴──────────────┘ │
│                              │                                │
│                        API Service Layer                      │
└──────────────────────────────┼───────────────────────────────┘
                               │ HTTP/REST
┌──────────────────────────────┼───────────────────────────────┐
│                              │                                │
│                    Express.js Backend                         │
│  ┌────────────┬──────────────┬─────────────┬──────────────┐ │
│  │ Route      │ Middleware   │ Services    │ Job          │ │
│  │ Handlers   │ (Upload)     │             │ Manager      │ │
│  └────────────┴──────────────┴─────────────┴──────────────┘ │
│                              │                                │
└──────────────────────────────┼───────────────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
              ┌─────▼─────┐        ┌─────▼────┐
              │  OpenAI   │        │  Local   │
              │    API    │        │  Files   │
              │           │        │          │
              │ • GPT-4o  │        │ • Uploads│
              │ • Whisper │        │ • Temp   │
              └───────────┘        │ • Lectures│
                                   └──────────┘
```

## Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5 (fast development and optimized production builds)
- **Styling**: Tailwind CSS for utility-first styling
- **HTTP Client**: Axios for API communication
- **Markdown Rendering**: react-markdown with KaTeX for math support
- **UI Components**: Custom retro-styled Macintosh System 6 components

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **API Documentation**: Swagger/OpenAPI 3.0
- **File Upload**: Multer for multipart/form-data handling
- **Document Processing**:
  - `pdf-parse` for PDF text extraction
  - `mammoth` for DOCX text extraction
- **Audio/Video Processing**: 
  - `fluent-ffmpeg` for media file manipulation
  - `ytdl-core` & `@distube/ytdl-core` for YouTube downloads
  - `youtube-transcript` for caption extraction
- **AI Services**: OpenAI API (GPT-4o-mini, Whisper)

## Core Components

### Frontend Architecture

```
src/
├── components/
│   ├── LectureRecording.tsx    # Recording interface & upload
│   ├── ChatInterface.tsx        # Main chat UI with multimodal support
│   ├── YouTubeAnalyzer.tsx     # YouTube video analysis
│   ├── FlashcardViewer.tsx     # Interactive flashcard display
│   ├── QuizViewer.tsx          # Quiz interface with scoring
│   └── icons/                   # Pixel art retro icons
├── services/
│   └── api.ts                   # API client with typed requests
├── App.tsx                      # Main application shell
└── main.tsx                     # Application entry point
```

**Key Frontend Patterns**:
- **Component State Management**: React hooks (useState, useEffect, useRef)
- **API Integration**: Centralized API service with TypeScript interfaces
- **File Handling**: FormData for multipart uploads, FileReader for local processing
- **Real-time Updates**: Polling for job status on long-running tasks
- **Session Persistence**: In-memory state management (clears on tab close)

### Backend Architecture

```
src/
├── routes/
│   ├── chat.ts          # Chat endpoint with context support
│   ├── upload.ts        # Document, audio, image uploads
│   ├── youtube.ts       # YouTube analysis & content generation
│   └── lectures.ts      # Lecture processing & management
├── services/
│   ├── openai.ts               # OpenAI API wrapper
│   ├── lectureProcessor.ts     # Audio transcription & note generation
│   ├── audioProcessor.ts       # Audio chunking for large files
│   ├── contentGenerator.ts     # Flashcard & quiz generation
│   ├── documentProcessor.ts    # Text extraction from documents
│   ├── youtube.ts              # YouTube download & transcription
│   └── jobManager.ts           # Async job tracking
├── middleware/
│   └── upload.ts        # Multer configuration for file types
├── types/
│   ├── index.ts         # Shared type definitions
│   └── lecture.ts       # Lecture-specific types
└── index.ts             # Server setup & routing
```

**Key Backend Patterns**:
- **Layered Architecture**: Routes → Services → External APIs
- **Async Job Processing**: Background processing for long-running tasks
- **Error Handling**: Centralized error middleware
- **Type Safety**: TypeScript interfaces for all data structures
- **File Management**: Automatic cleanup of temporary files

## Data Flow

### Lecture Recording Flow

1. **Upload**: User uploads/records audio → Frontend sends to `/api/lectures/upload` or `/api/lectures/record`
2. **Job Creation**: Backend creates job with unique ID, returns immediately
3. **Background Processing**:
   - Save audio file to disk
   - Split audio into 25MB chunks (OpenAI limit)
   - Transcribe each chunk with Whisper API
   - Combine transcripts
   - Generate AI notes with GPT-4o
   - Save transcript and notes to disk
4. **Status Polling**: Frontend polls `/api/lectures/status/:jobId` for progress
5. **Completion**: When complete, frontend displays transcript and notes
6. **Content Generation**: User can generate flashcards/quiz from transcript

### Chat Flow with Context

1. **User Input**: User types message with optional uploaded documents/images
2. **Context Building**: Frontend includes conversation history and content context
3. **API Request**: POST to `/api/chat` with messages array and context
4. **AI Processing**: 
   - Backend adds system message with context
   - Sends to GPT-4o-mini (vision-capable model)
   - Streams or returns complete response
5. **Display**: Frontend appends response to conversation

### YouTube Analysis Flow

1. **URL Submission**: User pastes YouTube URL
2. **Video ID Extraction**: Backend extracts video ID from URL
3. **Transcript Retrieval**:
   - Try to fetch captions (fast, free)
   - Fallback: Download audio and transcribe with Whisper (slower, costs API credits)
4. **AI Summary**: Generate summary with GPT-4o
5. **Display**: Show transcript and summary
6. **Optional**: Generate flashcards or quiz from transcript

## AI Integration

### OpenAI API Usage

**GPT-4o-mini** (Chat Completions):
- General chat responses
- Document summarization
- Note generation from transcripts
- Flashcard generation (structured JSON output)
- Quiz generation (structured JSON output)

**Whisper** (Speech-to-Text):
- Audio transcription from lectures
- YouTube video transcription (when captions unavailable)
- Voice input transcription

**Token Management**:
- Transcript chunking for long content
- Context window management (8,192 tokens for GPT-4o-mini)
- Cost optimization with GPT-4o-mini over GPT-4

## Security Considerations

### Current Implementation
- CORS configured for specific origins
- File upload size limits (50MB JSON, configurable file size)
- File type validation (MIME type checking)
- Temporary file cleanup after processing
- Environment variables for sensitive data (API keys)

### Production Recommendations
- Add rate limiting (e.g., express-rate-limit)
- Implement user authentication (JWT, OAuth)
- Add request validation middleware (express-validator)
- Use HTTPS in production
- Implement API key rotation
- Add input sanitization for user content
- Set up monitoring and logging (e.g., Winston, Sentry)

## Scalability Considerations

### Current Limitations
- In-memory job tracking (lost on server restart)
- Local file storage (disk space constraints)
- Synchronous processing (single-threaded)
- No caching layer

### Scaling Recommendations

**Database Layer**:
- Add PostgreSQL or MongoDB for job persistence
- Store user data, lecture metadata, and generated content
- Implement proper indexing for fast lookups

**File Storage**:
- Migrate to S3 or Cloudflare R2 for lecture files
- CDN for static assets
- Implement cleanup policies (e.g., delete after 30 days)

**Processing**:
- Implement queue system (Bull, RabbitMQ, Redis)
- Use worker processes for background jobs
- Horizontal scaling with load balancer

**Caching**:
- Redis for job status and session data
- Cache AI-generated content (flashcards, quizzes)
- CDN for frontend assets

**Monitoring**:
- Application metrics (CPU, memory, response times)
- AI API usage tracking and alerts
- Error tracking and alerting

## Deployment Architecture

### Recommended Production Setup

```
┌──────────────┐
│   Vercel     │  Frontend (React/Vite)
│   CDN       │  - Global edge network
└──────┬───────┘  - Auto-scaling
       │          - Zero-config SSL
       │
       │ HTTPS
       │
┌──────▼───────┐
│   Railway    │  Backend (Express)
│   Container  │  - Auto-deploy from Git
└──────┬───────┘  - Managed PostgreSQL option
       │          - Environment variables
       │          - Health checks
       │
┌──────▼───────┐
│   OpenAI     │  AI Services
│   API       │  - GPT-4o-mini
└──────────────┘  - Whisper
```

### Environment Variables

**Backend**:
- `OPENAI_API_KEY`: OpenAI API key
- `PORT`: Server port (default 3001)
- `NODE_ENV`: Environment (development/production)
- `FRONTEND_URL`: Frontend URL for CORS

**Frontend**:
- `VITE_API_URL`: Backend API URL

## API Documentation

Interactive API documentation available at `/api/docs` when running the backend server. The OpenAPI 3.0 specification includes:

- Complete endpoint documentation
- Request/response schemas
- Authentication requirements (when implemented)
- Example requests and responses
- Try-it-out functionality

## Performance Optimization

### Frontend
- Code splitting with Vite
- Lazy loading for routes and heavy components
- Image optimization
- Minification and tree-shaking in production builds
- Efficient re-rendering with React.memo where needed

### Backend
- Streaming responses for long AI outputs
- Chunked file uploads for large media
- Async/await for non-blocking operations
- Connection pooling for database (when added)
- Compression middleware for API responses

## Future Enhancements

1. **User Accounts & Persistence**
   - User authentication (OAuth, email/password)
   - Cloud storage for lectures and notes
   - Sharing and collaboration features

2. **Advanced AI Features**
   - Custom AI models fine-tuned on educational content
   - Multi-language support
   - Real-time transcription during recording
   - Speaker diarization (identify different speakers)

3. **Export Capabilities**
   - PDF export for notes
   - Anki deck export for flashcards
   - Markdown export for transcripts
   - Audio highlights and bookmarks

4. **Mobile App**
   - React Native mobile application
   - Offline mode with sync
   - Push notifications for processing completion

5. **Analytics Dashboard**
   - Study time tracking
   - Quiz performance analytics
   - Learning insights and recommendations

## Conclusion

COGnitive's architecture is designed for rapid development and iteration while maintaining clean separation of concerns. The modular design allows for easy feature additions and scalability improvements as the application grows.

