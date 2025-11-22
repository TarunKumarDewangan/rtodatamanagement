// src/context/AuthContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import api, { getCsrfCookie } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // App start पर existing session check
    useEffect(() => {
        const checkUser = async () => {
            try {
                const { data } = await api.get('/api/user');
                setUser(data);
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkUser();

        const handleAutoLogout = () => setUser(null);
        window.addEventListener('auth:logout', handleAutoLogout);
        return () => window.removeEventListener('auth:logout', handleAutoLogout);
    }, []);

    // 🔑 LOGIN – main change यहाँ है
    const login = async (credentials) => {
        // 1) CSRF cookie
        await getCsrfCookie();

        // 2) Login – अगर credentials गलत हैं तो यहीं error throw होगा
        const loginRes = await api.post('/api/login', credentials);

        // login response से user (Laravel भेज रहा है 'user' key में)
        let loggedInUser = loginRes.data?.user;

        // 3) Optional confirmation from /api/user
        try {
            const { data } = await api.get('/api/user');
            loggedInUser = data;
        } catch (error) {
            // अगर /api/user 401 दे और हमारे पास loginRes से user है,
            // तो इस error को ignore कर देंगे (UI में "Unauthenticated" नहीं दिखाएंगे)
            if (error.response?.status === 401 && loggedInUser) {
                console.warn(
                    'Login success, but first /api/user returned 401. Using user from /api/login response.',
                    error
                );
            } else {
                // कोई और error है या loginRes में user ही नहीं मिला -> सच में fail
                throw error;
            }
        }

        setUser(loggedInUser);
        return loggedInUser;
    };

    const logout = async () => {
        try {
            await api.post('/api/logout');
        } catch (e) {
            console.warn('Logout API failed, but clearing local state anyway.', e);
        } finally {
            setUser(null);
        }
    };

    const hasActivity = (activityName) =>
        user?.activities?.some((act) => act.name === activityName) ?? false;

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
