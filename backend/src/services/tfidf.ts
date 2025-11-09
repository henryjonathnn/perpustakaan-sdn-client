// src/services/tfidf.ts

/**
 * Tokenize and normalize text
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2);
}

/**
 * Calculate Term Frequency
 */
function calculateTF(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  const totalTokens = tokens.length;
  
  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1);
  }
  
  // Normalize by total tokens
  for (const [token, count] of tf.entries()) {
    tf.set(token, count / totalTokens);
  }
  
  return tf;
}

/**
 * Calculate Inverse Document Frequency
 */
function calculateIDF(documents: string[][]): Map<string, number> {
  const idf = new Map<string, number>();
  const totalDocs = documents.length;
  
  // Count document frequency for each term
  const df = new Map<string, number>();
  for (const doc of documents) {
    const uniqueTokens = new Set(doc);
    for (const token of uniqueTokens) {
      df.set(token, (df.get(token) || 0) + 1);
    }
  }
  
  // Calculate IDF
  for (const [token, docFreq] of df.entries()) {
    idf.set(token, Math.log(totalDocs / docFreq));
  }
  
  return idf;
}

/**
 * Calculate TF-IDF vectors for all documents
 */
export function calculateTFIDF(documents: string[]): Map<number, Map<string, number>> {
  // Tokenize all documents
  const tokenizedDocs = documents.map(doc => tokenize(doc));
  
  // Calculate IDF for all terms
  const idf = calculateIDF(tokenizedDocs);
  
  // Calculate TF-IDF for each document
  const tfidfVectors = new Map<number, Map<string, number>>();
  
  for (let i = 0; i < tokenizedDocs.length; i++) {
    const tokens = tokenizedDocs[i];
    const tf = calculateTF(tokens);
    const tfidf = new Map<string, number>();
    
    for (const [token, tfValue] of tf.entries()) {
      const idfValue = idf.get(token) || 0;
      tfidf.set(token, tfValue * idfValue);
    }
    
    tfidfVectors.set(i, tfidf);
  }
  
  return tfidfVectors;
}

/**
 * Calculate cosine similarity between two TF-IDF vectors
 */
export function cosineSimilarity(
  vector1: Map<string, number>,
  vector2: Map<string, number>
): number {
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;
  
  // Get all unique terms from both vectors
  const allTerms = new Set([...vector1.keys(), ...vector2.keys()]);
  
  for (const term of allTerms) {
    const val1 = vector1.get(term) || 0;
    const val2 = vector2.get(term) || 0;
    
    dotProduct += val1 * val2;
    magnitude1 += val1 * val1;
    magnitude2 += val2 * val2;
  }
  
  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);
  
  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0;
  }
  
  return dotProduct / (magnitude1 * magnitude2);
}