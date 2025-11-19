import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from 'react-bootstrap';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, isAuthenticated, loading } = useAuth();

    // 1. Wait for Auth Check to finish
    if (loading) {
        return (
            <div className="d-flex justify-content-center mt-5">
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    // 2. If not logged in, kick to Login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // 3. If logged in but wrong role (e.g., User trying to access Admin)
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to their appropriate dashboard based on their actual role
        return <Navigate to={user.role === 'admin' ? '/admin' : '/user'} replace />;
    }

    // 4. Access Granted
    return <Outlet />;
};

export default ProtectedRoute;
