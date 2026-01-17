import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/admin';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// INTERCEPTOR: Se execută ÎNAINTE de fiecare cerere
api.interceptors.request.use(
    (config) => {
        // 1. Căutăm userul și tokenul în memoria browserului
        const storedData = localStorage.getItem('jef_admin_user');
        
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            const token = parsedData.token; // Luăm tokenul salvat

            // 2. Dacă există token, îl atașăm la header
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;