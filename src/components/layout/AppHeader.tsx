import { useState, type ReactNode } from 'react';
import { useUser } from '../../context/UserContext';
import ProfileDrawer from './ProfileDrawer';

interface AppHeaderProps {
  /** Left slot override (e.g. back button on sub-pages) */
  left?: ReactNode;
  /** Center/main title or greeting block */
  title: ReactNode;
  /** Right slot override (e.g. calendar/picker on sub-pages) */
  right?: ReactNode;
  /** Set true to suppress the merged avatar button on left (e.g. for auth pages) */
  hideAvatar?: boolean;
}

/**
 * Shared top application header bar.
 * Default Left slot: Merged Profile Avatar + Hamburger Badge button (matches reference image).
 * Default Right slot: Notification bell icon with red badge dot.
 *
 * Tapping the merged avatar button opens the ProfileDrawer.
 */
export default function AppHeader({ left, title, right, hideAvatar = false }: AppHeaderProps) {
  const { currentUser } = useUser();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const initials = (currentUser?.name ?? 'U')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px 8px',
          backgroundColor: 'var(--bg-app)',
        }}
      >
        {/* ── Left slot: Merged Profile Avatar + Hamburger Badge Button ── */}
        <div style={{ display: 'flex', alignItems: 'center', minWidth: 44 }}>
          {left ?? (
            !hideAvatar && (
              <button
                id="header-avatar-btn"
                aria-label="Open profile menu"
                onClick={() => setDrawerOpen(true)}
                style={{
                  position: 'relative',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  background: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.06)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                }}
              >
                {/* Main Profile Avatar Circle */}
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary), #047857)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                    overflow: 'hidden',
                  }}
                >
                  {initials}
                </div>

                {/* Overlapping Hamburger Badge (matches reference image) */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: -2,
                    right: -4,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    backgroundColor: '#F0F4F8',
                    border: '2px solid var(--bg-app)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
                  }}
                >
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="#334155" strokeWidth={2.2} strokeLinecap="round">
                    <line x1="2" y1="4"  x2="14" y2="4"  />
                    <line x1="2" y1="8"  x2="14" y2="8"  />
                    <line x1="2" y1="12" x2="10" y2="12" />
                  </svg>
                </div>
              </button>
            )
          )}
        </div>

        {/* ── Center title ────────────────────────────────────── */}
        <div style={{ flex: 1, padding: '0 8px' }}>
          {title}
        </div>

        {/* ── Right slot: Notification Bell Icon (Default) ──────── */}
        <div style={{ minWidth: 36, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
          {right ?? (
            <button aria-label="Notifications" style={{ color: 'var(--text-primary)', display: 'flex', position: 'relative', border: 'none', background: 'none', cursor: 'pointer' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
              {/* Notification badge dot */}
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  top: -1,
                  right: -1,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-red)',
                  border: '1.5px solid var(--bg-app)',
                }}
              />
            </button>
          )}
        </div>
      </div>

      {/* ── Profile Drawer ─────────────────────────────────────── */}
      <ProfileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
}
