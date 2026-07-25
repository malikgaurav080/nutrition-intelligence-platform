import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useNutrition } from '../context/NutritionContext';
import { buildMicroCompletions } from '../engine/microConverter';
import { calcHealthScore, calcOverallScore, HEALTH_SYSTEM_META } from '../engine/healthScore';
import type { HealthSystem } from '../engine/healthScore';
import AppHeader from '../components/layout/AppHeader';
import BottomNav from '../components/layout/BottomNav';
import ProgressRing from '../components/ui/ProgressRing';
import ProgressBar from '../components/ui/ProgressBar';

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


function scoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Fair';
  return 'Needs Attention';
}

/**
 * Screen 1 — Main Dashboard
 * PRD Sections 6.1, 8: Hero Nutrition Score, 2x3 macro grid, health system badges.
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
      totals.protein  += meal.macros.protein;
      totals.fat      += meal.macros.fat;
      totals.carbs    += meal.macros.carbs;
      totals.fiber    += meal.macros.fiber;
      for (const [key, val] of Object.entries(meal.micros)) {
        totals.micros[key] = (totals.micros[key] ?? 0) + val;
      }
    }
    return totals;
  }, [todayLog]);

  // ── Micro completions + health scores (engine) ─────────────────────────
  const completions = useMemo(() => {
    if (!microRDA) return null;
    return buildMicroCompletions(dailyTotals.micros, microRDA);
  }, [microRDA, dailyTotals]);

  const selectedSystems: HealthSystem[] = useMemo(() =>
    (currentUser?.healthPriorities ?? []).map(p => PRIORITY_MAP[p]).filter(Boolean),
  [currentUser]);

  const proteinPct = nutritionTargets
    ? Math.min((dailyTotals.protein / nutritionTargets.protein_g) * 100, 100)
    : 0;

  const overallScore = useMemo(() => {
    if (!completions || selectedSystems.length === 0) return 0;
    return calcOverallScore(selectedSystems, completions, proteinPct);
  }, [completions, selectedSystems, proteinPct]);

  // ── Greeting ──────────────────────────────────────────────────────────
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  })();

  // ── Macro grid config ─────────────────────────────────────────────────
  const macros = [
    {
      id: 'calories',
      label: 'Calories',
      consumed: Math.round(dailyTotals.calories),
      target: nutritionTargets?.calories ?? 0,
      unit: 'kcal',
      color: 'var(--macro-calories)',
    },
    {
      id: 'protein',
      label: 'Protein',
      consumed: Math.round(dailyTotals.protein),
      target: nutritionTargets?.protein_g ?? 0,
      unit: 'g',
      color: 'var(--macro-protein)',
    },
    {
      id: 'carbs',
      label: 'Carbs',
      consumed: Math.round(dailyTotals.carbs),
      target: nutritionTargets?.carbs_g ?? 0,
      unit: 'g',
      color: 'var(--macro-carbs)',
    },
    {
      id: 'fat',
      label: 'Fat',
      consumed: Math.round(dailyTotals.fat),
      target: nutritionTargets?.fat_g ?? 0,
      unit: 'g',
      color: 'var(--macro-fat)',
    },
    {
      id: 'fiber',
      label: 'Fiber',
      consumed: Math.round(dailyTotals.fiber),
      target: nutritionTargets?.fiber_g ?? 0,
      unit: 'g',
      color: 'var(--macro-fiber)',
    },
    {
      id: 'water',
      label: 'Water',
      consumed: parseFloat((todayLog.waterConsumed / 1000).toFixed(1)),
      target: parseFloat(((nutritionTargets?.water_ml ?? 2000) / 1000).toFixed(1)),
      unit: 'L',
      color: 'var(--macro-water)',
      onTap: () => updateWater(todayLog.waterConsumed + 250),
    },
  ];

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
        {/* ── Hero Nutrition Score Card ───────────────────────── */}
        <div
          className="hero-card animate-fade-up"
          style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}
        >
          <div>
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500, letterSpacing: '0.04em' }}>
              Nutrition Score
            </p>
            <p
              className="tabular-nums"
              style={{ fontSize: '3.2rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1, marginTop: 4 }}
            >
              {overallScore}
            </p>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.9)', fontWeight: 600, marginTop: 2 }}>
              {scoreLabel(overallScore)}
            </p>
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
              ↑ Based on today's log
            </p>
          </div>
          <ProgressRing
            value={overallScore}
            size={110}
            strokeWidth={10}
            color="#FFFFFF"
            trackColor="rgba(255,255,255,0.2)"
          >
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
              {overallScore}%
            </span>
          </ProgressRing>
        </div>

        {/* ── Today's Progress Header ─────────────────────────── */}
        <div
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}
        >
          <p style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Today's Progress
          </p>
          <button
            onClick={() => navigate('/targets')}
            style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}
          >
            Edit Targets
          </button>
        </div>

        {/* ── 2x3 Macro Grid ──────────────────────────────────── */}
        <div className="macro-grid animate-fade-up delay-1" style={{ marginBottom: 20 }}>
          {macros.map((m, i) => {
            const pct = m.target > 0 ? Math.min((m.consumed / m.target) * 100, 100) : 0;
            return (
              <div
                key={m.id}
                id={`macro-card-${m.id}`}
                className="macro-grid-card"
                onClick={m.onTap}
                style={{ cursor: m.onTap ? 'pointer' : 'default' }}
              >
                <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 4 }}>
                  {m.label}
                </p>
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

        {/* ── Health System Scores Row ─────────────────────────── */}
        {selectedSystems.length > 0 && (
          <div className="animate-fade-up delay-2">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <p style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Health System Scores
              </p>
              <button
                onClick={() => navigate('/health')}
                style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}
              >
                View All
              </button>
            </div>
            <div
              style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}
              className="pill-tabs"
            >
              {selectedSystems.map(system => {
                const score = completions
                  ? calcHealthScore(system, completions, proteinPct)
                  : 0;
                const meta = HEALTH_SYSTEM_META[system];
                const color = score >= 80 ? 'var(--primary)' : score >= 60 ? 'var(--color-amber)' : 'var(--color-red)';
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
                      gap: 6,
                      padding: '12px 14px',
                      backgroundColor: 'var(--bg-card)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      cursor: 'pointer',
                      minWidth: 72,
                    }}
                  >
                    <span style={{ fontSize: '1.4rem' }}>{meta.emoji}</span>
                    <span className="tabular-nums" style={{ fontSize: '0.82rem', fontWeight: 700, color }}>
                      {score}%
                    </span>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                      {meta.label.split(' ')[0]}
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
