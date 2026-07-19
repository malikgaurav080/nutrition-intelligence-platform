import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext.tsx';

export default function Splash() {
  const { currentUser, loading } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && currentUser) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, loading, navigate]);

  if (loading) {
    return null;
  }

  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-dark)',
        textAlign: 'center',
        padding: '20px'
      }}
    >
      <div className="premium-card" style={{ maxWidth: '400px', width: '100%' }}>
        <h1 style={{ color: 'var(--primary)', marginBottom: '1rem', fontSize: '2rem' }}>
          Nutrition Intelligence Platform
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.5' }}>
          Welcome to your scientific health operating system. Optimize your nutrition, track key biomarkers, and meet your health priorities.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link 
            to="/signup" 
            style={{
              display: 'block',
              backgroundColor: 'var(--primary)',
              color: 'var(--bg-dark)',
              padding: '12px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600
            }}
          >
            Start Personal Onboarding
          </Link>
          <Link 
            to="/login" 
            style={{
              display: 'block',
              border: '1px solid var(--divider)',
              color: 'var(--text-primary)',
              padding: '12px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 500,
              backgroundColor: 'rgba(255,255,255,0.02)'
            }}
          >
            Login to Command Center
          </Link>
        </div>
      </div>
    </div>
  );
}
