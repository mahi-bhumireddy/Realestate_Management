import axios from 'axios';
import authService from './AuthService';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests and handle FormData
api.interceptors.request.use((config) => {
  const token = authService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Remove Content-Type header for FormData
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

// Property API
export const propertyApi = {
  getAllProperties: () => api.get('/properties'),
  getProperty: (id) => api.get(`/properties/${id}`),
  createProperty: (formData) => api.post('/seller/property', formData),
  updateProperty: (id, property) => api.put(`/properties/${id}`, property),
  deleteProperty: (id) => api.delete(`/properties/${id}`),
  getSellerProperties: () => api.get('/seller/myProperty'),
  getBuyerProperties: () => api.get('/properties/buyer'),
  searchProperties: (params) => api.get('/properties/search', { params }),
};

// Advertisement API
export const advertisementApi = {
  getAllAdvertisements: () => api.get('/advertisements'),
  getAdvertisement: (id) => api.get(`/advertisements/${id}`),
  createAdvertisement: (advertisement) => api.post('/advertisements', advertisement),
  updateAdvertisement: (id, advertisement) => api.put(`/advertisements/${id}`, advertisement),
  deleteAdvertisement: (id) => api.delete(`/advertisements/${id}`),
  getPropertyAdvertisements: (propertyId) => api.get(`/advertisements/property/${propertyId}`),
  getActiveAdvertisements: () => api.get('/advertisements/active'),
  getExpiredAdvertisements: () => api.get('/advertisements/expired'),
  getUpcomingAdvertisements: () => api.get('/advertisements/upcoming'),
  getSellerAdvertisements: () => api.get('/seller/advertisement-status'),
  createSellerAdvertisement: (data) => api.post('/seller/advertise', data),
};

// Employee API
export const employeeApi = {
  getAdvertisements: () => api.get('/employee/advertisements'),
  createAdvertisement: (formData) => api.post('/employee/advertisement', formData),
  updateAdvertisement: (id, formData) => api.put(`/employee/advertisement/${id}`, formData),
  deleteAdvertisement: (id) => api.delete(`/employee/advertisement/${id}`),
};

// Buyer API
export const buyerApi = {
  getFavorites: () => api.get('/buyer/favorites'),
  addToFavorites: (propertyId) => api.post('/buyer/favorites', { propertyId }),
  removeFromFavorites: (propertyId) => api.delete(`/buyer/favorites/${propertyId}`),
  getPurchasedProperties: () => api.get('/buyer/purchased'),
  getAllPurchasedProperties: () => api.get('/buyer/purchased-properties'),
};

// Admin API
export const adminApi = {
  getDashboardStats: () => api.get('/admin/dashboard-stats'),
};

export default {
  propertyApi,
  advertisementApi,
  buyerApi,
  adminApi,
  employeeApi,
}; 