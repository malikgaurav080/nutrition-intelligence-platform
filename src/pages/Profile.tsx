import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext.tsx';

export default function Profile() {
  const { currentUser } = useUser();

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <h1 style={{ color: 'var(--primary)', fontSize: '1.75rem', marginBottom: '1.5rem' }}>User Profile</h1>

      <div className="premium-card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: '1rem' }}>Personal Specifications</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--divider)', paddingBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Name</span>
            <span>{currentUser?.name}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--divider)', paddingBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Email</span>
            <span>{currentUser?.email}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--divider)', paddingBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Gender</span>
            <span>{currentUser?.gender}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--divider)', paddingBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Height</span>
            <span className="tabular-nums">{currentUser?.height} cm</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--divider)', paddingBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Weight</span>
            <span className="tabular-nums">{currentUser?.weight} kg</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Activity Level</span>
            <span>{currentUser?.activityLevel}</span>
          </div>
        </div>
      </div>

      <div className="premium-card">
        <h2 style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: '1rem' }}>Selected Health Priorities</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {currentUser?.healthPriorities.map(p => (
            <span 
              key={p}
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--divider)',
                color: 'var(--text-primary)',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.8rem'
              }}
            >
              {p}
            </span>
          ))}
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
        <Link to="/dashboard" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem' }}>Home</Link>
        <Link to="/meals" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem' }}>Meals</Link>
        <Link to="/insights" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem' }}>Insights</Link>
        <Link to="/profile" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>Profile</Link>
      </div>
    </div>
  );
}
