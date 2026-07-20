import { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useNutrition } from '../context/NutritionContext';
import { buildMicroCompletions } from '../engine/microConverter';
import { calcOverallScore, calcHealthScore } from '../engine/healthScore';
import type { HealthSystem } from '../engine/healthScore';
import HealthScoreCard from '../components/HealthScoreCard';

const PRIORITY_MAP: Record<string, HealthSystem> = {
  'Brain Health': 'Brain',
  'Hair Health':  'Hair',
  'Skin Health':  'Skin',
  'Bone Health':  'Bone',
  'Heart Health': 'Heart',
  'Muscle Health':'Muscle',
  'Immunity':     'Immunity',
  'Eye Health':   'Eye',
  'Blood Health': 'Blood',
  'Thyroid Health':'Thyroid',
};

export default function Health() {
  const { currentUser, nutritionTargets, microRDA } = useUser();
  const { todayLog } = useNutrition();

  // Compute Daily Log Totals
  const dailyTotals = useMemo(() => {
    const totals = {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      fiber: 0,
      micros: {} as Record<string, number>
    };

    for (const meal of todayLog.meals) {
      totals.calories += meal.macros.calories;
      totals.protein += meal.macros.protein;
      totals.fat += meal.macros.fat;
      totals.carbs += meal.macros.carbs;
      totals.fiber += meal.macros.fiber;

      for (const [key, val] of Object.entries(meal.micros)) {
        totals.micros[key] = (totals.micros[key] || 0) + val;
      }
    }

    return totals;
  }, [todayLog]);

  const completions = useMemo(() => {
    if (!microRDA) return null;
    return buildMicroCompletions(dailyTotals.micros, microRDA);
  }, [microRDA, dailyTotals]);

  const selectedSystems: HealthSystem[] = useMemo(() => {
    return (currentUser?.healthPriorities ?? [])
      .map(p => PRIORITY_MAP[p])
      .filter(Boolean);
  }, [currentUser]);

  const proteinCompletion = nutritionTargets
    ? Math.min((dailyTotals.protein / nutritionTargets.protein_g) * 100, 100)
    : 0;

  const overallScore = useMemo(() => {
    if (!completions || selectedSystems.length === 0) return 0;
    return calcOverallScore(selectedSystems, completions, proteinCompletion);
  }, [completions, selectedSystems, proteinCompletion]);

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '100px' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.4rem' }}>Health Status</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: 2 }}>
          Overall score and priority scorecard systems
        </p>
      </div>

      {/* ── Overall Score ─────────────────────────────────── */}
      <div className="premium-card animate-fade-up" style={{ marginBottom: 20, textAlign: 'center', padding: '20px' }}>
        <p className="section-label">Overall Nutrition Score</p>
        <p
          className="tabular-nums"
          style={{
            fontSize: '3.5rem',
            fontWeight: 800,
            color: overallScore >= 80 ? '#10B981' : overallScore >= 60 ? '#6366F1' : overallScore >= 40 ? '#F59E0B' : '#EF4444',
            lineHeight: 1,
          }}
        >
          {overallScore}%
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 6 }}>
          WHO MAR method · {selectedSystems.length} health {selectedSystems.length === 1 ? 'system' : 'systems'}
        </p>
      </div>

      {/* ── Health Systems ────────────────────────────────── */}
      {selectedSystems.length > 0 ? (
        <>
          <p className="section-label" style={{ marginBottom: 12 }}>Priority Scorecards</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {selectedSystems.map((system, i) => (
              <HealthScoreCard
                key={system}
                system={system}
                score={completions ? calcHealthScore(system, completions, proteinCompletion) : 0}
                delay={i * 60}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="premium-card score-indigo-bg" style={{ border: '1px dashed rgba(99, 102, 241, 0.4)', textAlign: 'center', padding: 20 }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
            No health priorities selected. Go to your Profile to add system targets.
          </p>
        </div>
      )}

      {/* Bottom Nav */}
      <nav className="bottom-nav" aria-label="Main navigation">
        <NavLink to="/dashboard" id="health-nav-home">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Home
        </NavLink>
        <NavLink to="/insights" id="health-nav-insights">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          Insights
        </NavLink>
        <NavLink to="/health" id="health-nav-health">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
          </svg>
          Health
        </NavLink>
        <NavLink to="/meals" id="health-nav-meals">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
            <path d="M12 8v4l3 3"/>
          </svg>
          Meals
        </NavLink>
        <NavLink to="/profile" id="health-nav-profile">
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
