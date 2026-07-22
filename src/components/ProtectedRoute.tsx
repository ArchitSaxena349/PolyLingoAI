import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, initialLoading, isSupabaseConfigured } = useAuth();

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // If the user is logged in (even via demo account), allow them through regardless
  // of whether Supabase is configured
  if (user) {
    return <>{children}</>;
  }

  // No user at all — redirect to setup if Supabase isn't configured, otherwise to auth
  if (!isSupabaseConfigured) {
    return <Navigate to="/setup" replace />;
  }

  return <Navigate to="/auth" replace />;
};

export default ProtectedRoute;