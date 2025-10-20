/**
 * Simple test script for the Lecture Recording API
 * 
 * Usage:
 *   node test-lecture-api.js /path/to/audio-file.mp3
 * 
 * This will:
 * 1. Upload the audio file
 * 2. Poll for completion
 * 3. Display transcript and notes
 * 4. Generate flashcards and quiz
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const http = require('http');

const API_BASE = 'http://localhost:3001/api/lectures';

// Helper: Make HTTP request
function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const req = http.request(
      {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers: options.headers || {},
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, data });
          }
        });
      }
    );

    req.on('error', reject);

    if (options.body) {
      if (options.body instanceof FormData) {
        options.body.pipe(req);
      } else {
        req.write(options.body);
        req.end();
      }
    } else {
      req.end();
    }
  });
}

// Upload file
async function uploadLecture(filePath) {
  console.log('\n📤 Uploading lecture file...');

  const form = new FormData();
  form.append('lecture', fs.createReadStream(filePath));

  const res = await request(`${API_BASE}/upload`, {
    method: 'POST',
    headers: form.getHeaders(),
    body: form,
  });

  if (res.status !== 200) {
    throw new Error(`Upload failed: ${JSON.stringify(res.data)}`);
  }

  console.log(`✅ Upload successful! Job ID: ${res.data.jobId}`);
  return res.data.jobId;
}

// Check status
async function checkStatus(jobId) {
  const res = await request(`${API_BASE}/status/${jobId}`);
  return res.data;
}

// Poll until complete
async function waitForCompletion(jobId) {
  console.log('\n⏳ Waiting for processing to complete...\n');

  while (true) {
    const status = await checkStatus(jobId);

    console.log(`[${status.progress}%] ${status.stage}`);

    if (status.status === 'completed') {
      console.log('\n✅ Processing complete!');
      return status;
    }

    if (status.status === 'failed') {
      throw new Error(`Processing failed: ${status.error}`);
    }

    // Wait 2 seconds before checking again
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}

// Generate flashcards
async function generateFlashcards(jobId, count = 10) {
  console.log(`\n🃏 Generating ${count} flashcards...`);

  const res = await request(`${API_BASE}/${jobId}/flashcards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ count }),
  });

  if (res.status !== 200) {
    throw new Error(`Flashcard generation failed: ${JSON.stringify(res.data)}`);
  }

  console.log(`✅ Generated ${res.data.flashcards.length} flashcards`);
  return res.data.flashcards;
}

// Generate quiz
async function generateQuiz(jobId, count = 5) {
  console.log(`\n📝 Generating ${count} quiz questions...`);

  const res = await request(`${API_BASE}/${jobId}/quiz`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ count }),
  });

  if (res.status !== 200) {
    throw new Error(`Quiz generation failed: ${JSON.stringify(res.data)}`);
  }

  console.log(`✅ Generated ${res.data.questions.length} quiz questions`);
  return res.data.questions;
}

// Main
async function main() {
  const filePath = process.argv[2];

  if (!filePath) {
    console.error('Usage: node test-lecture-api.js <audio-file>');
    process.exit(1);
  }

  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  try {
    console.log('🎓 Lecture Recording API Test');
    console.log('================================');

    // 1. Upload
    const jobId = await uploadLecture(filePath);

    // 2. Wait for completion
    const result = await waitForCompletion(jobId);

    // 3. Display results
    console.log('\n📊 Results:');
    console.log('───────────');
    console.log(`\n📝 Transcript (${result.data.transcript.length} characters)`);
    console.log(result.data.transcript.substring(0, 200) + '...\n');

    console.log('📚 Notes:');
    console.log('Summary:', result.data.notes.summary.substring(0, 150) + '...');
    console.log('Key Points:', result.data.notes.keyPoints.length);
    console.log('Topics:', result.data.notes.topics.join(', '));

    // 4. Generate flashcards
    const flashcards = await generateFlashcards(jobId, 10);
    console.log('\nSample Flashcard:');
    console.log('Front:', flashcards[0].front);
    console.log('Back:', flashcards[0].back);

    // 5. Generate quiz
    const quiz = await generateQuiz(jobId, 5);
    console.log('\nSample Quiz Question:');
    console.log('Q:', quiz[0].question);
    if (quiz[0].options) {
      quiz[0].options.forEach((opt, i) => console.log(`  ${i + 1}. ${opt}`));
    }

    console.log('\n✅ All tests passed!');
    console.log(`\nJob ID: ${jobId}`);
    console.log('Use this to access the lecture via API endpoints.');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();

