// src/routes/users.ts
import { Hono } from 'hono';
import bcrypt from 'bcryptjs';
import pool from '../db/mysql';
import { authMiddleware, pustakawanOnly } from '../middlewares/auth';
import type { User } from '../types';

const users = new Hono();

/**
 * GET /users
 * Get all users (pustakawan only)
 */
users.get('/', authMiddleware, pustakawanOnly, async (c) => {
  try {
    const [rows] = await pool.query<User[]>(
      'SELECT id, username, role, created_at FROM users ORDER BY created_at DESC'
    );
    
    // Don't send password hash
    const safeUsers = rows.map(({ password, ...user }) => user);
    
    return c.json({ users: safeUsers });
  } catch (error) {
    console.error('Get users error:', error);
    return c.json({ error: 'Failed to fetch users' }, 500);
  }
});

/**
 * GET /users/:id
 * Get single user by ID (pustakawan only)
 */
users.get('/:id', authMiddleware, pustakawanOnly, async (c) => {
  try {
    const id = c.req.param('id');
    const [rows] = await pool.query<User[]>(
      'SELECT id, username, role, created_at FROM users WHERE id = ?',
      [id]
    );
    
    if (rows.length === 0) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    return c.json({ user: rows[0] });
  } catch (error) {
    console.error('Get user error:', error);
    return c.json({ error: 'Failed to fetch user' }, 500);
  }
});

/**
 * POST /users
 * Create new user (pustakawan only)
 */
users.post('/', authMiddleware, pustakawanOnly, async (c) => {
  try {
    const { username, password, role = 'siswa' } = await c.req.json();
    
    if (!username || !password) {
      return c.json({ error: 'Username and password are required' }, 400);
    }
    
    if (!['siswa', 'pustakawan'].includes(role)) {
      return c.json({ error: 'Invalid role. Must be either "siswa" or "pustakawan"' }, 400);
    }
    
    // Check if username already exists
    const [existing] = await pool.query<User[]>(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );
    
    if (existing.length > 0) {
      return c.json({ error: 'Username already exists' }, 409);
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user
    const [result] = await pool.query<any>(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, hashedPassword, role]
    );
    
    return c.json({
      message: 'User created successfully',
      userId: result.insertId
    }, 201);
    
  } catch (error) {
    console.error('Create user error:', error);
    return c.json({ error: 'Failed to create user' }, 500);
  }
});

/**
 * PUT /users/:id
 * Update user (pustakawan only)
 */
users.put('/:id', authMiddleware, pustakawanOnly, async (c) => {
  try {
    const id = c.req.param('id');
    const { username, password, role } = await c.req.json();
    
    // Verify user exists
    const [existing] = await pool.query<User[]>(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    // Check if new username already exists (if username is being changed)
    if (username) {
      const [duplicates] = await pool.query<User[]>(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        [username, id]
      );
      
      if (duplicates.length > 0) {
        return c.json({ error: 'Username already exists' }, 409);
      }
    }
    
    // Build update query dynamically based on provided fields
    const updates: string[] = [];
    const values: any[] = [];
    
    if (username) {
      updates.push('username = ?');
      values.push(username);
    }
    
    if (password) {
      updates.push('password = ?');
      values.push(await bcrypt.hash(password, 10));
    }
    
    if (role) {
      if (!['siswa', 'pustakawan'].includes(role)) {
        return c.json({ error: 'Invalid role. Must be either "siswa" or "pustakawan"' }, 400);
      }
      updates.push('role = ?');
      values.push(role);
    }
    
    if (updates.length === 0) {
      return c.json({ error: 'No fields to update' }, 400);
    }
    
    // Add id to values array
    values.push(id);
    
    // Update user
    const [result] = await pool.query<any>(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    if (result.affectedRows === 0) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    return c.json({ message: 'User updated successfully' });
    
  } catch (error) {
    console.error('Update user error:', error);
    return c.json({ error: 'Failed to update user' }, 500);
  }
});

/**
 * DELETE /users/:id
 * Delete user (pustakawan only)
 */
users.delete('/:id', authMiddleware, pustakawanOnly, async (c) => {
  try {
    const id = c.req.param('id');
    
    const [result] = await pool.query<any>(
      'DELETE FROM users WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    return c.json({ message: 'User deleted successfully' });
    
  } catch (error) {
    console.error('Delete user error:', error);
    return c.json({ error: 'Failed to delete user' }, 500);
  }
});

export default users;