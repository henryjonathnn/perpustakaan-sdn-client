// src/routes/books.ts
import { Hono } from 'hono';
import pool from '../db/mysql';
import { authMiddleware, pustakawanOnly } from '../middlewares/auth';
import { validateImage, saveFile, deleteFile } from '../utils/upload';
import type { Book, BookRequest } from '../types';

const books = new Hono();

/**
 * GET /books
 * Get all books (public access)
 */
books.get('/', async (c) => {
  try {
    const [rows] = await pool.query<Book[]>('SELECT * FROM books ORDER BY created_at DESC');
    return c.json({ books: rows });
  } catch (error) {
    console.error('Get books error:', error);
    return c.json({ error: 'Failed to fetch books' }, 500);
  }
});

/**
 * GET /books/:id
 * Get single book by ID (public access)
 */
books.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const [rows] = await pool.query<Book[]>('SELECT * FROM books WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return c.json({ error: 'Book not found' }, 404);
    }
    
    return c.json({ book: rows[0] });
  } catch (error) {
    console.error('Get book error:', error);
    return c.json({ error: 'Failed to fetch book' }, 500);
  }
});

/**
 * POST /books
 * Create new book (pustakawan only)
 */
books.post('/', authMiddleware, pustakawanOnly, async (c) => {
  try {
    const body = await c.req.json<BookRequest>();
    const { title, author, genre, description } = body;
    
    if (!title || !author || !genre || !description) {
      return c.json({ error: 'All fields are required' }, 400);
    }
    
    const [result] = await pool.query<any>(
      'INSERT INTO books (title, author, genre, description) VALUES (?, ?, ?, ?)',
      [title, author, genre, description]
    );
    
    return c.json({
      message: 'Book created successfully',
      bookId: result.insertId
    }, 201);
    
  } catch (error) {
    console.error('Create book error:', error);
    return c.json({ error: 'Failed to create book' }, 500);
  }
});

/**
 * PUT /books/:id
 * Update book (pustakawan only)
 */
books.put('/:id', authMiddleware, pustakawanOnly, async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json<BookRequest>();
    const { title, author, genre, description } = body;
    
    if (!title || !author || !genre || !description) {
      return c.json({ error: 'All fields are required' }, 400);
    }
    
    const [result] = await pool.query<any>(
      'UPDATE books SET title = ?, author = ?, genre = ?, description = ? WHERE id = ?',
      [title, author, genre, description, id]
    );
    
    if (result.affectedRows === 0) {
      return c.json({ error: 'Book not found' }, 404);
    }
    
    return c.json({ message: 'Book updated successfully' });
    
  } catch (error) {
    console.error('Update book error:', error);
    return c.json({ error: 'Failed to update book' }, 500);
  }
});

/**
 * DELETE /books/:id
 * Delete book (pustakawan only)
 */
books.delete('/:id', authMiddleware, pustakawanOnly, async (c) => {
  try {
    const id = c.req.param('id');
    
    const [result] = await pool.query<any>('DELETE FROM books WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return c.json({ error: 'Book not found' }, 404);
    }
    
    return c.json({ message: 'Book deleted successfully' });
    
  } catch (error) {
    console.error('Delete book error:', error);
    return c.json({ error: 'Failed to delete book' }, 500);
  }
});

/**
 * GET /books/search?q=query
 * Search books by title (public access)
 */
books.get('/search', async (c) => {
  try {
    const query = c.req.query('q') || '';
    
    const [rows] = await pool.query<Book[]>(
      'SELECT * FROM books WHERE title LIKE ? OR author LIKE ? OR genre LIKE ?',
      [`%${query}%`, `%${query}%`, `%${query}%`]
    );
    
    return c.json({ books: rows });
  } catch (error) {
    console.error('Search books error:', error);
    return c.json({ error: 'Failed to search books' }, 500);
  }
});

export default books;