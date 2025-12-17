import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me')
};

export const chatAPI = {
  searchUsers: (query) => api.get('/chat/users/search', { params: { query } }),
  addContact: (contactId) => api.post('/chat/contacts/add', { contactId }),
  getContacts: () => api.get('/chat/contacts'),
  removeContact: (contactId) => api.delete(`/chat/contacts/${contactId}`),
  sendMessage: (data) => api.post('/chat/messages', data),
  getMessages: (userId, params) => api.get(`/chat/messages/${userId}`, { params }),
  getUnreadCount: () => api.get('/chat/unread')
};

export default api;