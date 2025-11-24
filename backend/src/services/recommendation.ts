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
    const genres = book.genre_name
      .split(',')
      .map(g => g.trim().toLowerCase());
    genres.forEach(g => genreSet.add(g));
  });
  
  return Array.from(genreSet).sort();
}

/**
 * Gabungkan TF-IDF vector dengan Genre vector
 */
function combineVectors(
  tfidfVector: Map<string, number>,
  genreVector: number[],
  allTerms: Set<string>
): Map<string, number> {
  const combinedVector = new Map<string, number>();
  
  // 1. Masukkan TF-IDF values
  for (const term of allTerms) {
    combinedVector.set(term, tfidfVector.get(term) || 0);
  }
  
  // 2. Masukkan Genre values dengan prefix 'genre_'
  genreVector.forEach((value, index) => {
    combinedVector.set(`genre_${index}`, value);
  });
  
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
  // Step 1: Ekstrak semua unique genres
  const allGenres = extractAllGenres(allBooks);
  
  // Step 2: Buat Multi-Hot Encoding untuk genre setiap buku
  const genreVectors = allBooks.map(book => createGenreVector(book, allGenres));
  
  // Step 3: Hitung TF-IDF untuk JUDUL
  const titleDocuments = allBooks.map(book => book.title);
  const titleTFIDF = calculateTFIDF(titleDocuments);
  
  // Step 4: Hitung TF-IDF untuk SINOPSIS
  const synopsisDocuments = allBooks.map(book => book.synopsis || '');
  const synopsisTFIDF = calculateTFIDF(synopsisDocuments);
  
  // Step 5: Gabungkan semua terms dari title dan synopsis untuk normalisasi
  const allTerms = new Set<string>();
  titleTFIDF.forEach(vector => {
    vector.forEach((_, term) => allTerms.add(term));
  });
  synopsisTFIDF.forEach(vector => {
    vector.forEach((_, term) => allTerms.add(term));
  });
  
  // Step 6: Gabungkan fitur untuk setiap buku (Title TF-IDF + Synopsis TF-IDF + Genre Vector)
  const combinedVectors = allBooks.map((book, index) => {
    const titleVec = titleTFIDF.get(index) || new Map();
    const synopsisVec = synopsisTFIDF.get(index) || new Map();
    const genreVec = genreVectors[index];
    
    // Gabungkan title dan synopsis TF-IDF
    const mergedTFIDF = new Map<string, number>();
    for (const term of allTerms) {
      const titleVal = titleVec.get(term) || 0;
      const synopsisVal = synopsisVec.get(term) || 0;
      // Average atau sum (di proposal menggunakan concatenate, jadi kita sum)
      mergedTFIDF.set(term, titleVal + synopsisVal);
    }
    
    // Combine dengan genre vector
    return combineVectors(mergedTFIDF, genreVec, allTerms);
  });
  
  // Step 7: Find index of target book
  const targetIndex = allBooks.findIndex(book => book.id === targetBook.id);
  
  if (targetIndex === -1) {
    return [];
  }
  
  const targetVector = combinedVectors[targetIndex];
  
  // Step 8: Calculate similarity dengan semua buku lainnya
  const similarities: Array<{ book: Book; similarity: number }> = [];
  
  for (let i = 0; i < allBooks.length; i++) {
    // Skip target book itself
    if (i === targetIndex) continue;
    
    const currentVector = combinedVectors[i];
    const similarity = cosineSimilarity(targetVector, currentVector);
    
    similarities.push({
      book: allBooks[i],
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
    return [];
  }
  
  return getRecommendations(targetBook, allBooks, topN);
}