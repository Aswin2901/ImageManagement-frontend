import axios from 'axios';

const api = axios.create({
  baseURL: 'https://imagemanagement-tymu.onrender.com/',  // Base API URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
