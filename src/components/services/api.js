import axios from 'axios';

const api = axios.create({
  baseURL: 'https://aswin2901.pythonanywhere.com/',  // Base API URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
