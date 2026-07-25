import { useEffect } from 'react';
import { useUser } from '../../context/UserContext';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { id: 'edit-profile',       icon: '✏️', label: 'Edit Profile'         },
  { id: 'workout-ai',         icon: '🏋️', label: 'Workout AI Plan'       },
  { id: 'blood-health',       icon: '🩸', label: 'Blood Health Analysis' },
  { id: 'personal-trainer',   icon: '🧑‍💼', label: 'Your Personal Trainer' },
  { id: 'ai-nutrition-coach', icon: '🤖', label: 'AI Nutrition Coach'    },
  { id: 'account-settings',   icon: '⚙️', label: 'Account & Settings'   },
  { id: 'safety-centre',      icon: '🛡️', label: 'Safety Centre'         },
  { id: 'help-support',       icon: '❓', label: 'Help & Support'         },
];

/**
 * Slide-in Profile Drawer — opens from the right edge.
 * Triggered by the circular user avatar in AppHeader.
 * Spec: ui-screens-spec.md Screen 10.
 */
export default function ProfileDrawer({ isOpen, onClose }: ProfileDrawerProps) {
  const { currentUser, logoutUser } = useUser();

  const initials = (currentUser?.name ?? 'U')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const userId = currentUser?.email?.split('@')[0] ?? 'user';

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <>
      {/* ── Backdrop ──────────────────────────────────────────── */}
      <div
        id="profile-drawer-backdrop"
        aria-hidden={!isOpen}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: 200,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.28s ease',
        }}
      />

      {/* ── Drawer Panel ──────────────────────────────────────── */}
      <div
        id="profile-drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-label="User Profile"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '80vw',
          maxWidth: 320,
          backgroundColor: 'var(--bg-card)',
          zIndex: 201,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.28s cubic-bezier(0.32, 0.72, 0, 1)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.15)',
        }}
      >
        {/* ── Close button ──────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 16px 0' }}>
          <button
            id="profile-drawer-close"
            aria-label="Close profile drawer"
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>

        {/* ── Profile Header ────────────────────────────────── */}
        <div style={{ padding: '12px 20px 20px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
          {/* Avatar */}
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
            <div
              id="drawer-avatar"
              aria-label={`Avatar for ${currentUser?.name}`}
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), #047857)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontSize: '1.4rem',
                fontWeight: 700,
                margin: '0 auto',
              }}
            >
              {initials}
            </div>
            <button
              aria-label="Edit avatar"
              style={{
                position: 'absolute',
                bottom: 0,
                right: -2,
                width: 22,
                height: 22,
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--bg-card)',
                fontSize: '0.6rem',
                cursor: 'pointer',
              }}
            >
              ✏️
            </button>
          </div>

          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>
            {currentUser?.name ?? 'User'}
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 12 }}>
            {userId}
          </p>

          {/* Pro Max Member badge */}
          <div
            id="drawer-membership-badge"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 12px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(245, 158, 11, 0.10)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
            }}
          >
            <span style={{ fontSize: '0.85rem' }}>⭐</span>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#D97706' }}>Pro Max Member</p>
              <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Expiring on 27th August</p>
            </div>
          </div>
        </div>

        {/* ── Navigation List ───────────────────────────────── */}
        <div style={{ flex: 1, padding: '4px 0' }}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              id={`drawer-nav-${item.id}`}
              onClick={() => {/* future route handling */}}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 20px',
                borderBottom: '1px solid var(--divider)',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: '1.05rem', width: 22, textAlign: 'center' }}>{item.icon}</span>
                <span style={{ fontSize: '0.86rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {item.label}
                </span>
              </div>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth={2} strokeLinecap="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          ))}
        </div>

        {/* ── User Stats Row ────────────────────────────────── */}
        {currentUser && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              padding: '14px 20px',
              borderTop: '1px solid var(--border)',
              borderBottom: '1px solid var(--border)',
            }}
          >
            {[
              { label: 'Goal',     value: currentUser.primaryGoal?.split(' ')[0] ?? '—' },
              { label: 'Activity', value: currentUser.activityLevel ?? '—' },
              { label: 'Diet',     value: currentUser.dietType?.split('-')[0] ?? '—' },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>{stat.value}</p>
                <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: 2 }}>{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Sign Out ──────────────────────────────────────── */}
        <div style={{ padding: '16px 20px 32px' }}>
          <button
            id="drawer-sign-out-btn"
            onClick={() => { logoutUser(); onClose(); }}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 'var(--radius-full)',
              border: '1.5px solid var(--color-red-bg)',
              backgroundColor: 'transparent',
              color: 'var(--color-red)',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}
