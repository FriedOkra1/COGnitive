# COGnitive API Documentation

Complete API reference for the COGnitive backend. For interactive documentation, visit `/api/docs` on your running backend server.

## Base URL

- **Development**: `http://localhost:3001`
- **Production**: Your Railway deployment URL

## Authentication

Currently, no authentication is required. Future versions will implement API key or JWT-based authentication.

## Common Response Formats

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

## API Endpoints

### Health Check

#### GET /health

Check if the API server is running.

**Response 200**:
```json
{
  "status": "ok",
  "message": "COGnitive backend is running"
}
```

**Example**:
```bash
curl http://localhost:3001/health
```

---

## Chat Endpoints

### POST /api/chat

Send a message to the AI assistant with optional context and images.

**Request Body**:
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Explain quantum computing"
    }
  ],
  "context": "a physics textbook about quantum mechanics",
  "images": ["data:image/png;base64,..."]
}
```

**Parameters**:
- `messages` (required): Array of chat messages
  - `role`: `"user"` | `"assistant"` | `"system"`
  - `content`: Message text
- `context` (optional): Description of content being discussed
- `images` (optional): Array of base64-encoded image data URLs

**Response 200**:
```json
{
  "message": "Quantum computing is...",
  "role": "assistant"
}
```

**Error Responses**:
- `400`: Invalid request (missing messages)
- `500`: Chat processing failed

**Example**:
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "What is photosynthesis?"}
    ],
    "context": "a biology textbook"
  }'
```

---

## Upload Endpoints

### POST /api/upload/document

Upload and process a document (PDF, DOCX, TXT).

**Request**: `multipart/form-data`
- `file` (required): Document file

**Supported Formats**:
- PDF (`.pdf`)
- Microsoft Word (`.docx`, `.doc`)
- Plain Text (`.txt`)

**Response 200**:
```json
{
  "success": true,
  "text": "Extracted text content...",
  "fileName": "document.pdf",
  "summary": "AI-generated summary..."
}
```

**Error Responses**:
- `400`: No file uploaded or empty document
- `500`: Processing failed

**Example**:
```bash
curl -X POST http://localhost:3001/api/upload/document \
  -F "file=@/path/to/document.pdf"
```

### POST /api/upload/audio

Upload and transcribe an audio file.

**Request**: `multipart/form-data`
- `audio` (required): Audio file

**Supported Formats**:
- MP3, WAV, M4A, WEBM, OGG, FLAC

**Response 200**:
```json
{
  "success": true,
  "transcription": "Transcribed audio text..."
}
```

**Error Responses**:
- `400`: No file uploaded
- `500`: Transcription failed

**Example**:
```bash
curl -X POST http://localhost:3001/api/upload/audio \
  -F "audio=@/path/to/recording.mp3"
```

### POST /api/upload/image

Upload an image and convert to base64.

**Request**: `multipart/form-data`
- `image` (required): Image file

**Supported Formats**:
- JPEG, PNG, GIF, WEBP

**Response 200**:
```json
{
  "success": true,
  "imageData": "data:image/jpeg;base64,...",
  "fileName": "photo.jpg",
  "mimeType": "image/jpeg"
}
```

**Error Responses**:
- `400`: No file uploaded
- `500`: Processing failed

**Example**:
```bash
curl -X POST http://localhost:3001/api/upload/image \
  -F "image=@/path/to/photo.jpg"
```

---

## Lecture Endpoints

### POST /api/lectures/upload

Upload a pre-recorded lecture file for processing.

**Request**: `multipart/form-data`
- `lecture` (required): Audio or video file

**Supported Formats**:
- Video: MP4, WEBM, AVI, MOV
- Audio: MP3, WAV, M4A, OGG, WEBM

**Response 200**:
```json
{
  "success": true,
  "jobId": "lecture-1234567890-abc123",
  "status": "processing",
  "message": "Lecture upload received. Processing has started."
}
```

**Processing Steps**:
1. Audio extraction (if video)
2. Audio chunking (for large files)
3. Whisper transcription
4. AI note generation
5. File storage

**Error Responses**:
- `400`: No file uploaded
- `500`: Upload failed

**Example**:
```bash
curl -X POST http://localhost:3001/api/lectures/upload \
  -F "lecture=@/path/to/lecture.mp4"
```

### POST /api/lectures/record

Process a browser-recorded lecture.

**Request**: `multipart/form-data`
- `lecture` (required): Recorded audio file
- `fileName` (optional): Custom file name

**Response 200**:
```json
{
  "success": true,
  "jobId": "lecture-1234567890-xyz789",
  "status": "processing",
  "message": "Recording received. Processing has started."
}
```

**Example**:
```bash
curl -X POST http://localhost:3001/api/lectures/record \
  -F "lecture=@recording.webm" \
  -F "fileName=My Lecture"
```

### GET /api/lectures/status/:jobId

Check the processing status of a lecture.

**URL Parameters**:
- `jobId`: Job identifier returned from upload/record

**Response 200**:
```json
{
  "jobId": "lecture-1234567890-abc123",
  "status": "processing",
  "progress": 65,
  "stage": "Generating notes...",
  "fileName": "lecture.mp4",
  "duration": 1847,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:35:00.000Z",
  "data": null
}
```

**When Completed**:
```json
{
  "jobId": "lecture-1234567890-abc123",
  "status": "completed",
  "progress": 100,
  "stage": "Complete",
  "fileName": "lecture.mp4",
  "duration": 1847,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:40:00.000Z",
  "completedAt": "2024-01-15T10:40:00.000Z",
  "data": {
    "transcript": "Full lecture transcript...",
    "notes": {
      "summary": "Brief summary...",
      "keyPoints": ["Point 1", "Point 2"],
      "topics": ["Topic A", "Topic B"]
    }
  }
}
```

**Status Values**:
- `processing`: Currently being processed
- `completed`: Successfully completed
- `failed`: Processing failed

**Error Responses**:
- `404`: Job not found
- `500`: Status check failed

**Example**:
```bash
curl http://localhost:3001/api/lectures/status/lecture-1234567890-abc123
```

### GET /api/lectures/:jobId/transcript

Get the full transcript for a completed lecture.

**URL Parameters**:
- `jobId`: Job identifier

**Response 200**:
```json
{
  "success": true,
  "jobId": "lecture-1234567890-abc123",
  "transcript": "Full lecture transcript text..."
}
```

**Error Responses**:
- `400`: Transcript not ready
- `404`: Job not found
- `500`: Retrieval failed

### GET /api/lectures/:jobId/notes

Get AI-generated notes for a completed lecture.

**URL Parameters**:
- `jobId`: Job identifier

**Response 200**:
```json
{
  "success": true,
  "jobId": "lecture-1234567890-abc123",
  "notes": {
    "summary": "This lecture covered...",
    "keyPoints": [
      "Main concept 1",
      "Main concept 2",
      "Main concept 3"
    ],
    "topics": [
      "Introduction to AI",
      "Machine Learning Basics",
      "Neural Networks"
    ],
    "detailedNotes": "Comprehensive notes..."
  }
}
```

**Error Responses**:
- `400`: Notes not ready
- `404`: Job not found
- `500`: Retrieval failed

### POST /api/lectures/:jobId/flashcards

Generate flashcards from a lecture.

**URL Parameters**:
- `jobId`: Job identifier

**Request Body**:
```json
{
  "count": 15
}
```

**Parameters**:
- `count` (optional): Number of flashcards (default: 15)

**Response 200**:
```json
{
  "success": true,
  "jobId": "lecture-1234567890-abc123",
  "flashcards": [
    {
      "id": "1",
      "type": "concept",
      "front": "What is machine learning?",
      "back": "A type of AI that learns from data..."
    },
    {
      "id": "2",
      "type": "basic",
      "front": "Define 'neural network'",
      "back": "A computing system inspired by..."
    }
  ]
}
```

**Flashcard Types**:
- `basic`: Simple Q&A
- `concept`: Conceptual understanding
- `qa`: Question and answer

**Error Responses**:
- `400`: Lecture not ready
- `404`: Job not found
- `500`: Generation failed

### POST /api/lectures/:jobId/quiz

Generate quiz questions from a lecture.

**URL Parameters**:
- `jobId`: Job identifier

**Request Body**:
```json
{
  "count": 10
}
```

**Parameters**:
- `count` (optional): Number of questions (default: 10)

**Response 200**:
```json
{
  "success": true,
  "jobId": "lecture-1234567890-abc123",
  "questions": [
    {
      "id": "1",
      "type": "multiple_choice",
      "question": "What is supervised learning?",
      "options": [
        "Learning with labeled data",
        "Learning without labels",
        "Learning by trial and error",
        "None of the above"
      ],
      "correctAnswer": 0,
      "explanation": "Supervised learning uses labeled data..."
    },
    {
      "id": "2",
      "type": "true_false",
      "question": "Neural networks are inspired by the human brain",
      "correctAnswer": "true",
      "explanation": "Neural networks mimic biological neurons..."
    }
  ]
}
```

**Question Types**:
- `multiple_choice`: Multiple options with one correct answer
- `true_false`: Boolean question
- `short_answer`: Free text answer

**Error Responses**:
- `400`: Lecture not ready
- `404`: Job not found
- `500`: Generation failed

### DELETE /api/lectures/:jobId

Delete a lecture and all associated files.

**URL Parameters**:
- `jobId`: Job identifier

**Response 200**:
```json
{
  "success": true,
  "message": "Lecture deleted successfully"
}
```

**Deletes**:
- Transcript file
- Notes file
- Audio file
- Generated flashcards
- Generated quiz
- Metadata

**Error Responses**:
- `404`: Job not found
- `500`: Deletion failed

---

## YouTube Endpoints

### POST /api/youtube/analyze

Analyze a YouTube video (extract transcript and generate summary).

**Request Body**:
```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

**Parameters**:
- `url` (required): YouTube video URL

**Supported URL Formats**:
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://m.youtube.com/watch?v=VIDEO_ID`

**Response 200**:
```json
{
  "success": true,
  "videoId": "dQw4w9WgXcQ",
  "title": "Video Title",
  "transcript": "Full video transcript...",
  "summary": "AI-generated summary...",
  "duration": 213,
  "segments": []
}
```

**Transcript Methods**:
1. **Captions** (preferred): Fast, free, uses existing captions
2. **Audio Download** (fallback): Downloads audio, transcribes with Whisper (slower, costs API credits)

**Error Responses**:
- `400`: Invalid URL or video ID
- `500`: Analysis failed (video unavailable, no captions, download failed)

**Example**:
```bash
curl -X POST http://localhost:3001/api/youtube/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'
```

### POST /api/youtube/flashcards

Generate flashcards from a YouTube video transcript.

**Request Body**:
```json
{
  "transcript": "Video transcript text...",
  "count": 15
}
```

**Parameters**:
- `transcript` (required): Video transcript
- `count` (optional): Number of flashcards (default: 15)

**Response 200**:
```json
{
  "success": true,
  "flashcards": [
    {
      "id": "1",
      "type": "concept",
      "front": "Question or concept",
      "back": "Answer or explanation"
    }
  ],
  "count": 15
}
```

**Error Responses**:
- `400`: Missing transcript
- `500`: Generation failed

### POST /api/youtube/quiz

Generate quiz questions from a YouTube video transcript.

**Request Body**:
```json
{
  "transcript": "Video transcript text...",
  "count": 10
}
```

**Parameters**:
- `transcript` (required): Video transcript
- `count` (optional): Number of questions (default: 10)

**Response 200**:
```json
{
  "success": true,
  "questions": [
    {
      "id": "1",
      "type": "multiple_choice",
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Why this is correct..."
    }
  ],
  "count": 10
}
```

**Error Responses**:
- `400`: Missing transcript
- `500`: Generation failed

### POST /api/youtube/summary

Generate a summary from a provided transcript.

**Request Body**:
```json
{
  "transcript": "Transcript text to summarize..."
}
```

**Parameters**:
- `transcript` (required): Text to summarize

**Response 200**:
```json
{
  "success": true,
  "summary": "AI-generated summary of the content..."
}
```

**Error Responses**:
- `400`: Missing transcript
- `500`: Generation failed

---

## Rate Limits

Currently no rate limits are enforced. Production deployments should implement:

- Per-IP rate limiting
- Per-user rate limiting (when auth is added)
- File upload size limits
- Request timeout limits

## Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad Request - Invalid input |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error - Server-side error |
| 503 | Service Unavailable - Temporary outage |

## Best Practices

1. **Handle Errors Gracefully**: Always check response status
2. **Implement Retries**: For 5xx errors (with exponential backoff)
3. **Use Timeouts**: Long operations (transcription) can take time
4. **Validate Input**: Client-side validation before API calls
5. **Monitor Usage**: Track API calls and OpenAI costs

## SDK Examples

### JavaScript/TypeScript

```typescript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

// Chat example
async function sendMessage(message: string) {
  const response = await axios.post(`${API_BASE_URL}/api/chat`, {
    messages: [{ role: 'user', content: message }]
  });
  return response.data.message;
}

// Upload document
async function uploadDocument(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await axios.post(
    `${API_BASE_URL}/api/upload/document`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  
  return response.data;
}

// Poll lecture status
async function waitForLecture(jobId: string) {
  while (true) {
    const response = await axios.get(
      `${API_BASE_URL}/api/lectures/status/${jobId}`
    );
    
    if (response.data.status === 'completed') {
      return response.data;
    } else if (response.data.status === 'failed') {
      throw new Error(response.data.error);
    }
    
    // Wait 3 seconds before next poll
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
}
```

### Python

```python
import requests
import time

API_BASE_URL = 'http://localhost:3001'

# Chat example
def send_message(message):
    response = requests.post(f'{API_BASE_URL}/api/chat', json={
        'messages': [{'role': 'user', 'content': message}]
    })
    return response.json()['message']

# Upload document
def upload_document(file_path):
    with open(file_path, 'rb') as f:
        files = {'file': f}
        response = requests.post(
            f'{API_BASE_URL}/api/upload/document',
            files=files
        )
    return response.json()

# Poll lecture status
def wait_for_lecture(job_id):
    while True:
        response = requests.get(
            f'{API_BASE_URL}/api/lectures/status/{job_id}'
        )
        data = response.json()
        
        if data['status'] == 'completed':
            return data
        elif data['status'] == 'failed':
            raise Exception(data['error'])
        
        time.sleep(3)
```

## Interactive Documentation

For a full interactive API explorer with request/response examples, visit:

```
http://localhost:3001/api/docs
```

Or in production:
```
https://your-backend-url.railway.app/api/docs
```

The Swagger UI allows you to:
- Browse all endpoints
- See detailed schemas
- Try API calls directly
- Download OpenAPI spec

---

## Support

For bugs or feature requests, please open an issue on GitHub.

