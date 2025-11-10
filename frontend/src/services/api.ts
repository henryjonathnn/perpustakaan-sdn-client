// frontend/src/services/api.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== TYPES ====================
export interface User {
  id: number;
  username: string;
  role: 'siswa' | 'pustakawan';
  created_at: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  genre_id: number;
  genre_name: string;
  synopsis: string;
  cover_img: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookWithSimilarity extends Book {
  similarity?: number;
}

export interface LoginResponse {
  token: string;
  user: User;
  message: string;
}

export interface Genre {
  id: number;
  name: string;
  created_at: string;
}

// ==================== AUTH APIs ====================
export const authAPI = {
  login: (username: string, password: string) =>
    api.post<LoginResponse>('/auth/login', { username, password }),
  
  register: (username: string, password: string, role: 'siswa' | 'pustakawan' = 'siswa') =>
    api.post('/auth/register', { username, password, role }),
  
  logout: () => api.post('/auth/logout'),
};

// ==================== BOOKS APIs ====================
export const booksAPI = {
  getAll: () => api.get<{ books: Book[] }>('/books'),
  
  getById: (id: number) => api.get<{ book: Book }>(`/books/${id}`),
  
  search: (query: string) =>
    api.get<{ books: Book[] }>(`/books/search?q=${encodeURIComponent(query)}`),
  
  create: (formData: FormData) =>
    api.post<{ message: string; bookId: number }>('/books', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  update: (id: number, formData: FormData) =>
    api.put<{ message: string }>(`/books/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  delete: (id: number) => api.delete<{ message: string }>(`/books/${id}`),
};

// ==================== RECOMMENDATION APIs ====================
export const recommendAPI = {
  getByBookId: (id: number) =>
    api.get<{ targetBook: Book; recommendations: BookWithSimilarity[] }>(`/recommend/${id}`),
  
  getByTitle: (title: string) =>
    api.get<{ targetBook: Book; recommendations: BookWithSimilarity[] }>(
      `/recommend?title=${encodeURIComponent(title)}`
    ),
};

// ==================== GENRES APIs ====================
export const genresAPI = {
  getAll: () => api.get<{ success: boolean; data: Genre[] }>('/genres'),
};

// ==================== USERS APIs ====================
export const usersAPI = {
  getAll: () => api.get<{ users: User[] }>('/users'),
  
  getById: (id: number) => api.get<{ user: User }>(`/users/${id}`),
  
  create: (data: { username: string; password: string; role: 'siswa' | 'pustakawan' }) =>
    api.post<{ message: string; userId: number }>('/users', data),
  
  update: (id: number, data: { username?: string; password?: string; role?: 'siswa' | 'pustakawan' }) =>
    api.put<{ message: string }>(`/users/${id}`, data),
  
  delete: (id: number) => api.delete<{ message: string }>(`/users/${id}`),
};

export default api;