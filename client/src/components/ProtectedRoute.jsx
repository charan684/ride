import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// Example: Replace this with your actual authentication logic
const isAuthenticated = () => {
    
    return !!localStorage.getItem('token');
};

const ProtectedRoute = ({children}) => {
    return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;