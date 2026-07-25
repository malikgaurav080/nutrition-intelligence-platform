import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useNutrition } from '../context/NutritionContext';
import { buildMicroCompletions } from '../engine/microConverter';
import AppHeader from '../components/layout/AppHeader';
import BottomNav from '../components/layout/BottomNav';
import SegmentedControl from '../components/ui/SegmentedControl';
import ProgressBar from '../components/ui/ProgressBar';

/** Micro label, unit, category and icon map */
const MICRO_DISPLAY: Record<string, { label: string; unit: string; category: 'vitamin' | 'mineral'; icon: string; bg: string }> = {
  vitA:       { label: 'Vitamin A',   unit: 'µg',  category: 'vitamin', icon: '👁️', bg: 'rgba(245, 158, 11, 0.12)' },
  vitC:       { label: 'Vitamin C',   unit: 'mg',  category: 'vitamin', icon: '🍊', bg: 'rgba(249, 115, 22, 0.12)' },
  vitD:       { label: 'Vitamin D',   unit: 'µg',  category: 'vitamin', icon: '☀️', bg: 'rgba(234, 179, 8, 0.12)'  },
  vitE:       { label: 'Vitamin E',   unit: 'mg',  category: 'vitamin', icon: '🥑', bg: 'rgba(34, 197, 94, 0.12)'  },
  vitK:       { label: 'Vitamin K',   unit: 'µg',  category: 'vitamin', icon: '🥬', bg: 'rgba(16, 185, 129, 0.12)' },
  vitB1:      { label: 'Vitamin B1',  unit: 'mg',  category: 'vitamin', icon: '🌾', bg: 'rgba(217, 119, 6, 0.12)'  },
  vitB2:      { label: 'Vitamin B2',  unit: 'mg',  category: 'vitamin', icon: '🥛', bg: 'rgba(59, 130, 246, 0.12)' },
  vitB6:      { label: 'Vitamin B6',  unit: 'mg',  category: 'vitamin', icon: '🍌', bg: 'rgba(234, 179, 8, 0.12)'  },
  vitB12:     { label: 'Vitamin B12', unit: 'µg',  category: 'vitamin', icon: '🥩', bg: 'rgba(239, 68, 68, 0.12)'  },
  folate:     { label: 'Folate',      unit: 'µg',  category: 'vitamin', icon: '🥗', bg: 'rgba(16, 185, 129, 0.12)' },
  biotin:     { label: 'Biotin',      unit: 'µg',  category: 'vitamin', icon: '💇', bg: 'rgba(236, 72, 153, 0.12)' },
  calcium:    { label: 'Calcium',     unit: 'mg',  category: 'mineral', icon: '🦴', bg: 'rgba(100, 116, 139, 0.12)' },
  iron:       { label: 'Iron',        unit: 'mg',  category: 'mineral', icon: '🩸', bg: 'rgba(225, 29, 72, 0.12)'  },
  magnesium:  { label: 'Magnesium',   unit: 'mg',  category: 'mineral', icon: '⚡', bg: 'rgba(147, 51, 234, 0.12)' },
  potassium:  { label: 'Potassium',   unit: 'mg',  category: 'mineral', icon: '🍌', bg: 'rgba(234, 179, 8, 0.12)'  },
  zinc:       { label: 'Zinc',        unit: 'mg',  category: 'mineral', icon: '🛡️', bg: 'rgba(16, 185, 129, 0.12)' },
  phosphorus: { label: 'Phosphorus',  unit: 'mg',  category: 'mineral', icon: '🔋', bg: 'rgba(6, 182, 212, 0.12)'  },
  selenium:   { label: 'Selenium',    unit: 'µg',  category: 'mineral', icon: '🌰', bg: 'rgba(180, 83, 9, 0.12)'   },
  iodine:     { label: 'Iodine',      unit: 'µg',  category: 'mineral', icon: '🦋', bg: 'rgba(99, 102, 241, 0.12)' },
  omega3:     { label: 'Omega-3',     unit: 'g',   category: 'mineral', icon: '🐟', bg: 'rgba(14, 165, 233, 0.12)' },
};

function barColor(pct: number): string {
  if (pct >= 80) return 'var(--primary)';
  if (pct >= 50) return 'var(--color-amber)';
  return 'var(--color-red)';
}

/**
 * Screen 5 — Micronutrients Detail
 * PRD Section 4, ui-screens-spec.md Screen 5:
 * Vitamins/Minerals tab + nutrient rows with fraction + animated bar.
 * All data from buildMicroCompletions (engine) + microRDA (backend user profile).
 */
export default function Micronutrients() {
  const { microRDA } = useUser();
  const { todayLog } = useNutrition();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'Vitamins' | 'Minerals'>('Vitamins');
  const [showAll, setShowAll] = useState(false);

  // ── Aggregate consumed micros from today's log (backend data) ─────────
  const consumedMicros = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const meal of todayLog.meals) {
      for (const [k, v] of Object.entries(meal.micros)) {
        totals[k] = (totals[k] ?? 0) + v;
      }
    }
    return totals;
  }, [todayLog]);

  // ── Micro completions via engine ────────────────────────────────────────
  const completions = useMemo(() => {
    if (!microRDA) return {};
    return buildMicroCompletions(consumedMicros, microRDA);
  }, [microRDA, consumedMicros]);

  const category = activeTab === 'Vitamins' ? 'vitamin' : 'mineral';
  const allKeys = Object.entries(MICRO_DISPLAY)
    .filter(([, meta]) => meta.category === category)
    .map(([key, meta]) => ({
      key,
      label: meta.label,
      unit: meta.unit,
      icon: meta.icon,
      bg: meta.bg,
      target: microRDA?.[key as keyof typeof microRDA] ?? 0,
      consumed: consumedMicros[key] ?? 0,
      pct: Math.round((completions as Record<string, number>)[key] ?? 0),
    }))
    .filter(n => n.target > 0);

  const displayed = showAll ? allKeys : allKeys.slice(0, 6);

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
            Micronutrients
          </h1>
        }
        right={
          <button aria-label="Search nutrients" style={{ color: 'var(--text-secondary)', display: 'flex' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        }
      />

      <div className="page-content">
        {/* ── Vitamins / Minerals tabs ─────────────────────────── */}
        <div style={{ marginBottom: 20 }}>
          <SegmentedControl
            id="micronutrient-tabs"
            options={['Vitamins', 'Minerals']}
            value={activeTab}
            onChange={v => { setActiveTab(v as 'Vitamins' | 'Minerals'); setShowAll(false); }}
          />
        </div>

        {/* ── Nutrient rows ────────────────────────────────────── */}
        <div className="card" style={{ padding: '4px 16px', marginBottom: 16 }}>
          {displayed.length === 0 ? (
            <div style={{ padding: '24px 0', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No micronutrient data. Log meals to see your intake.
              </p>
            </div>
          ) : (
            displayed.map(({ key, label, unit, icon, bg, target, consumed, pct }, i) => (
              <div
                key={key}
                id={`micro-row-${key}`}
                className="animate-fade-up"
                style={{
                  padding: '14px 0',
                  borderBottom: i < displayed.length - 1 ? '1px solid var(--border)' : 'none',
                  animationDelay: `${i * 40}ms`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {/* Nutrient Icon Badge Container */}
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.1rem',
                        flexShrink: 0,
                      }}
                    >
                      {icon}
                    </div>
                    <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {label}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="tabular-nums" style={{ fontSize: '0.82rem', fontWeight: 700, color: barColor(pct) }}>
                      {pct}%
                    </span>
                    <p className="tabular-nums" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      {consumed.toFixed(1)} / {target} {unit}
                    </p>
                  </div>
                </div>
                <ProgressBar value={pct} color={barColor(pct)} height={5} delay={i * 40} />
              </div>
            ))
          )}
        </div>

        {/* ── View All CTA ─────────────────────────────────────── */}
        {!showAll && allKeys.length > 6 && (
          <button
            id="view-all-micronutrients"
            className="btn-ghost"
            onClick={() => setShowAll(true)}
            style={{ width: '100%' }}
          >
            View All Micronutrients ({allKeys.length - 6} more)
          </button>
        )}
        {showAll && (
          <button
            className="btn-ghost"
            onClick={() => setShowAll(false)}
            style={{ width: '100%' }}
          >
            Show Less
          </button>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
