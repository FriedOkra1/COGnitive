# COGnitive - AI Study Companion

A retro-styled Macintosh-inspired AI study companion with voice input, document upload, and intelligent chat capabilities.

## 🚀 Features

### Core Features
- **Lecture Recording**: Record or upload lectures with automatic transcription and AI-generated notes
- **AI Chatbot**: Multi-modal conversations with document, voice, and YouTube video support
- **YouTube Analyzer**: Analyze YouTube videos with automatic transcription and summarization
- **Document Processing**: Upload and chat with PDFs, DOCX, and TXT files
- **Voice Input**: Record audio with instant Whisper API transcriptions
- **Flashcard Generator**: Auto-generate study flashcards from any content
- **Quiz Creator**: Create interactive quizzes from lectures, documents, or videos
- **Persistent Storage**: All content persists across page switches until tab is closed
- **Classic Mac UI**: Beautiful System 6-inspired retro interface

## 🛠️ Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite (fast development & build)
- Tailwind CSS
- Axios for API calls

**Backend:**
- Node.js with Express
- TypeScript
- OpenAI API (GPT-4o-mini & Whisper)
- Multer for file uploads
- pdf-parse, mammoth for document processing

## 📋 Prerequisites

- Node.js 18+ installed
- OpenAI API key (get one at https://platform.openai.com/api-keys)
- npm or yarn package manager

## 🔧 Setup Instructions

### Quick Start (Recommended)

From the root directory:

```bash
# 1. Create backend .env file with your OpenAI API key
echo "OPENAI_API_KEY=your_actual_api_key_here" > backend/.env
echo "PORT=3001" >> backend/.env
echo "NODE_ENV=development" >> backend/.env

# 2. Install all dependencies (both frontend and backend)
npm run install:all

# 3. Start both frontend and backend servers
npm run dev
```

Both servers will start automatically:
- Backend: `http://localhost:3001`
- Frontend: `http://localhost:5173`

### Manual Setup (Alternative)

If you prefer to run frontend and backend separately:

**Backend:**
```bash
cd backend
echo "OPENAI_API_KEY=your_actual_api_key_here" > .env
echo "PORT=3001" >> .env
echo "NODE_ENV=development" >> .env
npm install
npm run dev
```

**Frontend (in a new terminal):**
```bash
cd frontend
npm install
npm run dev
```

### Open in Browser

Visit `http://localhost:5173` in your browser to use the app!

## 🔐 Security Note

⚠️ **IMPORTANT**: Your OpenAI API key was posted publicly in the chat. Please:

1. Go to https://platform.openai.com/api-keys
2. Revoke the exposed API key
3. Create a new API key
4. Update your `backend/.env` file with the new key
5. Never commit `.env` files to git (already in `.gitignore`)

## 📦 Available Commands

From the root directory:

- `npm run install:all` - Install dependencies for both frontend and backend
- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:backend` - Start only the backend server
- `npm run dev:frontend` - Start only the frontend server
- `npm run build` - Build both frontend and backend for production
- `npm run clean` - Remove all node_modules and uploaded files

## 🎯 Usage Guide

### Getting Started
The app opens to **Lecture Recording** by default. Toggle between Lecture Recording and AI Chatbot using the navigation buttons.

### Lecture Recording
1. Record live or upload audio/video files
2. Get automatic transcription using Whisper AI
3. Receive AI-generated notes, summaries, and key points
4. Generate flashcards or quizzes from your lecture
5. Chat with your lecture notes for deeper understanding

### AI Chatbot
Access multiple content types through the **+** menu:

#### Document Upload
1. Click **+** → "Upload Document"
2. Select PDF, DOCX, or TXT files
3. Get automatic summary and chat about content

#### Voice Notes
1. Click **+** → "Voice Input"
2. Allow microphone access
3. Record your voice note
4. Automatic transcription and analysis

#### YouTube Analysis
1. Click **+** → "Analyze YouTube"
2. Paste any YouTube URL
3. Get video transcription and summary
4. Chat about video content

### Study Tools
Generate flashcards and quizzes from any uploaded content:
- Click "Generate Flashcards" for study cards
- Click "Generate Quiz" for practice questions
- Review and edit generated content
- All content persists until you close the tab

## 📁 Project Structure

```
COGnitive/
├── backend/
│   ├── src/
│   │   ├── index.ts           # Express server
│   │   ├── routes/            # API endpoints
│   │   ├── services/          # OpenAI, document processing
│   │   ├── middleware/        # File upload handlers
│   │   └── types/             # TypeScript definitions
│   ├── uploads/               # Temporary file storage
│   ├── package.json
│   └── .env                   # API keys (not in git)
│
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── services/          # API client
│   │   ├── App.tsx            # Main app component
│   │   └── main.tsx           # Entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

## 🐛 Troubleshooting

### Backend won't start
- Make sure `.env` file exists with your OpenAI API key
- Check if port 3001 is already in use
- Run `npm install` again

### Frontend won't connect to backend
- Ensure backend is running on port 3001
- Check browser console for CORS errors
- Verify `VITE_API_URL` in frontend (uses proxy by default)

### Document upload fails
- Check file size (max 10MB for documents)
- Ensure file type is PDF, DOCX, DOC, or TXT
- Check backend logs for errors

### Voice recording doesn't work
- Grant microphone permissions in browser
- Use HTTPS or localhost (required for microphone access)
- Check browser compatibility (Chrome/Edge recommended)

## 📝 API Endpoints

### Chat & Upload
- `GET /health` - Health check
- `POST /api/chat` - Send chat messages with optional context and images
- `POST /api/upload/document` - Upload and process documents
- `POST /api/upload/audio` - Transcribe audio files

### Lecture Recording
- `POST /api/lectures/record` - Upload live recording
- `POST /api/lectures/upload` - Upload pre-recorded lecture
- `GET /api/lectures/status/:jobId` - Check processing status
- `POST /api/lectures/:jobId/flashcards` - Generate flashcards from lecture
- `POST /api/lectures/:jobId/quiz` - Generate quiz from lecture

### YouTube Analysis
- `POST /api/youtube/analyze` - Analyze YouTube video
- `POST /api/youtube/flashcards` - Generate flashcards from transcript
- `POST /api/youtube/quiz` - Generate quiz from transcript

## 🎨 Design

The app features a classic Macintosh System 6 aesthetic with:
- Chicago-style fonts
- Pixelated icons
- Classic Mac window chrome
- Retro gray color scheme

## 📄 License

This project is open source and available for educational purposes.

## 🤝 Contributing

Future enhancements could include:
- Database integration for permanent storage
- User authentication and accounts
- Cloud storage for lectures
- Export features (PDF, Anki cards, etc.)
- Mobile app version
- Collaborative study features

---

Made with ❤️ using React, Node.js, and OpenAI

