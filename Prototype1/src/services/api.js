import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('innerverse_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('innerverse_token');
      localStorage.removeItem('innerverse_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (email, password) => 
    api.post('/auth/register', { email, password }),
  
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  
  getCurrentUser: () => 
    api.get('/auth/me'),
};

// Profile API calls
export const profileAPI = {
  saveProfile: (profileData) => 
    api.post('/profile', profileData),
  
  getProfile: () => 
    api.get('/profile'),
};

// Analysis API calls
export const analysisAPI = {
  extractIngredients: (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    return api.post('/analysis/extract-ingredients', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  analyzeIngredients: (ingredientsList, productName) => 
    api.post('/analysis/analyze-ingredients', {
      ingredients_list: ingredientsList,
      product_name: productName,
    }),
  
  getIngredient: (ingredientName) => 
    api.get(`/analysis/ingredient/${encodeURIComponent(ingredientName)}`),
};

// Helper functions
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('innerverse_token', token);
  } else {
    localStorage.removeItem('innerverse_token');
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('innerverse_token');
};

export const setUser = (user) => {
  if (user) {
    localStorage.setItem('innerverse_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('innerverse_user');
  }
};

export const getUser = () => {
  const user = localStorage.getItem('innerverse_user');
  return user ? JSON.parse(user) : null;
};

export const logout = () => {
  localStorage.removeItem('innerverse_token');
  localStorage.removeItem('innerverse_user');
};

export default api;

