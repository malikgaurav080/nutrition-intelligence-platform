import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNutrition } from '../context/NutritionContext';
import { useUser } from '../context/UserContext';
import { generateMealPlan } from '../engine/mealGenerator';
import type { RecommendedMeal, SmartAdjustment } from '../engine/mealGenerator';
import type { HealthSystem } from '../engine/healthScore';
import AppHeader from '../components/layout/AppHeader';
import BottomNav from '../components/layout/BottomNav';

const PRIORITY_MAP: Record<string, HealthSystem> = {
  'Brain Health': 'Brain',
  'Hair Health': 'Hair',
  'Skin Health': 'Skin',
  'Bone Health': 'Bone',
  'Heart Health': 'Heart',
  'Muscle Health': 'Muscle',
  'Immunity': 'Immunity',
  'Eye Health': 'Eye',
  'Blood Health': 'Blood',
  'Thyroid Health': 'Thyroid',
};

const SLOT_EMOJIS: Record<string, string> = {
  Breakfast: '☀️',
  Lunch: '🌤️',
  Snacks: '🍎',
  Dinner: '🌙',
};

const SLOT_TIMES: Record<string, string> = {
  Breakfast: '8:00 AM',
  Lunch: '1:00 PM',
  Snacks: '4:30 PM',
  Dinner: '8:00 PM',
};

/**
 * Screen 5.1 — Generate & Preview Meal Plan
 * PRD Section 7, ui-screens-spec.md Screen 5.1:
 * Dedicated meal plan preview screen with custom name input, nutrient gap alerts,
 * timeline view (without log buttons), regenerate CTA, and active plan toggle.
 */
export default function GeneratePlan() {
  const { todayLog, savedPlans, saveMealPlan, setActiveMealPlan } = useNutrition();
  const { currentUser, nutritionTargets, microRDA } = useUser();
  const navigate = useNavigate();

  const [planOffset, setPlanOffset] = useState(0);
  const [recommendations, setRecommendations] = useState<{
    meals: RecommendedMeal[];
    adjustments: SmartAdjustment[];
    planDeficiencies: string[];
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [customName, setCustomName] = useState<string>(`Plan ${savedPlans.length + 1}`);
  const [makeActive, setMakeActive] = useState<boolean>(true);

  // ── Calculate daily totals from today's log ───────────────────────────
  const dailyTotals = useMemo(() => {
    const totals = { calories: 0, protein: 0, micros: {} as Record<string, number> };
    for (const meal of todayLog.meals) {
      totals.calories += meal.macros.calories;
      totals.protein += meal.macros.protein;
      for (const [k, v] of Object.entries(meal.micros)) {
        totals.micros[k] = (totals.micros[k] ?? 0) + v;
      }
    }
    return totals;
  }, [todayLog]);

  // ── Trigger meal plan generation ──────────────────────────────────────
  const handleGenerate = (offset = planOffset) => {
    if (!nutritionTargets || !microRDA) return;
    setIsGenerating(true);

    const targetCalories = nutritionTargets.calories;
    const targetProtein = nutritionTargets.protein_g;
    const selectedSystems = (currentUser?.healthPriorities ?? [])
      .map(p => PRIORITY_MAP[p]).filter(Boolean) as HealthSystem[];

    const plan = generateMealPlan(
      targetCalories,
      targetProtein,
      microRDA,
      dailyTotals.micros,
      selectedSystems,
      [],
      [],
      currentUser?.dietaryRestrictions ?? [],
      offset
    );
    setRecommendations(plan);
    setIsGenerating(false);
  };

  useEffect(() => {
    handleGenerate(0);
  }, [nutritionTargets, microRDA]);

  const handleRegenerate = () => {
    const next = planOffset + 1;
    setPlanOffset(next);
    handleGenerate(next);
  };

  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);

  const isMaxLimitReached = savedPlans.length >= 3;

  const totalCalories = recommendations
    ? recommendations.meals.reduce((s, m) => s + m.totalCalories, 0)
    : 0;
  const totalProtein = recommendations
    ? recommendations.meals.reduce((s, m) => s + m.totalProtein, 0)
    : 0;
  const totalCarbs = recommendations
    ? recommendations.meals.reduce((s, m) => s + m.items.reduce((itSum: number, it: any) => {
        const macros = it.food ? it.food.macros : (it.macros ?? {});
        return itSum + (macros.carbs_g ?? macros.carbs ?? 0) * (it.loggedQty ?? 1);
      }, 0), 0)
    : 0;
  const totalFat = recommendations
    ? recommendations.meals.reduce((s, m) => s + m.items.reduce((itSum: number, it: any) => {
        const macros = it.food ? it.food.macros : (it.macros ?? {});
        return itSum + (macros.fat_g ?? macros.fat ?? 0) * (it.loggedQty ?? 1);
      }, 0), 0)
    : 0;

  const handleOpenSaveModal = () => {
    if (!recommendations) return;
    if (isMaxLimitReached) {
      setSaveMsg('Maximum limit of 3 meal plans reached. Please delete an existing plan to save a new one.');
      return;
    }
    setCustomName(`Plan ${savedPlans.length + 1}`);
    setShowSaveModal(true);
  };

  // ── Save plan with custom name and optional active set ────────────────
  const handleConfirmSave = async () => {
    if (!recommendations) return;
    setIsSaving(true);

    const planTitle = customName.trim() || `Plan ${savedPlans.length + 1}`;
    const result = await saveMealPlan(
      planTitle,
      recommendations.meals,
      recommendations.planDeficiencies,
      recommendations.adjustments
    );

    const res = result as { success: boolean; error?: string; newPlanId?: string };

    if (res.success) {
      if (makeActive && res.newPlanId) {
        await setActiveMealPlan(res.newPlanId);
      }
      setSaveMsg('Plan saved successfully!');
      setShowSaveModal(false);
      setTimeout(() => {
        navigate('/meals');
      }, 800);
    } else {
      setSaveMsg(res.error ?? 'Failed to save plan');
      setIsSaving(false);
    }
  };

  return (
    <div className="app-container">
      {/* ── App Header ────────────────────────────────────────── */}
      <AppHeader
        left={
          <button aria-label="Go back" onClick={() => navigate('/meals')} style={{ color: 'var(--text-primary)', display: 'flex' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        }
        title={
          <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Generate New Plan
          </h1>
        }
      />

      <div className="page-content">
        {/* ── Max Limit Reached Warning Card ────────────────────── */}
        {isMaxLimitReached && (
          <div
            className="card animate-fade-up"
            style={{
              padding: 16,
              marginBottom: 16,
              backgroundColor: 'var(--color-amber-bg)',
              border: '1.5px solid var(--color-amber)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{ fontSize: '1.4rem' }}>⚠️</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-amber)', margin: '0 0 4px 0' }}>
                  Maximum Plan Limit Reached (3/3)
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                  You already have 3 saved meal plans. Please delete an existing plan to save a new one.
                </p>
                <button
                  onClick={() => navigate('/meals')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--color-amber)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  🗑️ Manage & Delete Existing Plans
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Plan Summary Banner ────────────────────────────── */}
        {recommendations && (
          <div
            className="card animate-fade-up"
            style={{
              padding: 16,
              marginBottom: 16,
              background: 'linear-gradient(135deg, #064E3B, #065F46)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              color: '#FFFFFF',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: '0.72rem', color: '#34D399', fontWeight: 700, textTransform: 'uppercase' }}>
                Meal Plan Preview
              </span>
              <button
                onClick={handleRegenerate}
                disabled={isGenerating}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#FFFFFF',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                {isGenerating ? '⏳ Generating…' : '🔄 Regenerate'}
              </button>
            </div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 4px 0' }}>
              Generated Meal Plan
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.85)', margin: 0 }}>
              High Protein Plan · {Math.round(totalCalories)} kcal · {Math.round(totalProtein)}g P · {Math.round(totalCarbs)}g C · {Math.round(totalFat)}g F
            </p>
          </div>
        )}

        {/* ── Nutrient Gap Alerts ────────────────────────────── */}
        {recommendations && recommendations.planDeficiencies.length > 0 && (
          <div
            className="card animate-fade-up delay-1"
            style={{ padding: 14, marginBottom: 16, backgroundColor: 'var(--color-amber-bg)', border: '1px solid var(--color-amber)' }}
          >
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-amber)', marginBottom: 6 }}>
              ⚠️ Nutrient Gaps in This Plan
            </p>
            {recommendations.planDeficiencies.map((deficiency, idx) => (
              <p key={idx} style={{ fontSize: '0.78rem', color: 'var(--text-primary)', lineHeight: 1.4, margin: '2px 0' }}>
                • {deficiency}
              </p>
            ))}
          </div>
        )}

        {/* ── Save Message Alert ─────────────────────────────── */}
        {saveMsg && (
          <div style={{ padding: '10px 14px', backgroundColor: 'var(--primary-bg)', borderRadius: 8, marginBottom: 16, textAlign: 'center' }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600 }}>{saveMsg}</p>
          </div>
        )}

        {/* ── Timeline Meal Slots (Draft Preview without Log buttons) ── */}
        {recommendations && (
          <div style={{ position: 'relative', paddingLeft: 20, marginBottom: 24 }}>
            {/* Timeline track line */}
            <div
              style={{
                position: 'absolute',
                left: 6,
                top: 14,
                bottom: 14,
                width: 2,
                background: 'linear-gradient(to bottom, var(--primary) 0%, rgba(22, 163, 74, 0.25) 100%)',
                borderRadius: 1,
              }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {recommendations.meals.map((meal, i) => (
                <div key={meal.slot} style={{ position: 'relative' }}>
                  {/* Timeline node */}
                  <div
                    style={{
                      position: 'absolute',
                      left: -20,
                      top: 20,
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      backgroundColor: 'var(--bg-dark)',
                      border: '2.5px solid var(--primary)',
                      boxShadow: '0 0 8px rgba(22, 163, 74, 0.5)',
                      zIndex: 2,
                    }}
                  />

                  {/* Meal Card */}
                  <div className="card animate-fade-up" style={{ padding: 16, animationDelay: `${(i + 1) * 60}ms` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            backgroundColor: 'var(--primary-bg)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.2rem',
                          }}
                        >
                          {SLOT_EMOJIS[meal.slot] ?? '🍽️'}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', margin: 0 }}>
                              {meal.slot}
                            </p>
                            <span
                              style={{
                                fontSize: '0.68rem',
                                fontWeight: 600,
                                color: 'var(--primary)',
                                backgroundColor: 'var(--primary-bg)',
                                padding: '2px 8px',
                                borderRadius: 'var(--radius-full)',
                              }}
                            >
                              ⏰ {SLOT_TIMES[meal.slot] ?? '12:00 PM'}
                            </span>
                          </div>
                          <p className="tabular-nums" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                            {Math.round(meal.totalCalories)} kcal · {Math.round(meal.totalProtein)}g P · {Math.round(meal.items.reduce((s: number, it: any) => s + ((it.food?.macros?.carbs_g ?? it.macros?.carbs ?? 0) * (it.loggedQty ?? 1)), 0))}g C · {Math.round(meal.items.reduce((s: number, it: any) => s + ((it.food?.macros?.fat_g ?? it.macros?.fat ?? 0) * (it.loggedQty ?? 1)), 0))}g F
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Food Items List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 10, borderTop: '1px dashed var(--border)' }}>
                      {meal.items.map((item: any) => {
                        const foodName = item.food ? item.food.name : item.name;
                        const qty = item.loggedQty ?? 1;
                        const macros = item.food ? item.food.macros : (item.macros ?? {});
                        const cals = Math.round((macros.calories ?? 0) * qty);
                        const protein = Math.round((macros.protein_g ?? macros.protein ?? 0) * qty);
                        const carbs = Math.round((macros.carbs_g ?? macros.carbs ?? 0) * qty);
                        const fat = Math.round((macros.fat_g ?? macros.fat ?? 0) * qty);
                        const itemKey = item.food ? item.food.id : (item.foodId ?? item.name);

                        return (
                          <div
                            key={itemKey}
                            style={{
                              padding: '6px 10px',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: 'rgba(255, 255, 255, 0.03)',
                              border: '1px solid rgba(255, 255, 255, 0.06)',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                                {foodName}
                                <span style={{ color: 'var(--text-muted)', marginLeft: 6, fontSize: '0.75rem', fontWeight: 400 }}>
                                  ×{qty}
                                </span>
                              </p>
                              <span className="tabular-nums" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                {cals} kcal
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              <span>🥩 {protein}g P</span>
                              <span>🍞 {carbs}g C</span>
                              <span>🥑 {fat}g F</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Regenerate & Save Sticky CTAs ────────────────── */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 80 }}>
          <button
            className="btn-ghost"
            onClick={handleRegenerate}
            disabled={isGenerating}
            style={{ flex: 1 }}
          >
            🔄 Regenerate
          </button>

          <button
            className="btn-primary"
            onClick={handleOpenSaveModal}
            disabled={isSaving || !recommendations || isMaxLimitReached}
            style={{
              flex: 2,
              opacity: isSaving || isMaxLimitReached ? 0.65 : 1,
              backgroundColor: isMaxLimitReached ? 'var(--text-muted)' : undefined,
              cursor: isMaxLimitReached ? 'not-allowed' : 'pointer',
            }}
          >
            {isMaxLimitReached ? '🔒 Limit Reached (3/3)' : '💾 Save Meal Plan'}
          </button>
        </div>
      </div>

      {/* ── Save Meal Plan Modal Popup ─────────────────────────── */}
      {showSaveModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 16,
          }}
        >
          <div
            className="card animate-fade-up"
            style={{
              width: '100%',
              maxWidth: 380,
              padding: 20,
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                💾 Save Meal Plan
              </h3>
              <button
                onClick={() => setShowSaveModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Plan Name Input */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 6 }}>
                ✏️ Plan Name
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Enter plan name..."
                autoFocus
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  outline: 'none',
                }}
              />
            </div>

            {/* Make Active Toggle */}
            <div
              onClick={() => setMakeActive(prev => !prev)}
              style={{
                padding: '10px 12px',
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                borderRadius: 'var(--radius-md)',
                border: `1.5px solid ${makeActive ? 'var(--primary)' : 'var(--border)'}`,
                backgroundColor: makeActive ? 'var(--primary-bg)' : 'rgba(255, 255, 255, 0.02)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.1rem' }}>🌟</span>
                <div>
                  <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    Set as Active Plan
                  </p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '1px 0 0 0' }}>
                    Make this your primary daily target plan
                  </p>
                </div>
              </div>
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 5,
                  border: `2px solid ${makeActive ? 'var(--primary)' : 'var(--border)'}`,
                  backgroundColor: makeActive ? 'var(--primary)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                }}
              >
                {makeActive ? '✓' : ''}
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn-ghost"
                onClick={() => setShowSaveModal(false)}
                style={{ flex: 1 }}
              >
                Cancel
              </button>

              <button
                className="btn-primary"
                onClick={handleConfirmSave}
                disabled={isSaving}
                style={{ flex: 1, opacity: isSaving ? 0.7 : 1 }}
              >
                {isSaving ? 'Saving…' : 'Save Plan'}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
