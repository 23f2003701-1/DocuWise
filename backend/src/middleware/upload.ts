import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '../utils/validators';

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure disk storage
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, uploadDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

// File filter: allow PDFs, images including iOS formats (HEIC, HEIF)
const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  const ext = path.extname(file.originalname).toLowerCase();
  const validExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'];

  if (
    ALLOWED_FILE_TYPES.includes(file.mimetype) ||
    file.mimetype.startsWith('image/') ||
    file.mimetype === 'application/pdf' ||
    validExtensions.includes(ext)
  ) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPEG, JPG, PNG, and HEIC files are allowed.'));
  }
};

// Create multer upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE, // 10MB
  },
});

export default upload;
