import axios from 'axios';

// 1. Set Base URL (Your Laravel API)
const api = axios.create({
    baseURL: 'http://localhost:8000',
    withCredentials: true, // Crucial for Sanctum cookies
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// 2. CSRF Token Handling
// Laravel saves the token in a cookie named 'XSRF-TOKEN'.
// Browsers automatically send cookies, but we must extract it for the header.
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

// 3. Handle 401 (Unauthorized) Errors globally
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            // I have commented this out to prevent random logouts during development.
            // If you want to enable strict security later, uncomment it.

            // window.dispatchEvent(new Event('auth:logout'));

            console.warn("401 Unauthorized detected. Session might be expired, but staying on page to preserve data.");
        }
        return Promise.reject(error);
    }
);

// 4. Helper to get the initial cookie
export const getCsrfCookie = () => api.get('/sanctum/csrf-cookie');

export default api;
