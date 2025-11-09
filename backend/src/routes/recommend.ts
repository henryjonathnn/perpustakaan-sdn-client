// src/routes/recommend.ts
import { Hono } from 'hono';
import pool from '../db/mysql';
import { authMiddleware } from '../middlewares/auth';
import { getRecommendations, getRecommendationsByTitle } from '../services/recommendation';
import type { Book } from '../types';

const recommend = new Hono();

/**
 * GET /recommend?title=book_title
 * Get recommendations by book title (public access)
 */
recommend.get('/', async (c) => {
  try {
    const title = c.req.query('title');
    
    if (!title) {
      return c.json({ error: 'Title parameter is required' }, 400);
    }
    
    // Fetch all books from database
    const [books] = await pool.query<Book[]>('SELECT * FROM books');
    
    if (books.length === 0) {
      return c.json({ error: 'No books available' }, 404);
    }
    
    // Get recommendations
    const recommendations = getRecommendationsByTitle(title, books, 5);
    
    if (recommendations.length === 0) {
      return c.json({ 
        message: 'No similar books found',
        recommendations: [] 
      });
    }
    
    // Find the target book
    const targetBook = books.find(book => 
      book.title.toLowerCase().includes(title.toLowerCase())
    );
    
    return c.json({
      targetBook,
      recommendations
    });
    
  } catch (error) {
    console.error('Recommendation error:', error);
    return c.json({ error: 'Failed to get recommendations' }, 500);
  }
});

/**
 * GET /recommend/:id
 * Get recommendations by book ID (public access)
 */
recommend.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    // Fetch all books from database
    const [books] = await pool.query<Book[]>('SELECT * FROM books');
    
    if (books.length === 0) {
      return c.json({ error: 'No books available' }, 404);
    }
    
    // Find target book
    const targetBook = books.find(book => book.id === parseInt(id));
    
    if (!targetBook) {
      return c.json({ error: 'Book not found' }, 404);
    }
    
    // Get recommendations
    const recommendations = getRecommendations(targetBook, books, 5);
    
    return c.json({
      targetBook,
      recommendations
    });
    
  } catch (error) {
    console.error('Recommendation error:', error);
    return c.json({ error: 'Failed to get recommendations' }, 500);
  }
});

export default recommend;