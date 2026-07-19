import { Link } from 'react-router-dom';

export default function Insights() {
  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <h1 style={{ color: 'var(--primary)', fontSize: '1.75rem', marginBottom: '1rem' }}>Nutrient Insights</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Track micronutrients linked directly to your selected health goals.
      </p>

      <div className="premium-card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>Micronutrient Analysis</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.4' }}>
          Select health priorities during onboarding to view detailed biological system scores and deficiencies.
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
        <Link to="/meals" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem' }}>Meals</Link>
        <Link to="/insights" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>Insights</Link>
        <Link to="/profile" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem' }}>Profile</Link>
      </div>
    </div>
  );
}
