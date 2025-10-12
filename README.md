# COGnitive - AI Study Companion

A retro-styled Macintosh-inspired AI study companion with voice input, document upload, and intelligent chat capabilities.

## 🚀 Features

### MVP (Current)
- **AI Chatbot**: Real-time conversations powered by OpenAI GPT-4o-mini
- **Document Upload**: Upload and chat with PDFs, DOCX, and TXT files
- **Voice Input**: Record audio and get instant transcriptions via Whisper API
- **Classic Mac UI**: Beautiful System 6-inspired interface

### Coming Soon
- Lecture Recording & Note Generation
- YouTube Video Analysis
- Flashcard Generation
- Quiz Creation

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

### AI Chatbot
1. Click on "AI Chatbot" from the home screen
2. Type your questions and get AI-powered responses
3. Use the **+** button to access additional features:
   - Upload documents (PDF, DOCX, TXT)
   - Record voice messages
   - Create notes (coming soon)

### Document Upload
1. Click the **+** button in the chatbot
2. Select "Upload Document"
3. Choose a PDF, DOCX, or TXT file
4. Ask questions about your document!

### Voice Input
1. Click the **+** button in the chatbot
2. Select "Voice Input"
3. Allow microphone access when prompted
4. Speak your message
5. Click "Stop Recording" when done
6. Your audio will be transcribed automatically

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

- `GET /health` - Health check
- `POST /api/chat` - Send chat messages
- `POST /api/upload/document` - Upload and process documents
- `POST /api/upload/audio` - Transcribe audio files

## 🎨 Design

The app features a classic Macintosh System 6 aesthetic with:
- Chicago-style fonts
- Pixelated icons
- Classic Mac window chrome
- Retro gray color scheme

## 📄 License

This project is open source and available for educational purposes.

## 🤝 Contributing

This is an MVP. Future features include:
- Database integration for persistent storage
- User authentication
- Flashcard generation
- Quiz creation
- YouTube video analysis
- Lecture recording features

---

Made with ❤️ using React, Node.js, and OpenAI

