import React, { createContext, useState, useEffect, useContext } from 'react';
import api, { getCsrfCookie } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Loading state for initial check

    // 1. Check if user is already logged in when app starts
    useEffect(() => {
        const checkUser = async () => {
            try {
                const { data } = await api.get('/api/user');
                setUser(data);
            } catch (error) {
                // Not logged in, that's fine
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkUser();

        // Listen for auto-logout events (from api.js)
        const handleAutoLogout = () => setUser(null);
        window.addEventListener('auth:logout', handleAutoLogout);
        return () => window.removeEventListener('auth:logout', handleAutoLogout);
    }, []);

    // 2. Login Function
    const login = async (credentials) => {
        await getCsrfCookie(); // Get the cookie first
        const { data } = await api.post('/api/login', credentials);
        setUser(data.user); // Laravel returns { message, user: {...} }
    };

    // 3. Logout Function
    const logout = async () => {
        try {
            await api.post('/api/logout');
        } finally {
            setUser(null); // Clear state even if API fails
        }
    };

    // 4. Helper: Check Permissions
    const hasActivity = (activityName) => {
        return user?.activities?.some(act => act.name === activityName) ?? false;
    };

    const isAdmin = user?.role === 'admin';

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            hasActivity,
            isAdmin,
            loading,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
