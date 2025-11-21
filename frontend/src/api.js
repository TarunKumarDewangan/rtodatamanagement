import axios from 'axios';

// 1. Determine Base URL automatically
// If running locally via 'npm run dev', it uses localhost:8000.
// If built via 'npm run build', it uses your Production API.
const BASE_URL = import.meta.env.MODE === 'development'
    ? 'http://localhost:8000'
    : 'https://api.rtodatahub.in';

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, // Crucial for Sanctum cookies (Session Sharing)
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// 2. CSRF Token Handling
// Laravel saves the token in a cookie named 'XSRF-TOKEN'.
// Browsers automatically send cookies, but we must extract it for the header manually.
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
            // Warn in console, but don't auto-logout to avoid disruptions
            console.warn("Session might be expired or unauthorized (401).");

            // Uncomment below line if you want strict logout
            // window.dispatchEvent(new Event('auth:logout'));
        }
        return Promise.reject(error);
    }
);

// 4. Helper to get the initial cookie
export const getCsrfCookie = () => api.get('/sanctum/csrf-cookie');

export default api;
