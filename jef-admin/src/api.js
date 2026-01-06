import axios from 'axios';

// Adresa de bază a backend-ului Spring Boot
const API_BASE_URL = 'http://localhost:8080/api/admin';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        // Aici vei adăuga Token-ul JWT după ce colegul 1 îl implementează
        // 'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
});

export default api;