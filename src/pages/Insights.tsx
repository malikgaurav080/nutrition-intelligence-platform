import { useState, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useNutrition } from '../context/NutritionContext';
import { getSystemNutrients, HEALTH_SYSTEM_META } from '../engine/healthScore';
import type { HealthSystem } from '../engine/healthScore';
import MicroNutrientRow from '../components/MicroNutrientRow';

const PRIORITY_MAP: Record<string, HealthSystem> = {
  'Brain Health':   'Brain',
  'Hair Health':    'Hair',
  'Skin Health':    'Skin',
  'Bone Health':    'Bone',
  'Heart Health':   'Heart',
  'Muscle Health':  'Muscle',
  'Immunity':       'Immunity',
  'Eye Health':     'Eye',
  'Blood Health':   'Blood',
  'Thyroid Health': 'Thyroid',
};

/** Human-readable labels and units for each MicroKey */
const MICRO_META: Record<string, { label: string; unit: string }> = {
  vitA:       { label: 'Vitamin A',   unit: 'µg' },
  vitC:       { label: 'Vitamin C',   unit: 'mg' },
  vitD:       { label: 'Vitamin D',   unit: 'µg' },
  vitE:       { label: 'Vitamin E',   unit: 'mg' },
  vitK:       { label: 'Vitamin K',   unit: 'µg' },
  vitB1:      { label: 'Vitamin B1',  unit: 'mg' },
  vitB2:      { label: 'Vitamin B2',  unit: 'mg' },
  vitB3:      { label: 'Vitamin B3',  unit: 'mg' },
  vitB5:      { label: 'Vitamin B5',  unit: 'mg' },
  vitB6:      { label: 'Vitamin B6',  unit: 'mg' },
  biotin:     { label: 'Biotin',      unit: 'µg' },
  folate:     { label: 'Folate',      unit: 'µg' },
  vitB12:     { label: 'Vitamin B12', unit: 'µg' },
  calcium:    { label: 'Calcium',     unit: 'mg' },
  iron:       { label: 'Iron',        unit: 'mg' },
  magnesium:  { label: 'Magnesium',   unit: 'mg' },
  potassium:  { label: 'Potassium',   unit: 'mg' },
  zinc:       { label: 'Zinc',        unit: 'mg' },
  phosphorus: { label: 'Phosphorus',  unit: 'mg' },
  selenium:   { label: 'Selenium',    unit: 'µg' },
  iodine:     { label: 'Iodine',      unit: 'µg' },
  omega3:     { label: 'Omega-3',     unit: 'g'  },
};

/**
 * Insights page — micronutrient detail view per selected health priority.
 * PRD Section 6.2.
 */
export default function Insights() {
  const { currentUser, microRDA } = useUser();
  const { todayLog } = useNutrition();

  // Compute Daily Log Totals
  const dailyTotals = useMemo(() => {
    const totals = {
      micros: {} as Record<string, number>
    };

    for (const meal of todayLog.meals) {
      for (const [key, val] of Object.entries(meal.micros)) {
        totals.micros[key] = (totals.micros[key] || 0) + val;
      }
    }

    return totals;
  }, [todayLog]);

  const selectedSystems: HealthSystem[] = useMemo(() => {
    return (currentUser?.healthPriorities ?? [])
      .map(p => PRIORITY_MAP[p])
      .filter(Boolean);
  }, [currentUser]);

  const [activeSystem, setActiveSystem] = useState<HealthSystem | null>(
    selectedSystems[0] ?? null,
  );

  const systemNutrients = activeSystem ? getSystemNutrients(activeSystem) : [];

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '100px' }}>
      {/* Header */}
      <h1 style={{ fontSize: '1.4rem', marginBottom: 4 }}>Nutrient Insights</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: 20 }}>
        Micronutrients linked to your health priorities
      </p>

      {selectedSystems.length === 0 ? (
        <div className="premium-card" style={{ textAlign: 'center', padding: '32px 20px' }}>
          <p style={{ fontSize: '2rem', marginBottom: 8 }}>🎯</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Select health priorities during onboarding to see your micronutrient breakdown.
          </p>
        </div>
      ) : (
        <>
          {/* System tab pills */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 16 }}>
            {selectedSystems.map(sys => {
              const meta = HEALTH_SYSTEM_META[sys];
              const isActive = sys === activeSystem;
              return (
                <button
                  key={sys}
                  id={`insights-tab-${sys.toLowerCase()}`}
                  onClick={() => setActiveSystem(sys)}
                  aria-selected={isActive}
                  style={{
                    flexShrink: 0,
                    padding: '6px 14px',
                    borderRadius: 99,
                    border: `1px solid ${isActive ? 'var(--primary)' : 'var(--divider)'}`,
                    backgroundColor: isActive ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                    color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                    fontSize: '0.75rem',
                    fontWeight: isActive ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {meta.emoji} {meta.label}
                </button>
              );
            })}
          </div>

          {/* Nutrient rows for active system */}
          {activeSystem && (
            <div className="premium-card animate-fade-up">
              {systemNutrients.map(({ key, weight }, i) => {
                const meta = MICRO_META[key];
                const target = microRDA ? microRDA[key] : 0;
                const consumed = dailyTotals.micros[key] ?? 0;
                return (
                  <MicroNutrientRow
                    key={key}
                    name={meta?.label ?? key}
                    unit={meta?.unit ?? ''}
                    target={target}
                    consumed={consumed}
                    priority={weight}
                    delay={i * 50}
                  />
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Bottom Nav */}
      <nav className="bottom-nav" aria-label="Main navigation">
        <NavLink to="/dashboard" id="insights-nav-home">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Home
        </NavLink>
        <NavLink to="/insights" id="insights-nav-insights">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          Insights
        </NavLink>
        <NavLink to="/health" id="insights-nav-health">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
          </svg>
          Health
        </NavLink>
        <NavLink to="/meals" id="insights-nav-meals">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
            <path d="M12 8v4l3 3"/>
          </svg>
          Meals
        </NavLink>
        <NavLink to="/profile" id="insights-nav-profile">
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
