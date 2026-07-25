import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useNutrition } from '../context/NutritionContext';
import { buildMicroCompletions } from '../engine/microConverter';
import { calcOverallScore, calcHealthScore, HEALTH_SYSTEM_META } from '../engine/healthScore';
import type { HealthSystem } from '../engine/healthScore';
import AppHeader from '../components/layout/AppHeader';
import BottomNav from '../components/layout/BottomNav';
import ProgressBar from '../components/ui/ProgressBar';
import SegmentedControl from '../components/ui/SegmentedControl';

type Timeframe = 'Weekly' | 'Monthly' | 'All Time';

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

/** Static weekly trend data — replaced with real API data in Phase 2 */
const WEEKLY_CALORIES = [1920, 1750, 2100, 1650, 1850, 2050, 0];
const WEEKLY_PROTEIN  = [128, 118, 140, 110, 132, 144, 0];
const WEEKLY_CARBS    = [245, 220, 270, 200, 240, 258, 0];
const WEEKLY_FAT      = [68, 62, 78, 58, 70, 76, 0];
const SCORE_TIMELINE  = [82, 76, 88, 70, 84, 90, 0];
const WEEK_LABELS     = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const MICRO_DISPLAY: Record<string, { label: string; unit: string }> = {
  iron:    { label: 'Iron',      unit: 'mg' },
  vitD:    { label: 'Vitamin D', unit: 'µg' },
  calcium: { label: 'Calcium',   unit: 'mg' },
  omega3:  { label: 'Omega-3',   unit: 'g'  },
  zinc:    { label: 'Zinc',      unit: 'mg' },
};

function barColor(pct: number): string {
  if (pct >= 70) return 'var(--primary)';
  if (pct >= 50) return 'var(--color-amber)';
  return 'var(--color-red)';
}

/**
 * Screen 9 — Reports
 * ui-screens-spec.md Screen 9:
 * Timeframe toggle + summary stats row + macro trend chart +
 * score timeline + health system breakdown + micro deficiency summary.
 * Real-time data from NutritionContext (todayLog) + engine calculations.
 */
export default function Reports() {
  const { currentUser, nutritionTargets, microRDA } = useUser();
  const { todayLog } = useNutrition();
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState<Timeframe>('Weekly');

  // ── Today's aggregated totals from backend log ─────────────────────────
  const dailyTotals = useMemo(() => {
    const totals = { protein: 0, calories: 0, micros: {} as Record<string, number> };
    for (const meal of todayLog.meals) {
      totals.calories += meal.macros.calories;
      totals.protein  += meal.macros.protein;
      for (const [k, v] of Object.entries(meal.micros)) {
        totals.micros[k] = (totals.micros[k] ?? 0) + v;
      }
    }
    return totals;
  }, [todayLog]);

  // ── Engine: micro completions + health scores ──────────────────────────
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

  const todayScore = useMemo(() => {
    if (!completions || selectedSystems.length === 0) return 0;
    return calcOverallScore(selectedSystems, completions, proteinPct);
  }, [completions, selectedSystems, proteinPct]);

  // ── Inject today's real scores into the timeline ──────────────────────
  const scoreTimeline = [...SCORE_TIMELINE];
  scoreTimeline[6] = todayScore;

  const caloriesToday = Math.round(dailyTotals.calories);
  const weekCalories  = [...WEEKLY_CALORIES];
  weekCalories[6]     = caloriesToday;

  const weekProtein   = [...WEEKLY_PROTEIN];
  weekProtein[6]      = Math.round(dailyTotals.protein);

  // ── Summary stats ─────────────────────────────────────────────────────
  const avgCalories   = Math.round(weekCalories.filter(v => v > 0).reduce((s, v) => s + v, 0) / weekCalories.filter(v => v > 0).length);
  const bestScore     = Math.max(...scoreTimeline.filter(v => v > 0));
  const daysTracked   = weekCalories.filter(v => v > 0).length;

  // ── Health system breakdown ───────────────────────────────────────────
  const systemBreakdown = useMemo(() =>
    selectedSystems.map(system => ({
      system,
      score: completions ? calcHealthScore(system, completions, proteinPct) : 0,
      meta: HEALTH_SYSTEM_META[system],
    })).sort((a, b) => b.score - a.score),
  [selectedSystems, completions, proteinPct]);

  // ── Top 5 micronutrient deficiencies ─────────────────────────────────
  const microDeficiencies = useMemo(() => {
    if (!completions) return [];
    return Object.entries(MICRO_DISPLAY)
      .map(([key, meta]) => ({
        key,
        label: meta.label,
        pct: Math.round((completions as Record<string, number>)[key] ?? 0),
      }))
      .sort((a, b) => a.pct - b.pct)
      .slice(0, 5);
  }, [completions]);

  // ── Chart dimensions ──────────────────────────────────────────────────
  const _maxCalChart  = Math.max(...weekCalories, 1); // reserved for future use
  const maxScoreChart = 100;

  return (
    <div className="app-container">
      {/* ── Header ───────────────────────────────────────────── */}
      <AppHeader
        title={
          <h1 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Reports
          </h1>
        }
        right={
          <button aria-label="Select date range" style={{ color: 'var(--text-secondary)', display: 'flex', border: 'none', background: 'none', cursor: 'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8"  y1="2" x2="8"  y2="6" />
              <line x1="3"  y1="10" x2="21" y2="10" />
            </svg>
          </button>
        }
      />

      <div className="page-content">
        {/* ── Timeframe toggle ─────────────────────────────────── */}
        <div style={{ marginBottom: 20 }}>
          <SegmentedControl
            id="reports-timeframe"
            options={['Weekly', 'Monthly', 'All Time']}
            value={timeframe}
            onChange={v => setTimeframe(v as Timeframe)}
          />
        </div>

        {/* ── Summary Stats Row (3 cards) ──────────────────────── */}
        <div
          className="animate-fade-up"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}
        >
          {[
            { label: 'Avg Calories',  value: `${avgCalories.toLocaleString()}`, unit: 'kcal', color: 'var(--macro-calories)' },
            { label: 'Best Score',    value: `${bestScore}`,                     unit: '%',    color: 'var(--primary)'        },
            { label: 'Days Tracked',  value: `${daysTracked}`,                   unit: 'days', color: 'var(--color-blue)'     },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="card"
              id={`report-stat-${i}`}
              style={{ padding: '14px 10px', textAlign: 'center' }}
            >
              <p className="tabular-nums" style={{ fontSize: '1.2rem', fontWeight: 800, color: stat.color, lineHeight: 1 }}>
                {stat.value}
              </p>
              <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.3 }}>
                {stat.unit}
              </p>
              <p style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginTop: 4, fontWeight: 500 }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* ── Macro Trend Chart ────────────────────────────────── */}
        <div
          id="macro-trend-chart"
          className="card animate-fade-up delay-1"
          style={{ padding: '18px 16px', marginBottom: 16 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <p style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Macro Trend
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { label: 'Protein', color: 'var(--macro-protein)' },
                { label: 'Carbs',   color: 'var(--macro-carbs)'   },
                { label: 'Fat',     color: 'var(--macro-fat)'     },
              ].map(m => (
                <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: m.color }} />
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{m.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Grouped bar chart */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 70 }}>
            {WEEK_LABELS.map((day, i) => {
              const maxG = Math.max(...WEEKLY_PROTEIN, ...WEEKLY_CARBS, ...WEEKLY_FAT, 1);
              const pHeight = Math.max((weekProtein[i] / maxG) * 70, 2);
              const cHeight = Math.max((WEEKLY_CARBS[i] / maxG) * 70, 2);
              const fHeight = Math.max((WEEKLY_FAT[i] / maxG) * 70, 2);
              const isToday = i === 6;
              const opacity = weekProtein[i] === 0 ? 0.3 : 1;
              return (
                <div key={`day-${i}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: 70 }}>
                    <div style={{ width: 4, height: pHeight, backgroundColor: 'var(--macro-protein)', borderRadius: 2, opacity }} />
                    <div style={{ width: 4, height: cHeight, backgroundColor: 'var(--macro-carbs)',   borderRadius: 2, opacity }} />
                    <div style={{ width: 4, height: fHeight, backgroundColor: 'var(--macro-fat)',     borderRadius: 2, opacity }} />
                  </div>
                  <span style={{
                    fontSize: '0.6rem',
                    color: isToday ? 'var(--primary)' : 'var(--text-muted)',
                    fontWeight: isToday ? 700 : 400,
                  }}>
                    {day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Nutrition Score Timeline ─────────────────────────── */}
        <div
          id="score-timeline-chart"
          className="card animate-fade-up delay-2"
          style={{ padding: '18px 16px', marginBottom: 16 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <p style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Nutrition Score
            </p>
            <p className="tabular-nums" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Avg {Math.round(scoreTimeline.filter(v => v > 0).reduce((s, v) => s + v, 0) / scoreTimeline.filter(v => v > 0).length)}%
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 64 }}>
            {WEEK_LABELS.map((day, i) => {
              const h  = scoreTimeline[i] > 0 ? Math.max((scoreTimeline[i] / maxScoreChart) * 64, 4) : 4;
              const isToday = i === 6;
              const isEmpty = scoreTimeline[i] === 0;
              return (
                <div key={`score-${i}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                  <div
                    style={{
                      width: '100%',
                      height: h,
                      borderRadius: '4px 4px 0 0',
                      border: isEmpty ? '1px dashed var(--border)' : 'none',
                      backgroundImage: !isEmpty && !isToday
                        ? `linear-gradient(to top, ${barColor(scoreTimeline[i])}, ${barColor(scoreTimeline[i])}88)`
                        : undefined,
                      backgroundColor: isToday ? 'var(--primary)' : isEmpty ? 'var(--bg-surface)' : undefined,
                    }}
                  />
                  <span style={{
                    fontSize: '0.6rem',
                    color: isToday ? 'var(--primary)' : 'var(--text-muted)',
                    fontWeight: isToday ? 700 : 400,
                  }}>
                    {day}
                  </span>
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 8 }}>
            ↑ Today highlighted in green · Sunday not yet logged
          </p>
        </div>

        {/* ── Health System Breakdown ───────────────────────────── */}
        {systemBreakdown.length > 0 && (
          <div className="animate-fade-up delay-3" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <p style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Health System Breakdown
              </p>
              <button
                onClick={() => navigate('/health')}
                style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 600 }}
              >
                Full View →
              </button>
            </div>
            <div className="card" style={{ padding: '4px 16px' }}>
              {systemBreakdown.map(({ system, score, meta }, i) => (
                <div
                  key={system}
                  id={`report-system-${system.toLowerCase()}`}
                  style={{
                    padding: '12px 0',
                    borderBottom: i < systemBreakdown.length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.9rem' }}>{meta.emoji}</span>
                      <p style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-primary)' }}>{meta.label}</p>
                    </div>
                    <span className="tabular-nums" style={{ fontSize: '0.82rem', fontWeight: 700, color: barColor(score) }}>
                      {score}%
                    </span>
                  </div>
                  <ProgressBar value={score} color={barColor(score)} height={5} delay={i * 40} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Micronutrient Deficiency Summary ─────────────────── */}
        <div className="animate-fade-up delay-4" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <p style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Nutrient Gaps
            </p>
            <button
              onClick={() => navigate('/micronutrients')}
              style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 600 }}
            >
              All Nutrients →
            </button>
          </div>
          <div className="card" style={{ padding: '4px 16px' }}>
            {microDeficiencies.length === 0 ? (
              <div style={{ padding: '16px 0', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Log meals to see nutrient gaps.</p>
              </div>
            ) : (
              microDeficiencies.map(({ key, label, pct }, i) => (
                <div
                  key={key}
                  id={`report-micro-${key}`}
                  style={{
                    padding: '12px 0',
                    borderBottom: i < microDeficiencies.length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <p style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-primary)' }}>{label}</p>
                    <span className="tabular-nums" style={{ fontSize: '0.8rem', fontWeight: 700, color: barColor(pct) }}>
                      {pct}%
                    </span>
                  </div>
                  <ProgressBar value={pct} color={barColor(pct)} height={5} delay={i * 40} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
