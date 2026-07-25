import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNutrition } from '../context/NutritionContext';
import { useUser } from '../context/UserContext';
import { buildMicroCompletions } from '../engine/microConverter';
import type { LoggedFood } from '../types/nutrition.types';
import AppHeader from '../components/layout/AppHeader';
import BottomNav from '../components/layout/BottomNav';

const SLOTS: LoggedFood['slot'][] = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

const SLOT_TIMES: Record<LoggedFood['slot'], string> = {
  Breakfast: '8:30 AM',
  Lunch:     '12:30 PM',
  Snacks:    '4:30 PM',
  Dinner:    '7:30 PM',
};

const SLOT_EMOJIS: Record<LoggedFood['slot'], string> = {
  Breakfast: '☀️',
  Lunch:     '🌤️',
  Snacks:    '🍎',
  Dinner:    '🌙',
};

/**
 * Screen 2 — Today's Meals
 * PRD Section 8, ui-screens-spec.md Screen 2:
 * Header + meal category tabs + featured card + vertical timeline + AI rec card.
 * All data wired from NutritionContext (backend API).
 */
export default function Meals() {
  const { todayLog, removeFood, loading } = useNutrition();
  const { microRDA } = useUser();
  const navigate = useNavigate();

  const [activeSlotTab, setActiveSlotTab] = useState<LoggedFood['slot']>('Breakfast');

  // ── Slot calorie totals (from logged meals) ────────────────────────────
  const slotTotals = useMemo(() => {
    const totals: Record<string, { calories: number; protein: number; carbs: number; fat: number; items: LoggedFood[] }> = {};
    for (const slot of SLOTS) {
      const items = todayLog.meals.filter(m => m.slot === slot);
      totals[slot] = {
        calories: Math.round(items.reduce((s, m) => s + m.macros.calories, 0)),
        protein:  Math.round(items.reduce((s, m) => s + m.macros.protein, 0)),
        carbs:    Math.round(items.reduce((s, m) => s + m.macros.carbs, 0)),
        fat:      Math.round(items.reduce((s, m) => s + m.macros.fat, 0)),
        items,
      };
    }
    return totals;
  }, [todayLog]);

  // ── Detect low nutrients for AI recommendation ─────────────────────────
  const lowNutrientAlert = useMemo(() => {
    if (!microRDA || !todayLog.meals.length) return null;
    const consumed: Record<string, number> = {};
    for (const meal of todayLog.meals) {
      for (const [k, v] of Object.entries(meal.micros)) {
        consumed[k] = (consumed[k] ?? 0) + v;
      }
    }
    const completions = buildMicroCompletions(consumed, microRDA);
    // Find lowest-completion priority nutrient
    const alerts: { label: string; pct: number }[] = [
      { label: 'Iron',    pct: completions.iron ?? 0 },
      { label: 'Omega-3', pct: completions.omega3 ?? 0 },
      { label: 'Calcium', pct: completions.calcium ?? 0 },
      { label: 'Vitamin D', pct: completions.vitD ?? 0 },
    ];
    const lowest = alerts.sort((a, b) => a.pct - b.pct)[0];
    return lowest.pct < 80 ? lowest : null;
  }, [todayLog, microRDA]);

  // ── Active slot details ────────────────────────────────────────────────
  const activeSlotData = slotTotals[activeSlotTab];
  const activeSlotDone = activeSlotData.items.length > 0;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className="app-container">
      {/* ── Header ───────────────────────────────────────────── */}
      <AppHeader
        title={
          <h1 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Today's Meals
          </h1>
        }
        right={
          <button aria-label="Select date" style={{ color: 'var(--text-secondary)', display: 'flex' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8"  y1="2" x2="8"  y2="6" />
              <line x1="3"  y1="10" x2="21" y2="10" />
            </svg>
          </button>
        }
      />

      <div className="page-content">
        {/* ── Date display ────────────────────────────────────── */}
        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
          {today}
        </p>

        {/* ── Meal slot category tabs ──────────────────────────── */}
        <div className="pill-tabs" style={{ marginBottom: 16 }}>
          {SLOTS.map(slot => (
            <button
              key={slot}
              id={`meal-tab-${slot.toLowerCase()}`}
              className={`pill-tab ${activeSlotTab === slot ? 'active' : ''}`}
              onClick={() => setActiveSlotTab(slot)}
            >
              {SLOT_EMOJIS[slot]} {slot}
            </button>
          ))}
        </div>

        {/* ── Featured Active Meal Card ────────────────────────── */}
        {loading ? (
          <div className="card" style={{ padding: 20, marginBottom: 16, textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading meals…</p>
          </div>
        ) : activeSlotDone ? (
          <div className="card animate-fade-in" style={{ marginBottom: 16, overflow: 'hidden' }}>
            {/* Placeholder food image strip */}
            <div
              style={{
                height: 140,
                background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
              }}
            >
              {SLOT_EMOJIS[activeSlotTab]}
            </div>
            <div style={{ padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <p style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  {activeSlotTab} ({activeSlotData.items.length} item{activeSlotData.items.length !== 1 ? 's' : ''})
                </p>
                <span className="badge-completed">Logged ✓</span>
              </div>
              {/* Macro pills */}
              <div style={{ display: 'flex', gap: 12 }}>
                {[
                  { label: 'Calories', val: `${activeSlotData.calories} kcal`, color: 'var(--text-primary)' },
                  { label: 'Protein',  val: `${activeSlotData.protein}g`,      color: 'var(--macro-protein)' },
                  { label: 'Carbs',    val: `${activeSlotData.carbs}g`,        color: 'var(--macro-carbs)'  },
                  { label: 'Fat',      val: `${activeSlotData.fat}g`,          color: 'var(--macro-fat)'    },
                ].map(m => (
                  <div key={m.label} style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 2 }}>{m.label}</p>
                    <p style={{ fontSize: '0.8rem', fontWeight: 700, color: m.color }}>{m.val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Empty slot card */
          <div
            className="card animate-fade-in"
            style={{ marginBottom: 16, padding: 20, textAlign: 'center', border: '2px dashed var(--border)' }}
          >
            <p style={{ fontSize: '2rem', marginBottom: 6 }}>{SLOT_EMOJIS[activeSlotTab]}</p>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              {activeSlotTab} not logged yet
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 14 }}>
              Log from your meal plan or search for foods
            </p>
            <button
              className="btn-primary"
              style={{ padding: '10px 20px', fontSize: '0.85rem' }}
              onClick={() => navigate('/log-food')}
            >
              + Log Food
            </button>
          </div>
        )}

        {/* ── Meal Timeline ────────────────────────────────────── */}
        <p style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
          Meal Timeline
        </p>
        <div className="card" style={{ padding: '0 16px', marginBottom: 16 }}>
          {SLOTS.map(slot => {
            const data = slotTotals[slot];
            const done = data.items.length > 0;
            return (
              <div
                key={slot}
                className="timeline-item"
                id={`timeline-${slot.toLowerCase()}`}
                onClick={() => done
                  ? setActiveSlotTab(slot)
                  : navigate('/log-food')
                }
                style={{ cursor: 'pointer' }}
              >
                {/* Timeline dot */}
                <div className={`timeline-dot ${done ? 'timeline-dot--done' : 'timeline-dot--pending'}`}>
                  {done ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                      <circle cx="12" cy="12" r="6" />
                    </svg>
                  )}
                </div>

                {/* Slot info */}
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                    {slot}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {SLOT_TIMES[slot]} {done ? `• ${data.calories} kcal` : '• Not logged'}
                  </p>
                </div>

                {/* Action */}
                {done ? (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {data.items.map(item => (
                      <button
                        key={`${slot}-${item.foodId}`}
                        aria-label={`Remove ${item.name} from ${slot}`}
                        onClick={async e => {
                          e.stopPropagation();
                          await removeFood(slot, item.foodId);
                        }}
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          backgroundColor: 'var(--color-red-bg)',
                          color: 'var(--color-red)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.7rem',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        ×
                      </button>
                    ))}
                  </div>
                ) : (
                  <button
                    aria-label={`Add food to ${slot}`}
                    onClick={e => { e.stopPropagation(); navigate('/log-food'); }}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      backgroundColor: 'var(--bg-surface)',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid var(--border)',
                      cursor: 'pointer',
                      fontSize: '1.1rem',
                      lineHeight: 1,
                    }}
                  >
                    +
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* ── AI Recommendation Card ───────────────────────────── */}
        {lowNutrientAlert && (
          <div
            id="ai-recommendation-card"
            className="card animate-fade-up"
            style={{
              padding: 16,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 14,
              border: '1px solid var(--border)',
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                backgroundColor: 'var(--primary-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '1.3rem',
              }}
            >
              🌱
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--primary)', marginBottom: 4 }}>
                AI Recommendation
              </p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                You're low on <strong>{lowNutrientAlert.label}</strong>. Add Pumpkin Seeds to your next meal.
              </p>
            </div>
          </div>
        )}

        {/* ── Quick Actions ────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn-ghost"
            style={{ flex: 1 }}
            onClick={() => navigate('/meal-plan')}
          >
            📋 View Meal Plan
          </button>
          <button
            className="btn-primary"
            style={{ flex: 1, padding: '10px 16px', fontSize: '0.85rem' }}
            onClick={() => navigate('/log-food')}
          >
            + Log Food
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
