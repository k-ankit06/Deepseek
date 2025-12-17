import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, role }) => {
  const location = useLocation();
  
  // Check if user is logged in
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('token');

  // If no user/token, redirect to login
  if (!user || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role if specified
  if (role && user.role !== role) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/teacher" replace />;
    }
  }

  // Check if trying to access admin routes without admin role
  if (location.pathname.startsWith('/admin') && user.role !== 'admin') {
    return <Navigate to="/teacher" replace />;
  }

  // Check if trying to access teacher routes without teacher role
  if (location.pathname.startsWith('/teacher') && user.role !== 'teacher') {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

// Hook to check authentication
export const useAuth = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('token');

  return {
    isAuthenticated: !!user && !!token,
    user,
    token,
    isAdmin: user?.role === 'admin',
    isTeacher: user?.role === 'teacher'
  };
};

// Hook to require auth
export const requireAuth = () => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    window.location.href = '/login';
  }
};

export default ProtectedRoute;