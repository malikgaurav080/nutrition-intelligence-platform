import { Link } from 'react-router-dom';

export default function Meals() {
  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <h1 style={{ color: 'var(--primary)', fontSize: '1.75rem', marginBottom: '1rem' }}>Log Meal</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Search foods to compute micro targets and log daily intake slots.
      </p>

      <div className="premium-card" style={{ marginBottom: '1.5rem', textAlign: 'center', padding: '40px 20px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>No meals logged yet today.</p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
          Start with breakfast to begin tracking today's nutrition.
        </p>
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
        <Link to="/dashboard" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem' }}>Home</Link>
        <Link to="/meals" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>Meals</Link>
        <Link to="/insights" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem' }}>Insights</Link>
        <Link to="/profile" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem' }}>Profile</Link>
      </div>
    </div>
  );
}
