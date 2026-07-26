import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useNutrition } from '../context/NutritionContext';
import { buildMicroCompletions } from '../engine/microConverter';
import { calcHealthScore, HEALTH_SYSTEM_META } from '../engine/healthScore';
import type { HealthSystem } from '../engine/healthScore';
import AppHeader from '../components/layout/AppHeader';
import BottomNav from '../components/layout/BottomNav';
import ProgressBar from '../components/ui/ProgressBar';
import ProgressRing from '../components/ui/ProgressRing';

const PRIORITY_MAP: Record<string, HealthSystem> = {
  'Brain & Nervous System': 'Brain',
  'Brain Health': 'Brain',
  'Brain': 'Brain',
  'Hair Health': 'Hair',
  'Hair': 'Hair',
  'Skin Health': 'Skin',
  'Skin': 'Skin',
  'Bones & Teeth': 'Bone',
  'Bone Health': 'Bone',
  'Bone': 'Bone',
  'Heart Health': 'Heart',
  'Heart': 'Heart',
  'Muscle Health': 'Muscle',
  'Muscle': 'Muscle',
  'Immunity': 'Immunity',
  'Eye Health': 'Eye',
  'Eye': 'Eye',
  'Blood Health': 'Blood',
  'Blood': 'Blood',
  'Thyroid Health': 'Thyroid',
  'Thyroid': 'Thyroid',
};

const SYSTEM_ACCENTS: Record<HealthSystem, { bg: string; border: string }> = {
  Brain: { bg: 'rgba(147, 51, 234, 0.12)', border: 'rgba(147, 51, 234, 0.25)' },
  Hair: { bg: 'rgba(236, 72, 153, 0.12)', border: 'rgba(236, 72, 153, 0.25)' },
  Skin: { bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.25)' },
  Bone: { bg: 'rgba(100, 116, 139, 0.12)', border: 'rgba(100, 116, 139, 0.25)' },
  Heart: { bg: 'rgba(244, 63, 94, 0.12)', border: 'rgba(244, 63, 94, 0.25)' },
  Muscle: { bg: 'rgba(59, 130, 246, 0.12)', border: 'rgba(59, 130, 246, 0.25)' },
  Immunity: { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.25)' },
  Eye: { bg: 'rgba(6, 182, 212, 0.12)', border: 'rgba(6, 182, 212, 0.25)' },
  Blood: { bg: 'rgba(225, 29, 72, 0.12)', border: 'rgba(225, 29, 72, 0.25)' },
  Thyroid: { bg: 'rgba(99, 102, 241, 0.12)', border: 'rgba(99, 102, 241, 0.25)' },
};

const GLASS_ML = 250; // Each glass represents 250 ml

/**
 * Screen 1 — Main Dashboard
 * Updated:
 * - Hero Card: Calorie & Energy Balance (Taken, Target, Maintenance TDEE values + progress)
 * - Responsive 1-Row Water Glass Tracker: Crisp SVG glass icons, fitting 100% in 1 row, click to log +250ml to DB
 * - 2x2 Macro Grid: Protein (🥩), Carbs (🍞), Fat (🥑), Fiber (🌿) with nutrient icons
 * - Health System Scores horizontal badge row
 */
export default function Dashboard() {
  const { currentUser, nutritionTargets, microRDA } = useUser();
  const { todayLog, updateWater } = useNutrition();
  const navigate = useNavigate();

  // ── Compute daily totals from logged meals (backend data) ──────────────
  const dailyTotals = useMemo(() => {
    const totals = { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0, micros: {} as Record<string, number> };
    for (const meal of todayLog.meals) {
      totals.calories += meal.macros.calories;
      totals.protein += meal.macros.protein;
      totals.fat += meal.macros.fat;
      totals.carbs += meal.macros.carbs;
      totals.fiber += meal.macros.fiber;
      for (const [key, val] of Object.entries(meal.micros)) {
        totals.micros[key] = (totals.micros[key] ?? 0) + val;
      }
    }
    return totals;
  }, [todayLog]);

  // ── Calorie values ────────────────────────────────────────────────────
  const takenCalories = Math.round(dailyTotals.calories);
  const targetCalories = nutritionTargets?.calories ?? 2000;
  const maintenanceCalories = nutritionTargets?.tdee ?? 2400;

  const caloriePct = Math.min(Math.round((takenCalories / targetCalories) * 100), 100);
  const remainingCalories = Math.max(targetCalories - takenCalories, 0);

  // ── Water values ──────────────────────────────────────────────────────
  const waterTargetMl = nutritionTargets?.water_ml ?? 2500;
  const waterConsumedMl = todayLog.waterConsumed;
  const targetGlasses = Math.max(Math.ceil(waterTargetMl / GLASS_ML), 8);
  const consumedGlasses = Math.floor(waterConsumedMl / GLASS_ML);
  const waterPct = Math.min(Math.round((waterConsumedMl / waterTargetMl) * 100), 100);

  // ── Micro completions + health scores (engine) ─────────────────────────
  const completions = useMemo(() => {
    if (!microRDA) return null;
    return buildMicroCompletions(dailyTotals.micros, microRDA);
  }, [microRDA, dailyTotals]);

  const selectedSystems: HealthSystem[] = useMemo(() => {
    const rawPriorities = currentUser?.healthPriorities ?? [];
    const mapped = rawPriorities
      .map(p => PRIORITY_MAP[p])
      .filter((sys): sys is HealthSystem => Boolean(sys));

    // Deduplicate and cap at max 5 priorities selected by user at registration
    const unique = Array.from(new Set(mapped)).slice(0, 5);

    // Fallback to top 5 health priorities if no priorities are selected
    if (unique.length === 0) {
      return ['Brain', 'Immunity', 'Heart', 'Bone', 'Muscle'];
    }
    return unique;
  }, [currentUser]);

  const proteinPct = nutritionTargets
    ? Math.min((dailyTotals.protein / nutritionTargets.protein_g) * 100, 100)
    : 0;

  // ── Greeting ──────────────────────────────────────────────────────────
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  })();

  // ── 2x2 Macro Grid config with distinct icons ─────────────────────────
  const macros = [
    {
      id: 'protein',
      label: 'Protein',
      icon: '🥩',
      consumed: Math.round(dailyTotals.protein),
      target: nutritionTargets?.protein_g ?? 0,
      unit: 'g',
      color: 'var(--macro-protein)',
    },
    {
      id: 'carbs',
      label: 'Carbs',
      icon: '🍞',
      consumed: Math.round(dailyTotals.carbs),
      target: nutritionTargets?.carbs_g ?? 0,
      unit: 'g',
      color: 'var(--macro-carbs)',
    },
    {
      id: 'fat',
      label: 'Fat',
      icon: '🥑',
      consumed: Math.round(dailyTotals.fat),
      target: nutritionTargets?.fat_g ?? 0,
      unit: 'g',
      color: 'var(--macro-fat)',
    },
    {
      id: 'fiber',
      label: 'Fiber',
      icon: '🌿',
      consumed: Math.round(dailyTotals.fiber),
      target: nutritionTargets?.fiber_g ?? 0,
      unit: 'g',
      color: 'var(--macro-fiber)',
    },
  ];

  const handleAddGlass = () => {
    updateWater(waterConsumedMl + GLASS_ML);
  };

  return (
    <div className="app-container">
      {/* ── Top Header ────────────────────────────────────────── */}
      <AppHeader
        title={
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {greeting}
            </p>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {currentUser?.name?.split(' ')[0] ?? 'Explorer'} 👋
            </h1>
          </div>
        }
      />

      <div className="page-content">
        {/* ── Hero Card: Energy & Calorie Balance ─────────────── */}
        <div
          id="hero-calorie-card"
          className="hero-card animate-fade-up"
          style={{ marginBottom: 16, padding: '20px 18px' }}
        >
          {/* Card Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Energy & Calorie Balance
              </p>
              <p className="tabular-nums" style={{ fontSize: '2.2rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1, marginTop: 4 }}>
                {takenCalories.toLocaleString()} <span style={{ fontSize: '1rem', fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>/ {targetCalories.toLocaleString()} kcal</span>
              </p>
            </div>
            {/* Deficit / Remaining badge */}
            <div
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(8px)',
                borderRadius: 'var(--radius-full)',
                padding: '6px 12px',
                textAlign: 'center',
              }}
            >
              <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>Remaining</p>
              <p className="tabular-nums" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF' }}>
                {remainingCalories} kcal
              </p>
            </div>
          </div>

          {/* Calorie Progress Bar */}
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                height: 8,
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${caloriePct}%`,
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-full)',
                  transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              />
            </div>
          </div>

          {/* 3 Values Breakdown: Taken, Target, Maintenance */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 8,
              backgroundColor: 'rgba(0,0,0,0.18)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 12px',
              textAlign: 'center',
            }}
          >
            <div>
              <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Taken</p>
              <p className="tabular-nums" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF', marginTop: 2 }}>
                {takenCalories}
              </p>
              <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.6)' }}>kcal</p>
            </div>
            <div style={{ borderLeft: '1px solid rgba(255,255,255,0.15)', borderRight: '1px solid rgba(255,255,255,0.15)' }}>
              <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Target</p>
              <p className="tabular-nums" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#4ADE80', marginTop: 2 }}>
                {targetCalories}
              </p>
              <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.6)' }}>kcal Goal</p>
            </div>
            <div>
              <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Maintenance</p>
              <p className="tabular-nums" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FBBF24', marginTop: 2 }}>
                {maintenanceCalories}
              </p>
              <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.6)' }}>kcal TDEE</p>
            </div>
          </div>
        </div>

        {/* ── Interactive Water Tracker (Responsive 1-Row Glass Layout) ── */}
        <div
          id="water-tracker-card"
          className="card animate-fade-up delay-1"
          style={{ padding: '16px 16px', marginBottom: 16 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '1.1rem' }}>💧</span>
                <p style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Water Intake
                </p>
              </div>
              <p className="tabular-nums" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                {consumedGlasses} of {targetGlasses} glasses ({(waterConsumedMl / 1000).toFixed(1)} / {(waterTargetMl / 1000).toFixed(1)} L)
              </p>
            </div>
            <button
              id="add-water-glass-btn"
              onClick={handleAddGlass}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-blue-bg)',
                color: 'var(--color-blue)',
                fontSize: '0.75rem',
                fontWeight: 700,
                border: '1px solid rgba(59, 130, 246, 0.25)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                transition: 'transform 0.15s ease',
              }}
              onMouseDown={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.95)';
              }}
              onMouseUp={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
              }}
            >
              + 1 Glass ({GLASS_ML}ml)
            </button>
          </div>

          {/* Water Progress Bar */}
          <div style={{ marginBottom: 14 }}>
            <ProgressBar value={waterPct} color="var(--color-blue)" height={6} />
          </div>

          {/* 1-Row Responsive Glass Cup SVG Grid */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 4,
              width: '100%',
            }}
          >
            {Array.from({ length: targetGlasses }).map((_, i) => {
              const isFilled = i < consumedGlasses;
              return (
                <button
                  key={i}
                  id={`water-glass-${i}`}
                  aria-label={`Glass ${i + 1} ${isFilled ? 'filled' : 'empty'}`}
                  onClick={() => {
                    if (!isFilled) {
                      updateWater((i + 1) * GLASS_ML);
                    }
                  }}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    height: 42,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                  }}
                >
                  {/* Glass Cup SVG Icon */}
                  <svg
                    width="100%"
                    height="32"
                    viewBox="0 0 24 30"
                    fill="none"
                    style={{ overflow: 'visible' }}
                  >
                    {/* Glass Cup Body Outline */}
                    <path
                      d="M4 4 L6 26 C6.2 27.5 7.5 28.5 9 28.5 L15 28.5 C16.5 28.5 17.8 27.5 18 26 L20 4 Z"
                      fill={isFilled ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-surface)'}
                      stroke={isFilled ? 'var(--color-blue)' : 'var(--border)'}
                      strokeWidth={1.8}
                      strokeLinejoin="round"
                    />

                    {/* Glass Rim Top */}
                    <ellipse
                      cx="12"
                      cy="4"
                      rx="8"
                      ry="1.8"
                      fill={isFilled ? 'rgba(59, 130, 246, 0.25)' : 'var(--bg-surface)'}
                      stroke={isFilled ? 'var(--color-blue)' : 'var(--border)'}
                      strokeWidth={1.5}
                    />

                    {/* Filled Water Body */}
                    {isFilled && (
                      <path
                        d="M5.5 10 L6 26 C6.2 27.5 7.5 28.5 9 28.5 L15 28.5 C16.5 28.5 17.8 27.5 18 26 L18.5 10 Z"
                        fill="var(--color-blue)"
                        opacity={0.85}
                      />
                    )}

                    {/* Water Surface Line */}
                    {isFilled && (
                      <ellipse
                        cx="12"
                        cy="10"
                        rx="6.5"
                        ry="1.2"
                        fill="#93C5FD"
                      />
                    )}

                    {/* Glass Shine Highlight */}
                    <line
                      x1="7" y1="8"
                      x2="7.8" y2="22"
                      stroke="#FFFFFF"
                      strokeWidth={1.2}
                      strokeLinecap="round"
                      opacity={0.6}
                    />
                  </svg>
                  {/* Glass Number Label */}
                  <span
                    style={{
                      fontSize: '0.58rem',
                      fontWeight: isFilled ? 700 : 500,
                      color: isFilled ? 'var(--color-blue)' : 'var(--text-muted)',
                      marginTop: 2,
                      lineHeight: 1,
                    }}
                  >
                    {i + 1}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Today's Progress Header ─────────────────────────── */}
        <div
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}
        >
          <p style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Macronutrient Progress
          </p>
          <button
            id="nav-micronutrients-btn"
            onClick={() => navigate('/micronutrients')}
            style={{
              fontSize: '0.75rem',
              color: 'var(--primary)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: 0,
            }}
          >
            Micronutrients ➔
          </button>
        </div>

        {/* ── 2x2 Macro Grid (Protein 🥩, Carbs 🍞, Fat 🥑, Fiber 🌿) ──── */}
        <div className="macro-grid animate-fade-up delay-2" style={{ marginBottom: 20 }}>
          {macros.map((m, i) => {
            const pct = m.target > 0 ? Math.min((m.consumed / m.target) * 100, 100) : 0;
            return (
              <div
                key={m.id}
                id={`macro-card-${m.id}`}
                className="macro-grid-card"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: '1rem' }}>{m.icon}</span>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    {m.label}
                  </p>
                </div>
                <p className="tabular-nums" style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                  {m.consumed} <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>/ {m.target} {m.unit}</span>
                </p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                  {Math.round(pct)}%
                </p>
                <ProgressBar value={pct} color={m.color} height={5} delay={i * 60} />
              </div>
            );
          })}
        </div>

        {/* ── Health System Scores Row (Dynamic Registration Priorities) ──── */}
        {selectedSystems.length > 0 && (
          <div className="animate-fade-up delay-3" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <p style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Priority Health Scores
              </p>
              <button
                onClick={() => navigate('/health')}
                style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}
              >
                View All
              </button>
            </div>
            <div
              style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 6 }}
              className="pill-tabs"
            >
              {selectedSystems.map(system => {
                const score = completions
                  ? calcHealthScore(system, completions, proteinPct)
                  : 0;
                const meta = HEALTH_SYSTEM_META[system];
                const accent = SYSTEM_ACCENTS[system] ?? { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.25)' };
                const color = score >= 80 ? 'var(--primary)' : score >= 60 ? 'var(--color-amber)' : 'var(--color-red)';
                const labelTitle = meta.label.split(' ')[0]; // E.g., Brain, Hair, Skin, Bone, Heart, Muscle, Immunity, Eye, Blood, Thyroid

                return (
                  <div
                    key={system}
                    id={`health-badge-${system.toLowerCase()}`}
                    onClick={() => navigate('/health')}
                    style={{
                      flexShrink: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                      cursor: 'pointer',
                      minWidth: 64,
                      transition: 'transform 0.15s ease',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                    }}
                  >
                    {/* Circular Icon Badge Container with Circular Progress Ring */}
                    <ProgressRing
                      value={score}
                      size={52}
                      strokeWidth={3.5}
                      color={color}
                      trackColor={accent.border}
                    >
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: '50%',
                          backgroundColor: accent.bg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <span style={{ fontSize: '1.25rem' }}>{meta.emoji}</span>
                      </div>
                    </ProgressRing>

                    {/* Percentage Score */}
                    <span
                      className="tabular-nums"
                      style={{
                        fontSize: '0.88rem',
                        fontWeight: 800,
                        color,
                        marginTop: 2,
                        lineHeight: 1.1,
                      }}
                    >
                      {score}%
                    </span>

                    {/* System Title Label */}
                    <span
                      style={{
                        fontSize: '0.68rem',
                        color: 'var(--text-secondary)',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {labelTitle}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
