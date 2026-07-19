import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext.tsx';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser, loading } = useUser();

  if (loading) {
    return (
      <div 
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: 'var(--bg-dark)',
          color: 'var(--text-primary)'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: 'var(--primary)' }}>Analyzing health session...</h2>
          <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>Just a moment</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
