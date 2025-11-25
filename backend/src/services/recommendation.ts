// backend/src/services/recommendation.ts

import type { Book, BookWithSimilarity } from '../types';
import { calculateTFIDF, cosineSimilarity } from './tfidf';

/**
 * SISTEM REKOMENDASI SESUAI PROPOSAL
 * ====================================
 * 1. Ekstrak fitur dari Judul (TF-IDF)
 * 2. Ekstrak fitur dari Sinopsis (TF-IDF)
 * 3. Ekstrak fitur dari Genre (Multi-Hot Encoding)
 * 4. Gabungkan ketiga vektor (concatenate)
 * 5. Hitung Cosine Similarity
 */

/**
 * Multi-Hot Encoding untuk Genre
 * Setiap genre mendapat indeks, dan setiap buku direpresentasikan dengan vektor biner
 */
function createGenreVector(book: Book, allGenres: string[]): number[] {
  const vector = new Array(allGenres.length).fill(0);
  
  // DEFENSIVE: Check if genre_name exists
  if (!book.genre_name) {
    console.warn(`Book "${book.title}" (ID: ${book.id}) has no genre_name`);
    return vector;
  }
  
  // Pisahkan genre jika ada multiple genre (separated by comma)
  const bookGenres = book.genre_name
    .split(',')
    .map(g => g.trim().toLowerCase());
  
  // Set 1 untuk genre yang dimiliki buku ini
  allGenres.forEach((genre, index) => {
    if (bookGenres.includes(genre.toLowerCase())) {
      vector[index] = 1;
    }
  });
  
  return vector;
}

/**
 * Ekstrak semua unique genres dari semua buku
 */
function extractAllGenres(books: Book[]): string[] {
  const genreSet = new Set<string>();
  
  books.forEach(book => {
    // DEFENSIVE: Check if genre_name exists
    if (!book.genre_name) {
      console.warn(`Book "${book.title}" (ID: ${book.id}) has no genre_name`);
      return;
    }
    
    const genres = book.genre_name
      .split(',')
      .map(g => g.trim().toLowerCase());
    genres.forEach(g => genreSet.add(g));
  });
  
  return Array.from(genreSet).sort();
}

/**
 * Gabungkan TF-IDF vector dengan Genre vector
 * SESUAI TABLE 3.12: [Title TF-IDF | Genre Multi-Hot | Synopsis TF-IDF]
 */
function combineVectors(
  titleVector: Map<string, number>,
  genreVector: number[],
  synopsisVector: Map<string, number>,
  allTitleTerms: Set<string>,
  allSynopsisTerms: Set<string>
): Map<string, number> {
  const combinedVector = new Map<string, number>();
  
  // 1. Masukkan Title TF-IDF values dengan prefix 'title_'
  for (const term of allTitleTerms) {
    combinedVector.set(`title_${term}`, titleVector.get(term) || 0);
  }
  
  // 2. Masukkan Genre values dengan prefix 'genre_'
  genreVector.forEach((value, index) => {
    combinedVector.set(`genre_${index}`, value);
  });
  
  // 3. Masukkan Synopsis TF-IDF values dengan prefix 'synopsis_'
  for (const term of allSynopsisTerms) {
    combinedVector.set(`synopsis_${term}`, synopsisVector.get(term) || 0);
  }
  
  return combinedVector;
}

/**
 * Get book recommendations using Content-Based Filtering
 * SESUAI PROPOSAL BAB 3
 */
export function getRecommendations(
  targetBook: Book,
  allBooks: Book[],
  topN: number = 5
): BookWithSimilarity[] {
  // DEFENSIVE: Filter out books without genre_name
  const validBooks = allBooks.filter(book => {
    if (!book.genre_name) {
      console.warn(`Skipping book "${book.title}" (ID: ${book.id}) - no genre_name`);
      return false;
    }
    return true;
  });

  if (validBooks.length === 0) {
    console.error('No valid books found for recommendation');
    return [];
  }

  // Step 1: Ekstrak semua unique genres
  const allGenres = extractAllGenres(validBooks);
  
  // Step 2: Buat Multi-Hot Encoding untuk genre setiap buku
  const genreVectors = validBooks.map(book => createGenreVector(book, allGenres));
  
  // Step 3: Hitung TF-IDF untuk JUDUL
  const titleDocuments = validBooks.map(book => book.title);
  const titleTFIDF = calculateTFIDF(titleDocuments);
  
  // Step 4: Hitung TF-IDF untuk SINOPSIS
  const synopsisDocuments = validBooks.map(book => book.synopsis || '');
  const synopsisTFIDF = calculateTFIDF(synopsisDocuments);
  
  // Step 5: Gabungkan semua terms dari title dan synopsis untuk normalisasi
  const allTitleTerms = new Set<string>();
  const allSynopsisTerms = new Set<string>();
  
  titleTFIDF.forEach(vector => {
    vector.forEach((_, term) => allTitleTerms.add(term));
  });
  
  synopsisTFIDF.forEach(vector => {
    vector.forEach((_, term) => allSynopsisTerms.add(term));
  });
  
  // Step 6: Gabungkan fitur untuk setiap buku
  // SESUAI TABLE 3.12: [Title TF-IDF | Genre Multi-Hot | Synopsis TF-IDF]
  const combinedVectors = validBooks.map((book, index) => {
    const titleVec = titleTFIDF.get(index) || new Map();
    const synopsisVec = synopsisTFIDF.get(index) || new Map();
    const genreVec = genreVectors[index];
    
    // Combine: Title + Genre + Synopsis (SESUAI PROPOSAL TABLE 3.12)
    return combineVectors(titleVec, genreVec, synopsisVec, allTitleTerms, allSynopsisTerms);
  });
  
  // Step 7: Find index of target book
  const targetIndex = validBooks.findIndex(book => book.id === targetBook.id);
  
  if (targetIndex === -1) {
    console.error(`Target book "${targetBook.title}" (ID: ${targetBook.id}) not found in valid books`);
    return [];
  }
  
  const targetVector = combinedVectors[targetIndex];
  
  // Step 8: Calculate similarity dengan semua buku lainnya
  const similarities: Array<{ book: Book; similarity: number }> = [];
  
  for (let i = 0; i < validBooks.length; i++) {
    // Skip target book itself
    if (i === targetIndex) continue;
    
    const currentVector = combinedVectors[i];
    const similarity = cosineSimilarity(targetVector, currentVector);
    
    similarities.push({
      book: validBooks[i],
      similarity
    });
  }
  
  // Step 9: Sort by similarity (descending) dan ambil top N
  similarities.sort((a, b) => b.similarity - a.similarity);
  
  return similarities.slice(0, topN).map(item => ({
    ...item.book,
    similarity: item.similarity
  }));
}

/**
 * Get recommendations by book title (search-based)
 */
export function getRecommendationsByTitle(
  title: string,
  allBooks: Book[],
  topN: number = 5
): BookWithSimilarity[] {
  // Find book by title (case-insensitive, partial match)
  const targetBook = allBooks.find(book => 
    book.title.toLowerCase().includes(title.toLowerCase())
  );
  
  if (!targetBook) {
    console.warn(`No book found with title containing: "${title}"`);
    return [];
  }
  
  return getRecommendations(targetBook, allBooks, topN);
}