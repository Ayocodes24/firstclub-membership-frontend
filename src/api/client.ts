import axios from 'axios';

// Hits the Vite dev proxy, which forwards /api → http://localhost:8080.
export const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});
