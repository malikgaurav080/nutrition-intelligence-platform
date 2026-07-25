import { NavLink, useNavigate } from 'react-router-dom';

/**
 * Shared bottom navigation bar — 5-tab floating glass bar.
 * Tab order: Home | Meals | ➕ (center FAB) | Progress | Profile
 * Matches UI.png reference design.
 */
export default function BottomNav() {
  const navigate = useNavigate();

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {/* Home */}
      <NavLink to="/dashboard" id="nav-home" end>
        {({ isActive }) => (
          <>
            <svg viewBox="0 0 24 24" fill={isActive ? 'var(--primary)' : 'none'} stroke={isActive ? 'var(--primary)' : 'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span style={{ color: isActive ? 'var(--primary)' : undefined }}>Home</span>
          </>
        )}
      </NavLink>

      {/* Meals */}
      <NavLink to="/meals" id="nav-meals">
        {({ isActive }) => (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke={isActive ? 'var(--primary)' : 'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a5 5 0 00-5 5v3H5a1 1 0 00-1 1v10a1 1 0 001 1h14a1 1 0 001-1V11a1 1 0 00-1-1h-2V7a5 5 0 00-5-5z" />
              <circle cx="12" cy="15" r="2" />
            </svg>
            <span style={{ color: isActive ? 'var(--primary)' : undefined }}>Meals</span>
          </>
        )}
      </NavLink>

      {/* Floating Action Button — center */}
      <button
        id="nav-log-food"
        aria-label="Log food"
        onClick={() => navigate('/log-food')}
        style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          backgroundColor: 'var(--primary)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(22, 163, 74, 0.4)',
          border: 'none',
          cursor: 'pointer',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          flexShrink: 0,
          marginBottom: 8,
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {/* Progress → Health screen */}
      <NavLink to="/health" id="nav-progress">
        {({ isActive }) => (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke={isActive ? 'var(--primary)' : 'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            <span style={{ color: isActive ? 'var(--primary)' : undefined }}>Progress</span>
          </>
        )}
      </NavLink>

      {/* Reports — replaces Profile tab per ui-screens-spec.md Screen 9 */}
      <NavLink to="/reports" id="nav-reports">
        {({ isActive }) => (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke={isActive ? 'var(--primary)' : 'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4"  />
              <line x1="6"  y1="20" x2="6"  y2="14" />
            </svg>
            <span style={{ color: isActive ? 'var(--primary)' : undefined }}>Reports</span>
          </>
        )}
      </NavLink>
    </nav>
  );
}
