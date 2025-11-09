import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface LoginRequest {
  username: string;
  password: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  genre: string;
  description: string;
  coverUrl?: string;
}

export const authService = {
  async login(data: LoginRequest) {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

export const bookService = {
  async getBooks() {
    const response = await api.get('/books');
    return response.data.books;
  },

  async searchBooks(query: string) {
    const response = await api.get(`/books/search?q=${query}`);
    return response.data.books;
  },

  async getBook(id: number) {
    const response = await api.get(`/books/${id}`);
    return response.data.book;
  },

  async getRecommendations(id: number) {
    const response = await api.get(`/recommend/${id}`);
    return response.data;
  },
};

export default api;