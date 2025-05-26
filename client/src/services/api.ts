import axios from 'axios';

// Use relative URL path to work with the proxy setting in package.json
const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Ensures cookies are sent with requests
});

export default api;
