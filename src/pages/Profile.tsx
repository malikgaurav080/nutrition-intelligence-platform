import { NavLink } from 'react-router-dom';
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

      {/* Bottom Nav */}
      <nav className="bottom-nav" aria-label="Main navigation">
        <NavLink to="/dashboard" id="profile-nav-home">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Home
        </NavLink>
        <NavLink to="/insights" id="profile-nav-insights">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          Insights
        </NavLink>
        <NavLink to="/health" id="profile-nav-health">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
          </svg>
          Health
        </NavLink>
        <NavLink to="/meals" id="profile-nav-meals">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
            <path d="M12 8v4l3 3"/>
          </svg>
          Meals
        </NavLink>
        <NavLink to="/profile" id="profile-nav-profile">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          Profile
        </NavLink>
      </nav>
    </div>
  );
}
