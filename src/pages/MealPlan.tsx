import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNutrition } from '../context/NutritionContext';
import { useUser } from '../context/UserContext';
import { generateMealPlan } from '../engine/mealGenerator';
import type { RecommendedMeal, SmartAdjustment } from '../engine/mealGenerator';
import type { LoggedFood } from '../types/nutrition.types';
import type { HealthSystem } from '../engine/healthScore';
import AppHeader from '../components/layout/AppHeader';
import BottomNav from '../components/layout/BottomNav';

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

const SLOT_EMOJIS: Record<string, string> = {
  Breakfast: '☀️',
  Lunch:     '🌤️',
  Snacks:    '🍎',
  Dinner:    '🌙',
};

/**
 * Screen 6 — Generated Meal Plan
 * PRD Section 7, ui-screens-spec.md Screen 6:
 * Plan summary banner + food carousel + meal slot cards + Generate New Plan CTA.
 * Fully wired to: generateMealPlan engine, saveMealPlan API, logSlotFromPlan API.
 */
export default function MealPlan() {
  const { todayLog, savedPlans, activePlan, saveMealPlan, setActiveMealPlan, logSlotFromPlan } = useNutrition();
  const { currentUser, nutritionTargets, microRDA } = useUser();
  const navigate = useNavigate();

  const [planOffset, setPlanOffset] = useState(0);
  const [recommendations, setRecommendations] = useState<{
    meals: RecommendedMeal[];
    adjustments: SmartAdjustment[];
    planDeficiencies: string[];
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [activeViewPlan, setActiveViewPlan] = useState<'generator' | string>('generator');

  // ── Daily totals from backend log ──────────────────────────────────────
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

  // ── Trigger meal plan generation engine ───────────────────────────────
  const handleGenerate = (offset = planOffset) => {
    if (!nutritionTargets || !microRDA) return;
    setIsGenerating(true);

    const remainCalories = Math.max(nutritionTargets.calories - dailyTotals.calories, 0);
    const remainProtein  = Math.max(nutritionTargets.protein_g - dailyTotals.protein, 0);
    const selectedSystems = (currentUser?.healthPriorities ?? [])
      .map(p => PRIORITY_MAP[p]).filter(Boolean) as HealthSystem[];

    const plan = generateMealPlan(
      remainCalories,
      remainProtein,
      microRDA,
      dailyTotals.micros,
      selectedSystems,
      [], // allowed ingredients — no filter
      [], // excluded ingredients — no filter
      currentUser?.dietaryRestrictions ?? [],
      offset
    );
    setRecommendations(plan);
    setActiveViewPlan('generator');
    setIsGenerating(false);
  };

  const handleRegenerate = () => {
    const next = planOffset + 1;
    setPlanOffset(next);
    handleGenerate(next);
  };

  // ── Log an entire slot from generated plan via API ────────────────────
  const handleLogSlot = async (slot: LoggedFood['slot'], items: any[]) => {
    const success = await logSlotFromPlan(slot, items);
    if (success) {
      setSaveMsg(`${slot} logged successfully!`);
      setTimeout(() => setSaveMsg(null), 3000);
    }
  };

  // ── Save plan to MongoDB via API ──────────────────────────────────────
  const handleSavePlan = async () => {
    if (!recommendations) return;
    const result = await saveMealPlan(
      `Plan ${savedPlans.length + 1}`,
      recommendations.meals,
      recommendations.planDeficiencies,
      recommendations.adjustments
    );
    if (result.success) {
      setSaveMsg('Plan saved!');
    } else {
      setSaveMsg(result.error ?? 'Failed to save plan');
    }
    setTimeout(() => setSaveMsg(null), 3000);
  };

  // ── Determine which plan to display ──────────────────────────────────
  const displayPlan = activeViewPlan === 'generator'
    ? recommendations
    : savedPlans.find(p => p._id === activeViewPlan) ?? null;

  const planName = activeViewPlan === 'generator'
    ? 'Generated Plan'
    : savedPlans.find(p => p._id === activeViewPlan)?.name ?? 'Saved Plan';

  const totalPlanCalories = displayPlan
    ? displayPlan.meals.reduce((s, m) => s + m.totalCalories, 0)
    : 0;
  const totalPlanProtein = displayPlan
    ? displayPlan.meals.reduce((s, m) => s + m.totalProtein, 0)
    : 0;

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
            Meal Plan
          </h1>
        }
        right={
          <button aria-label="Filter" style={{ color: 'var(--text-secondary)', display: 'flex' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
          </button>
        }
      />

      <div className="page-content">
        {/* ── Saved Plan tabs ──────────────────────────────────── */}
        {savedPlans.length > 0 && (
          <div className="pill-tabs" style={{ marginBottom: 16 }}>
            <button
              className={`pill-tab ${activeViewPlan === 'generator' ? 'active' : ''}`}
              onClick={() => setActiveViewPlan('generator')}
            >
              New Plan
            </button>
            {savedPlans.map(plan => (
              <button
                key={plan._id}
                className={`pill-tab ${activeViewPlan === plan._id ? 'active' : ''}`}
                onClick={() => setActiveViewPlan(plan._id!)}
                style={{ position: 'relative' }}
              >
                {plan.name}
                {plan.isActive && (
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary)',
                      position: 'absolute',
                      top: 4,
                      right: 4,
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        )}

        {/* ── Plan summary banner ──────────────────────────────── */}
        {displayPlan ? (
          <>
            <div
              className="card animate-fade-up"
              style={{
                padding: 16,
                marginBottom: 16,
                background: 'linear-gradient(135deg, #064E3B, #065F46)',
                border: 'none',
                color: '#FFFFFF',
              }}
            >
              <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>
                {planName}
              </p>
              <p style={{ fontWeight: 700, fontSize: '1rem' }}>
                High Protein Plan
              </p>
              <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
                {Math.round(totalPlanCalories)} kcal · {Math.round(totalPlanProtein)}g Protein
              </p>
            </div>

            {/* ── Deficiency alerts ────────────────────────────── */}
            {displayPlan.planDeficiencies.length > 0 && (
              <div
                className="card animate-fade-up delay-1"
                style={{ padding: 14, marginBottom: 16, backgroundColor: 'var(--color-amber-bg)', border: '1px solid var(--color-amber)' }}
              >
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-amber)', marginBottom: 6 }}>
                  ⚠️ Nutrient Gaps in This Plan
                </p>
                {displayPlan.planDeficiencies.map((d, i) => (
                  <p key={i} style={{ fontSize: '0.78rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    • {d}
                  </p>
                ))}
              </div>
            )}

            {/* ── Save msg ─────────────────────────────────────── */}
            {saveMsg && (
              <div style={{ padding: '10px 14px', backgroundColor: 'var(--primary-bg)', borderRadius: 8, marginBottom: 12, textAlign: 'center' }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600 }}>{saveMsg}</p>
              </div>
            )}

            {/* ── Meal slot cards ──────────────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              {displayPlan.meals.map((meal, i) => (
                <div
                  key={meal.slot}
                  id={`meal-plan-${meal.slot.toLowerCase()}`}
                  className="card animate-fade-up"
                  style={{ padding: 16, animationDelay: `${(i + 1) * 60}ms` }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 10,
                          backgroundColor: 'var(--primary-bg)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.3rem',
                        }}
                      >
                        {SLOT_EMOJIS[meal.slot] ?? '🍽️'}
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                          {meal.slot}
                        </p>
                        <p className="tabular-nums" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {Math.round(meal.totalCalories)} kcal
                        </p>
                      </div>
                    </div>
                    <button
                      id={`log-slot-${meal.slot.toLowerCase()}`}
                      onClick={() => handleLogSlot(meal.slot, meal.items)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--primary-bg)',
                        color: 'var(--primary)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        border: '1px solid rgba(22,163,74,0.2)',
                        cursor: 'pointer',
                      }}
                    >
                      Log Slot
                    </button>
                  </div>

                  {/* Food items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {meal.items.map((item: any) => {
                      const foodName = item.food ? item.food.name : item.name;
                      const cals = item.food ? item.food.macros.calories : (item.macros?.calories ?? 0);
                      const itemKey = item.food ? item.food.id : (item.foodId ?? item.name);
                      return (
                        <div
                          key={itemKey}
                          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                            {foodName}
                            <span style={{ color: 'var(--text-muted)', marginLeft: 4 }}>
                              ×{item.loggedQty}
                            </span>
                          </p>
                          <span className="tabular-nums" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {Math.round(cals * item.loggedQty)} kcal
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* ── Actions row ──────────────────────────────────── */}
            {activeViewPlan === 'generator' && (
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <button className="btn-ghost" style={{ flex: 1 }} onClick={handleSavePlan}>
                  💾 Save Plan
                </button>
                {savedPlans.length > 0 && activePlan?._id !== activeViewPlan && (
                  <button
                    className="btn-ghost"
                    style={{ flex: 1 }}
                    onClick={() => activePlan?._id && setActiveMealPlan(activePlan._id)}
                  >
                    ⚡ Set Active
                  </button>
                )}
              </div>
            )}

            {/* ── Smart Adjustments ────────────────────────────── */}
            {displayPlan.adjustments.length > 0 && (
              <div className="card" style={{ padding: 16, marginBottom: 16 }}>
                <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                  💡 Smart Adjustments
                </p>
                {displayPlan.adjustments.map((adj, i) => (
                  <p key={i} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 6, lineHeight: 1.4 }}>
                    • {adj.text}
                  </p>
                ))}
              </div>
            )}
          </>
        ) : (
          /* Empty state */
          <div className="card" style={{ padding: '40px 24px', textAlign: 'center', border: '2px dashed var(--border)' }}>
            <p style={{ fontSize: '2.5rem', marginBottom: 12 }}>🍲</p>
            <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 8 }}>
              No Meal Plan Generated
            </p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.5 }}>
              Tap "Generate New Plan" to create a personalized meal plan based on your remaining daily targets.
            </p>
          </div>
        )}

        {/* ── Generate New Plan sticky CTA ─────────────────────── */}
        <div style={{ position: 'sticky', bottom: 100, paddingTop: 12 }}>
          <button
            id="generate-new-plan-btn"
            className="btn-primary"
            onClick={handleRegenerate}
            disabled={isGenerating || !nutritionTargets}
            style={{ opacity: isGenerating || !nutritionTargets ? 0.6 : 1 }}
          >
            {isGenerating ? '⏳ Generating…' : '🔄 Generate New Plan'}
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
