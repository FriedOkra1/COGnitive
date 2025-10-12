# AI Chatbot Testing Guide

## What Was Fixed

### Backend Changes
1. **CORS Configuration** - Updated to allow frontend ports 5173, 5174, and 5175
2. **Chat API** - Verified working with OpenAI GPT-4o-mini
3. **Document Upload** - Confirmed text extraction and summary generation working

### Frontend Changes
1. **Document Upload Integration** - Now properly stores the full document text (up to 5000 chars) as context for chat
2. **Audio Transcription Integration** - Voice notes are now added to the chat context
3. **Context Passing** - Document/audio content is properly passed to the chat API

## How to Test

### Prerequisites
- Backend server running on port 3001 (should be running in background)
- Frontend running on port 5175 (should be running in background)
- OpenAI API key configured in `backend/.env` file

### Test 1: Basic Chat (No Context)
1. Navigate to http://localhost:5175
2. Click on "AI Chatbot" feature
3. Type a message like "Hello, can you help me study?"
4. Press Send or hit Enter
5. ✅ You should receive a response from the AI

### Test 2: Document Upload + Chat
1. Click the **+** button at the bottom left
2. Select "Upload Document"
3. Choose a .txt, .pdf, or .docx file
4. Wait for the upload confirmation message (shows summary)
5. Type a question about the document, e.g., "What are the main points?"
6. Press Send
7. ✅ AI should answer based on your document content

### Test 3: Voice Input + Chat
1. Click the **+** button
2. Select "Voice Input"
3. Allow microphone access if prompted
4. Speak clearly for a few seconds
5. Click "Stop Recording" in the menu
6. Wait for transcription to complete
7. Type a message referencing what you said
8. ✅ AI should have context from your voice note

### Test 4: Combined Context
1. Upload a document
2. Record a voice note
3. Ask questions that reference both
4. ✅ AI should have context from both sources

## Troubleshooting

### Chat not working
- Check browser console (F12) for errors
- Verify backend is running: `curl http://localhost:3001/health`
- Check that OpenAI API key is set in backend/.env

### Document upload fails
- Check file format (.txt, .pdf, .docx supported)
- Check file size (large files may timeout)
- Check backend logs for errors

### Voice transcription fails
- Ensure microphone permissions are granted
- Check audio format is supported (WebM)
- Verify OpenAI Whisper API is accessible

## API Endpoints Tested

- ✅ GET /health - Server health check
- ✅ POST /api/chat - Chat completion with OpenAI
- ✅ POST /api/upload/document - Document text extraction
- ✅ POST /api/upload/audio - Audio transcription

## Notes

- **NO TOKEN LIMITS!** Full document content is passed to the AI (no character truncation)
- Chat uses GPT-4o-mini model with temperature 0.7 and unlimited output tokens
- File upload limits: Documents up to 500MB, Audio up to 1GB
- Audio is transcribed using OpenAI Whisper-1
- Comprehensive summaries are automatically generated for uploaded documents (no length limits)
- AI can generate extremely long and detailed responses

