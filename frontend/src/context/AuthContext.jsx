// src/context/AuthContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import api, { getCsrfCookie } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // auth check loading

    // 1. App start पर check करें कि user already login है या नहीं
    useEffect(() => {
        const checkUser = async () => {
            try {
                const { data } = await api.get('/api/user'); // auth:sanctum route
                setUser(data);
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkUser();

        // Auto logout event (अगर future में use करना हो)
        const handleAutoLogout = () => setUser(null);
        window.addEventListener('auth:logout', handleAutoLogout);
        return () => window.removeEventListener('auth:logout', handleAutoLogout);
    }, []);

    // 2. LOGIN – important part (पहले यहाँ से ही 401 वाली timing issue आ रही थी)
    const login = async (credentials) => {
        // a) CSRF cookie
        await getCsrfCookie();

        // b) Login – Laravel Sanctum session cookie set करेगा
        await api.post('/api/login', credentials);

        // c) अब Sanctum से confirm करो कि user login है
        const { data } = await api.get('/api/user');
        setUser(data);

        return data; // optional
    };

    // 3. LOGOUT
    const logout = async () => {
        try {
            await api.post('/api/logout');
        } catch (e) {
            // ignore
        } finally {
            setUser(null);
        }
    };

    // 4. Helpers
    const hasActivity = (activityName) =>
        user?.activities?.some(act => act.name === activityName) ?? false;

    const isAdmin = user?.role === 'admin';

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                hasActivity,
                isAdmin,
                loading,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
