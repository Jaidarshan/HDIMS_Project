import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Hits the proxy
  withCredentials: true // IMPORTANT: Allows sending cookies (flask_login session)
});

export default api;