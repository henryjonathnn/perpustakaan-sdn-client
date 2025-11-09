// src/utils/upload.ts
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const UPLOAD_DIR = join(process.cwd(), 'uploads', 'covers');

// Pastikan folder uploads exists
if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Allowed image mime types
 */
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
];

/**
 * Max file size: 5MB
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Generate unique filename
 */
export function generateFileName(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const ext = originalName.split('.').pop();
  return `${timestamp}-${random}.${ext}`;
}

/**
 * Validate image file
 */
export function validateImage(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'File size exceeds 5MB limit.'
    };
  }

  return { valid: true };
}

/**
 * Save uploaded file to disk
 */
export async function saveFile(file: File): Promise<string> {
  const fileName = generateFileName(file.name);
  const filePath = join(UPLOAD_DIR, fileName);
  
  // Convert File to Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  // Write file
  writeFileSync(filePath, buffer);
  
  return fileName;
}

/**
 * Delete file from disk
 */
export function deleteFile(fileName: string): boolean {
  try {
    const filePath = join(UPLOAD_DIR, fileName);
    if (existsSync(filePath)) {
      const fs = require('fs');
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

/**
 * Get upload directory path
 */
export function getUploadDir(): string {
  return UPLOAD_DIR;
}