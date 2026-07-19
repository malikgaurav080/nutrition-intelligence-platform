import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext.tsx';

export default function Dashboard() {
  const { currentUser, logoutUser } = useUser();

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: 'var(--primary)', fontSize: '1.75rem' }}>Health Command Center</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Welcome back, {currentUser?.name || 'Explorer'}
          </p>
        </div>
        <button 
          onClick={logoutUser}
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--error)',
            border: '1px solid var(--error)',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 500
          }}
        >
          Disconnect
        </button>
      </div>

      <div className="premium-card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>Overall Nutrition Score</h2>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem' }}>
          <span className="tabular-nums" style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--primary)' }}>84%</span>
          <span style={{ color: 'var(--primary)', fontWeight: 500 }}>Optimal</span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
          Calculated using WHO MAR method for {currentUser?.healthPriorities.length || 0} selected health systems.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        <div className="premium-card">
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Primary Goal</h3>
          <p style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: '0.5rem', color: 'var(--secondary)' }}>
            {currentUser?.primaryGoal}
          </p>
        </div>

        <div className="premium-card">
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Diet Profile</h3>
          <p style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: '0.5rem', color: 'var(--secondary)' }}>
            {currentUser?.dietType}
          </p>
        </div>
      </div>

      {/* Persistent Bottom Bar placeholder */}
      <div 
        className="glass-panel"
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 40px)',
          maxWidth: '390px',
          borderRadius: '16px',
          padding: '12px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
        }}
      >
        <Link to="/dashboard" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>Home</Link>
        <Link to="/meals" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem' }}>Meals</Link>
        <Link to="/insights" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem' }}>Insights</Link>
        <Link to="/profile" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem' }}>Profile</Link>
      </div>
    </div>
  );
}
