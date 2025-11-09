// src/services/recommendation.ts
import type { Book, BookWithSimilarity } from '../types';
import { calculateTFIDF, cosineSimilarity } from './tfidf';

/**
 * Combine book features into single text
 */
function combineFeatures(book: Book): string {
  return `${book.title} ${book.genre} ${book.description}`;
}

/**
 * Get book recommendations using Content-Based Filtering
 */
export function getRecommendations(
  targetBook: Book,
  allBooks: Book[],
  topN: number = 5
): BookWithSimilarity[] {
  // Combine features for all books
  const documents = allBooks.map(book => combineFeatures(book));
  
  // Calculate TF-IDF vectors
  const tfidfVectors = calculateTFIDF(documents);
  
  // Find index of target book
  const targetIndex = allBooks.findIndex(book => book.id === targetBook.id);
  
  if (targetIndex === -1) {
    return [];
  }
  
  const targetVector = tfidfVectors.get(targetIndex);
  
  if (!targetVector) {
    return [];
  }
  
  // Calculate similarity with all other books
  const similarities: Array<{ book: Book; similarity: number }> = [];
  
  for (let i = 0; i < allBooks.length; i++) {
    // Skip the target book itself
    if (i === targetIndex) continue;
    
    const currentVector = tfidfVectors.get(i);
    if (!currentVector) continue;
    
    const similarity = cosineSimilarity(targetVector, currentVector);
    
    similarities.push({
      book: allBooks[i],
      similarity
    });
  }
  
  // Sort by similarity (descending) and take top N
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