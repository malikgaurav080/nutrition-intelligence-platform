import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useNutrition } from '../context/NutritionContext';
import { buildMicroCompletions } from '../engine/microConverter';
import { calcOverallScore, calcHealthScore, HEALTH_SYSTEM_META } from '../engine/healthScore';
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

// All 10 systems in display order
const ALL_SYSTEMS: HealthSystem[] = ['Brain', 'Immunity', 'Heart', 'Bone', 'Muscle', 'Skin', 'Hair', 'Eye', 'Blood', 'Thyroid'];

type FilterTab = 'All' | 'Needs Attention' | 'Strong';

function scoreLabel(score: number): string {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Needs Attention';
  return 'Low';
}

function barColor(score: number): string {
  if (score >= 85) return 'var(--primary)';
  if (score >= 70) return 'var(--primary)';
  if (score >= 50) return 'var(--color-amber)';
  return 'var(--color-red)';
}

function labelColor(score: number): string {
  if (score >= 70) return 'var(--primary)';
  if (score >= 50) return 'var(--color-amber)';
  return 'var(--color-red)';
}

/**
 * Screen 3 — Health Systems
 * PRD Section 5, ui-screens-spec.md Screen 3:
 * Filter tabs (All/Needs Attention/Strong) + 10 system progress rows + overall score ring.
 * Health scores computed from backend log data via engine.
 */
export default function Health() {
  const { currentUser, nutritionTargets, microRDA } = useUser();
  const { todayLog } = useNutrition();
  const navigate = useNavigate();
  const [filterTab, setFilterTab] = useState<FilterTab>('All');

  // ── Compute daily totals (backend log data) ────────────────────────────
  const dailyTotals = useMemo(() => {
    const totals = { protein: 0, micros: {} as Record<string, number> };
    for (const meal of todayLog.meals) {
      totals.protein += meal.macros.protein;
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

  // Show all 10 systems, but mark non-selected as n/a
  const systemScores = useMemo(() => {
    return ALL_SYSTEMS.map(system => {
      const score = completions ? calcHealthScore(system, completions, proteinPct) : 0;
      const isSelected = selectedSystems.includes(system);
      return { system, score, isSelected };
    });
  }, [completions, selectedSystems, proteinPct]);

  // Filter systems by tab
  const filteredSystems = useMemo(() => {
    return systemScores.filter(({ score, isSelected }) => {
      if (!isSelected) return false;
      if (filterTab === 'All')              return true;
      if (filterTab === 'Needs Attention')  return score < 70;
      if (filterTab === 'Strong')           return score >= 70;
      return true;
    });
  }, [systemScores, filterTab]);

  const ringColor = overallScore >= 70 ? 'var(--primary)' : overallScore >= 50 ? 'var(--color-amber)' : 'var(--color-red)';

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
            Health Systems
          </h1>
        }
        right={
          <button aria-label="Info" style={{ color: 'var(--text-secondary)', display: 'flex' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8"  x2="12.01" y2="8" />
            </svg>
          </button>
        }
      />

      <div className="page-content">
        {/* ── Filter Tabs ──────────────────────────────────────── */}
        <div className="pill-tabs" style={{ marginBottom: 20 }}>
          {(['All', 'Needs Attention', 'Strong'] as FilterTab[]).map(tab => (
            <button
              key={tab}
              id={`filter-${tab.toLowerCase().replace(/\s+/g, '-')}`}
              className={`pill-tab ${filterTab === tab ? 'active' : ''}`}
              onClick={() => setFilterTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── System Progress Rows ─────────────────────────────── */}
        {selectedSystems.length === 0 ? (
          <div className="card" style={{ padding: 24, textAlign: 'center' }}>
            <p style={{ fontSize: '2rem', marginBottom: 8 }}>🎯</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Add health priorities in your profile to see system scores.
            </p>
          </div>
        ) : filteredSystems.length === 0 ? (
          <div className="card" style={{ padding: 24, textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              No health systems in this category today.
            </p>
          </div>
        ) : (
          <div className="card" style={{ padding: '4px 16px', marginBottom: 20 }}>
            {filteredSystems.map(({ system, score }, i) => {
              const meta = HEALTH_SYSTEM_META[system];
              const label = scoreLabel(score);
              const color = barColor(score);
              const lColor = labelColor(score);
              const isAmber = score < 70 && score >= 50;
              return (
                <div
                  key={system}
                  id={`health-row-${system.toLowerCase()}`}
                  className="animate-fade-up"
                  style={{
                    padding: '14px 0',
                    borderBottom: i < filteredSystems.length - 1 ? '1px solid var(--border)' : 'none',
                    animationDelay: `${i * 50}ms`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {/* Icon circle */}
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          backgroundColor: isAmber ? 'var(--color-amber-bg)' : 'var(--primary-bg)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1rem',
                        }}
                      >
                        {meta.emoji}
                      </div>
                      <div>
                        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {meta.label}
                        </p>
                        <p style={{ fontSize: '0.7rem', color: isAmber ? 'var(--color-amber)' : 'var(--text-muted)' }}>
                          {isAmber ? 'Needs Attention' : label}
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p className="tabular-nums" style={{ fontSize: '1rem', fontWeight: 700, color: lColor }}>
                        {score}%
                      </p>
                      <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{label}</p>
                    </div>
                  </div>
                  <ProgressBar value={score} color={color} height={6} delay={i * 50} />
                </div>
              );
            })}
          </div>
        )}

        {/* ── Overall Health Score Card ─────────────────────────── */}
        <div
          id="overall-health-score-card"
          className="card animate-fade-up"
          style={{ padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 4 }}>
              Overall Health Score
            </p>
            <p
              className="tabular-nums"
              style={{ fontSize: '2.2rem', fontWeight: 800, color: ringColor, lineHeight: 1 }}
            >
              {overallScore}%
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              {scoreLabel(overallScore)}
            </p>
          </div>
          <ProgressRing
            value={overallScore}
            size={90}
            strokeWidth={9}
            color={ringColor}
            trackColor="var(--bg-surface)"
          >
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              {overallScore}%
            </span>
          </ProgressRing>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
