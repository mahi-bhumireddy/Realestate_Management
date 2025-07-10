import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Server responded with an error
            console.error('Server Error:', error.response.data);
            
            // Handle 401 Unauthorized
            if (error.response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                // Optionally redirect to login page
                window.location.href = '/login';
            }
        } else if (error.request) {
            // Request was made but no response
            console.error('Network Error:', error.request);
        } else {
            // Something else went wrong
            console.error('Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export { api }; 