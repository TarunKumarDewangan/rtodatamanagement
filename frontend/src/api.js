import axios from 'axios';

// 1. Determine Base URL automatically
// Localhost uses port 8000. Production uses the subdomain API.
const BASE_URL = import.meta.env.MODE === 'development'
    ? 'http://localhost:8000'
    : 'https://api.rtodatahub.in';

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, // CRITICAL: Allows cookies to travel between rtodatahub.in and api.rtodatahub.in
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// 2. CSRF Token Handling
api.interceptors.request.use(config => {
    const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];

    if (token) {
        config.headers['X-XSRF-TOKEN'] = decodeURIComponent(token);
    }
    return config;
});

// 3. Handle 401 (Unauthorized) Errors
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            console.warn("Session expired or unauthorized (401).");
            // window.dispatchEvent(new Event('auth:logout'));
        }
        return Promise.reject(error);
    }
);

// 4. Helper to get the initial cookie
export const getCsrfCookie = () => api.get('/sanctum/csrf-cookie');

export default api;
