import React, { useContext, useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const { addToast } = useBooking();
  const location = useLocation();
  const hasNotified = useRef(false);

  useEffect(() => {
    if (!loading && !isAuthenticated && !hasNotified.current) {
      hasNotified.current = true;
      addToast('Security Notice: Please log in or sign up to complete your booking.', 'warning');
    }
  }, [loading, isAuthenticated, addToast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;

