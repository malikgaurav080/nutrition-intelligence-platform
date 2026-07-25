import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import AppHeader from '../components/layout/AppHeader';
import BottomNav from '../components/layout/BottomNav';

const NAV_ITEMS = [
  { id: 'edit-profile',       icon: '✏️', label: 'Edit Profile'          },
  { id: 'workout-ai',         icon: '🏋️', label: 'Workout AI Plan'        },
  { id: 'blood-health',       icon: '🩸', label: 'Blood Health Analysis'  },
  { id: 'personal-trainer',   icon: '🧑‍💼', label: 'Your Personal Trainer'  },
  { id: 'ai-nutrition-coach', icon: '🤖', label: 'AI Nutrition Coach'     },
  { id: 'account-settings',   icon: '⚙️', label: 'Account & Settings'    },
  { id: 'safety-centre',      icon: '🛡️', label: 'Safety Centre'          },
  { id: 'help-support',       icon: '❓', label: 'Help & Support'          },
];

/**
 * Screen 9 — Profile & Settings
 * PRD Section 8, ui-screens-spec.md Screen 9:
 * User avatar card + Pro membership badge + navigation list.
 * User data from UserContext (backend /api/auth/me).
 */
export default function Profile() {
  const { currentUser, logoutUser } = useUser();
  const navigate = useNavigate();


  const userId = currentUser?.email?.split('@')[0] ?? 'ID';
  const initials = (currentUser?.name ?? 'U')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="app-container">
      {/* ── Header ───────────────────────────────────────────── */}
      <AppHeader
        left={
          <button aria-label="Go back" onClick={() => navigate(-1)} style={{ color: 'var(--text-primary)', display: 'flex' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        }
        title={
          <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Profile
          </h1>
        }
        right={
          <button aria-label="Settings" style={{ color: 'var(--text-secondary)', display: 'flex' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          </button>
        }
      />

      <div className="page-content">
        {/* ── User Profile Header Card ─────────────────────────── */}
        <div
          id="profile-header-card"
          className="card animate-fade-up"
          style={{ padding: 20, marginBottom: 16, textAlign: 'center', position: 'relative' }}
        >
          {/* Avatar */}
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), #047857)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontSize: '1.5rem',
                fontWeight: 700,
                margin: '0 auto',
              }}
              aria-label={`Avatar for ${currentUser?.name}`}
            >
              {initials}
            </div>
            <button
              aria-label="Edit avatar"
              style={{
                position: 'absolute',
                bottom: 0,
                right: -4,
                width: 24,
                height: 24,
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--bg-card)',
                fontSize: '0.65rem',
                cursor: 'pointer',
              }}
            >
              ✏️
            </button>
          </div>

          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            {currentUser?.name ?? 'User'}
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 12 }}>
            ID · {userId}
          </p>

          {/* Membership badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              cursor: 'pointer',
            }}
            onClick={() => {/* navigate to membership */}}
          >
            <span style={{ fontSize: '0.9rem' }}>⭐</span>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#D97706' }}>Pro Max Member</p>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Expiring on 27th August</p>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth={2} strokeLinecap="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>

        {/* ── Navigation List ──────────────────────────────────── */}
        <div className="card animate-fade-up delay-1" style={{ padding: '0 16px' }}>
          {NAV_ITEMS.map((item) => (
            <div
              key={item.id}
              id={`profile-nav-${item.id}`}
              className="nav-list-item"
              onClick={() => {/* route handling per item */}}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && void 0}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: '1.1rem', width: 24, textAlign: 'center' }}>{item.icon}</span>
                <p style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {item.label}
                </p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth={2} strokeLinecap="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          ))}
        </div>

        {/* ── User Stats Mini-Row ──────────────────────────────── */}
        {currentUser && (
          <div
            className="card animate-fade-up delay-2"
            style={{ marginTop: 14, padding: '14px 20px', display: 'flex', justifyContent: 'space-around' }}
          >
            {[
              { label: 'Goal',     value: currentUser.primaryGoal.split(' ')[0] },
              { label: 'Activity', value: currentUser.activityLevel },
              { label: 'Diet',     value: currentUser.dietType.split('-')[0] },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>{stat.value}</p>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Sign Out button ──────────────────────────────────── */}
        <button
          id="sign-out-btn"
          className="btn-ghost"
          onClick={logoutUser}
          style={{ width: '100%', marginTop: 16, color: 'var(--color-red)', borderColor: 'var(--color-red-bg)' }}
        >
          Sign Out
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
