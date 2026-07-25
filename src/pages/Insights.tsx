import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useNutrition } from '../context/NutritionContext';
import { buildMicroCompletions } from '../engine/microConverter';
import AppHeader from '../components/layout/AppHeader';
import BottomNav from '../components/layout/BottomNav';
import SegmentedControl from '../components/ui/SegmentedControl';

type Timeframe = 'Today' | 'Weekly' | 'Monthly';

/**
 * Screen 8 — Insights & Trends
 * PRD Section 6.2, ui-screens-spec.md Screen 8:
 * Timeframe toggle + hero insight card + weekly trend bar chart + top consumed foods.
 * Data wired from todayLog (backend) + microRDA for deficiency detection.
 */
export default function Insights() {
  const { microRDA } = useUser();
  const { todayLog } = useNutrition();
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState<Timeframe>('Weekly');

  // ── Aggregate daily log totals (backend data) ──────────────────────────
  const dailyTotals = useMemo(() => {
    const totals = { calories: 0, protein: 0, micros: {} as Record<string, number> };
    for (const meal of todayLog.meals) {
      totals.calories += meal.macros.calories;
      totals.protein  += meal.macros.protein;
      for (const [k, v] of Object.entries(meal.micros)) {
        totals.micros[k] = (totals.micros[k] ?? 0) + v;
      }
    }
    return totals;
  }, [todayLog]);

  // ── Detect lowest micronutrient for hero insight ──────────────────────
  const deficientNutrient = useMemo(() => {
    if (!microRDA) return null;
    const completions = buildMicroCompletions(dailyTotals.micros, microRDA);
    const candidates = [
      { key: 'iron',    label: 'Iron',     suggestion: 'Add more lentils, spinach or pumpkin seeds to complete your target.' },
      { key: 'vitD',    label: 'Vitamin D', suggestion: 'Add more fortified foods or spend time in sunlight.' },
      { key: 'calcium', label: 'Calcium',   suggestion: 'Add milk, yogurt, or sesame seeds to your meals.' },
      { key: 'omega3',  label: 'Omega-3',   suggestion: 'Add flaxseeds or walnuts to your next meal.' },
      { key: 'zinc',    label: 'Zinc',      suggestion: 'Add pumpkin seeds or chickpeas to your diet.' },
    ];
    const sorted = candidates
      .map(c => ({ ...c, pct: (completions as Record<string, number>)[c.key] ?? 0 }))
      .sort((a, b) => a.pct - b.pct);
    return sorted[0];
  }, [dailyTotals, microRDA]);

  // ── Top consumed foods from today's log ────────────────────────────────
  const topFoods = useMemo(() => {
    const counts: Record<string, { name: string; count: number; calories: number }> = {};
    for (const meal of todayLog.meals) {
      const key = meal.foodId;
      if (!counts[key]) {
        counts[key] = { name: meal.name, count: 0, calories: 0 };
      }
      counts[key].count++;
      counts[key].calories += meal.macros.calories;
    }
    return Object.values(counts)
      .sort((a, b) => b.calories - a.calories)
      .slice(0, 5);
  }, [todayLog]);

  // ── Weekly trend data (mock values for demo — real data in Phase 2 API) ─
  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const weekCalories = [1920, 1750, 2100, 1650, 1850, 2050, Math.round(dailyTotals.calories) || 1850];
  const maxCalories  = Math.max(...weekCalories, 1);
  const avgCalories  = Math.round(weekCalories.reduce((s, v) => s + v, 0) / weekCalories.length);

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
            Insights
          </h1>
        }
      />

      <div className="page-content">
        {/* ── Timeframe selector ───────────────────────────────── */}
        <div style={{ marginBottom: 20 }}>
          <SegmentedControl
            id="insights-timeframe"
            options={['Today', 'Weekly', 'Monthly']}
            value={timeframe}
            onChange={v => setTimeframe(v as Timeframe)}
          />
        </div>

        {/* ── Hero Nutrient Insight Card ───────────────────────── */}
        {deficientNutrient && deficientNutrient.pct < 80 && (
          <div
            id="nutrient-insight-card"
            className="card animate-fade-up"
            style={{ padding: 20, marginBottom: 16, display: 'flex', gap: 16, alignItems: 'flex-start' }}
          >
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)', marginBottom: 6, letterSpacing: '0.04em' }}>
                NUTRIENT INSIGHT
              </p>
              <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                Your {deficientNutrient.label} intake is low
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>
                {deficientNutrient.suggestion}
              </p>
              <button
                onClick={() => navigate('/log-food')}
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                Improve Now →
              </button>
            </div>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 12,
                backgroundColor: 'var(--primary-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                flexShrink: 0,
              }}
            >
              🌱
            </div>
          </div>
        )}

        {/* ── Weekly Trend Chart ───────────────────────────────── */}
        <div
          id="weekly-trend-chart"
          className="card animate-fade-up delay-1"
          style={{ padding: 20, marginBottom: 16 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                Calories (avg)
              </p>
              <p className="tabular-nums" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {avgCalories.toLocaleString()} kcal
              </p>
              <p style={{ fontSize: '0.72rem', color: 'var(--color-amber)', marginTop: 2 }}>
                ↓ 120 kcal vs last week
              </p>
            </div>
          </div>

          {/* Bar chart */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80 }}>
            {weekDays.map((day, i) => {
              const height = Math.max((weekCalories[i] / maxCalories) * 80, 6);
              const isToday = i === 6;
              return (
                <div
                  key={`${day}-${i}`}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
                >
                  <div
                    style={{
                      width: '100%',
                      height,
                      backgroundColor: isToday ? 'var(--primary)' : 'var(--bg-surface)',
                      borderRadius: '4px 4px 0 0',
                      transition: `height 0.8s cubic-bezier(0.34,1.56,0.64,1) ${i * 60}ms`,
                      border: `1px solid ${isToday ? 'transparent' : 'var(--border)'}`,
                    }}
                  />
                  <span style={{ fontSize: '0.65rem', color: isToday ? 'var(--primary)' : 'var(--text-muted)', fontWeight: isToday ? 700 : 400 }}>
                    {day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Top Consumed Foods ───────────────────────────────── */}
        <div className="card animate-fade-up delay-2" style={{ padding: '4px 16px', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
            <p style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Top Consumed Foods
            </p>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>This Week</span>
          </div>

          {topFoods.length === 0 ? (
            <div style={{ padding: '20px 0', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Log meals to see your top foods.
              </p>
            </div>
          ) : (
            topFoods.map((food, i) => (
              <div
                key={food.name}
                id={`top-food-${i}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: i < topFoods.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      backgroundColor: 'var(--bg-surface)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                    }}
                  >
                    {i + 1}
                  </span>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {food.name}
                  </p>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {food.count} serving{food.count !== 1 ? 's' : ''}
                </p>
              </div>
            ))
          )}
        </div>

        {/* ── Link to micronutrient detail ─────────────────────── */}
        <button
          className="btn-ghost"
          style={{ width: '100%' }}
          onClick={() => navigate('/micronutrients')}
        >
          View Micronutrient Details →
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
