import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure directories exist
const uploadsDir = path.join(__dirname, '../../uploads');
const tempDir = path.join(__dirname, '../../temp');
const lecturesDir = path.join(__dirname, '../../lectures');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

if (!fs.existsSync(lecturesDir)) {
  fs.mkdirSync(lecturesDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter for documents
const documentFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOCX, DOC, and TXT files are allowed.'));
  }
};

// File filter for audio
const audioFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'audio/webm',
    'audio/wav',
    'audio/mpeg',
    'audio/mp4',
    'audio/ogg',
    'audio/x-m4a',
  ];

  if (allowedTypes.includes(file.mimetype) || file.mimetype.startsWith('audio/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only audio files are allowed.'));
  }
};

export const uploadDocument = multer({
  storage,
  fileFilter: documentFilter,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit - handle large documents
});

export const uploadAudio = multer({
  storage,
  fileFilter: audioFilter,
  limits: { fileSize: 1024 * 1024 * 1024 }, // 1GB limit - handle long audio recordings
});

// File filter for images
const imageFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, JPG, PNG, GIF, and WEBP images are allowed.'));
  }
};

export const uploadImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for images
});

// Configure storage for lecture recordings (use temp directory)
const lectureStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'lecture-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter for lecture recordings (audio and video)
const lectureFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'audio/webm',
    'audio/wav',
    'audio/mpeg',
    'audio/mp4',
    'audio/ogg',
    'audio/x-m4a',
    'video/webm',
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
  ];

  if (allowedTypes.includes(file.mimetype) || 
      file.mimetype.startsWith('audio/') || 
      file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only audio and video files are allowed.'));
  }
};

export const uploadLecture = multer({
  storage: lectureStorage,
  fileFilter: lectureFilter,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit for lecture recordings
});

