// src/types/index.ts
import { RowDataPacket } from 'mysql2';

export interface User extends RowDataPacket {
  id: number;
  username: string;
  password: string;
  role: 'siswa' | 'pustakawan';
  created_at: Date;
}

export interface Book extends RowDataPacket {
  id: number;
  title: string;
  author: string;
  genre: string;
  description: string;
  cover_img: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface JWTPayload {
  id: number;
  role: 'siswa' | 'pustakawan';
}

export interface BookWithSimilarity extends Book {
  similarity?: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface BookRequest {
  title: string;
  author: string;
  genre: string;
  description: string;
}

export interface RecommendationResult {
  book: Book;
  similarity: number;
  recommendations: BookWithSimilarity[];
}