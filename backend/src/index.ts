// src/index.ts
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serveStatic } from 'hono/bun';
import auth from './routes/auth';
import books from './routes/books';
import recommend from './routes/recommend';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

// Serve static files (uploaded images)
app.use('/uploads/*', serveStatic({ root: './' }));

// Health check
app.get('/', (c) => {
  return c.json({ 
    message: 'Book Recommendation API',
    version: '1.0.0',
    status: 'running'
  });
});

// Routes
app.route('/auth', auth);
app.route('/books', books);
app.route('/recommend', recommend);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

const port = parseInt(process.env.PORT || '3000');

console.log(`🚀 Server is running on http://localhost:${port}`);
console.log(`📁 Static files served at http://localhost:${port}/uploads`);

export default {
  port,
  fetch: app.fetch,
};