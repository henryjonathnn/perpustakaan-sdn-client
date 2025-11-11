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
    const [rows] = await pool.query<Book[]>(
      `SELECT b.*, g.name as genre_name 
       FROM books b 
       INNER JOIN genres g ON b.genre_id = g.id 
       ORDER BY b.created_at DESC`
    );
    return c.json({ books: rows });
  } catch (error) {
    console.error('Get books error:', error);
    return c.json({ error: 'Failed to fetch books' }, 500);
  }
});

/**
 * GET /books/search?q=query
 * Search books by title, author, or synopsis (public access)
 * IMPORTANT: Must be defined BEFORE /:id route
 */
books.get('/search', async (c) => {
  try {
    const query = c.req.query('q') || '';
    const genreId = c.req.query('genre') || '';
    
    let sql = `
      SELECT b.*, g.name as genre_name 
      FROM books b 
      INNER JOIN genres g ON b.genre_id = g.id 
      WHERE b.title LIKE ? OR b.author LIKE ? OR b.synopsis LIKE ?
    `;
    let params = [`%${query}%`, `%${query}%`, `%${query}%`];
    
    if (genreId) {
      sql += ' AND b.genre_id = ?';
      params.push(genreId);
    }
    
    sql += ' ORDER BY b.created_at DESC';
    
    const [rows] = await pool.query<Book[]>(sql, params);
    
    return c.json({ books: rows });
  } catch (error) {
    console.error('Search books error:', error);
    return c.json({ error: 'Failed to search books' }, 500);
  }
});


/**
 * GET /books/:id
 * Get single book by ID (public access)
 */
books.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const [rows] = await pool.query<Book[]>(
      `SELECT b.*, g.name as genre_name 
       FROM books b 
       INNER JOIN genres g ON b.genre_id = g.id 
       WHERE b.id = ?`, 
      [id]
    );
    
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
    // Handling multipart form data
    const formData = await c.req.formData();
    const title = formData.get('title') as string;
    const author = formData.get('author') as string;
    const genreId = formData.get('genreId') as string;
    const synopsis = formData.get('synopsis') as string;
    const coverImage = formData.get('coverImage') as File;
    
    if (!title || !author || !genreId || !synopsis) {
      return c.json({ error: 'All fields are required' }, 400);
    }
    
    let coverImageName = null;
    if (coverImage) {
      const validation = validateImage(coverImage);
      if (!validation.valid) {
        return c.json({ error: validation.error }, 400);
      }
      coverImageName = await saveFile(coverImage);
    }
    
    const [result] = await pool.query<any>(
      'INSERT INTO books (title, author, genre_id, synopsis, cover_img) VALUES (?, ?, ?, ?, ?)',
      [title, author, genreId, synopsis, coverImageName]
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
    const formData = await c.req.formData();
    const title = formData.get('title') as string;
    const author = formData.get('author') as string;
    const genreId = formData.get('genreId') as string;
    const synopsis = formData.get('synopsis') as string;
    const coverImage = formData.get('coverImage') as File;
    
    if (!title || !author || !genreId || !synopsis) {
      return c.json({ error: 'All fields are required' }, 400);
    }
    
    // Get current book data for cover image handling
    const [currentBook] = await pool.query<Book[]>(
      'SELECT cover_img FROM books WHERE id = ?',
      [id]
    );
    
    if (currentBook.length === 0) {
      return c.json({ error: 'Book not found' }, 404);
    }
    
    let coverImageName = currentBook[0].cover_img;
    
    if (coverImage) {
      const validation = validateImage(coverImage);
      if (!validation.valid) {
        return c.json({ error: validation.error }, 400);
      }
      
      // Delete old cover image if exists
      if (coverImageName) {
        deleteFile(coverImageName);
      }
      
      coverImageName = await saveFile(coverImage);
    }
    
    const [result] = await pool.query<any>(
      'UPDATE books SET title = ?, author = ?, genre_id = ?, synopsis = ?, cover_img = ? WHERE id = ?',
      [title, author, genreId, synopsis, coverImageName, id]
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
    
    // Get current book data for cover image deletion
    const [currentBook] = await pool.query<Book[]>(
      'SELECT cover_img FROM books WHERE id = ?',
      [id]
    );
    
    if (currentBook.length > 0 && currentBook[0].cover_img) {
      deleteFile(currentBook[0].cover_img);
    }
    
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

export default books;