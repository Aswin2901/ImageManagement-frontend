import axios from 'axios';

const api = axios.create({
  baseURL: 'https://image-management-psi.vercel.app/',  // Base API URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
