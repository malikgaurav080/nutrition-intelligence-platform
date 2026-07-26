import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNutrition } from '../context/NutritionContext';
import type { LoggedFood } from '../types/nutrition.types';
import AppHeader from '../components/layout/AppHeader';
import BottomNav from '../components/layout/BottomNav';
import { parseTimeToMinutes } from '../engine/mealGenerator';

const SLOT_EMOJIS: Record<string, string> = {
  Breakfast: '☀️',
  Lunch: '🌤️',
  Snacks: '🍎',
  Dinner: '🌙',
  'Pre-Workout': '⚡',
  'Post-Workout': '💪',
};

const SLOT_TIMES: Record<string, string> = {
  Breakfast: '8:00 AM',
  Lunch: '1:00 PM',
  Snacks: '4:30 PM',
  Dinner: '8:30 PM',
  'Pre-Workout': '5:00 PM',
  'Post-Workout': '7:00 PM',
};

/**
 * Screen 6 — Generated Meal Plan
 * PRD Section 7, ui-screens-spec.md Screen 6:
 * Active plan top banner + Switch Plan dropdown selector + meal slot cards + Generate New Plan CTA.
 * Fully wired to: generateMealPlan engine, saveMealPlan API, logSlotFromPlan API.
 */
export default function MealPlan() {
  const { todayLog, savedPlans, activePlan, setActiveMealPlan, deleteMealPlan, logSlotFromPlan } = useNutrition();
  const navigate = useNavigate();

  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [activeViewPlan, setActiveViewPlan] = useState<string>('');
  const [showSwitcher, setShowSwitcher] = useState<boolean>(false);

  const currentActivePlan = activePlan || savedPlans.find(p => p.isActive) || savedPlans[0];

  useEffect(() => {
    if (!activeViewPlan && savedPlans.length > 0) {
      const defaultId = currentActivePlan?._id || savedPlans[0]._id || '';
      setActiveViewPlan(defaultId);
    }
  }, [savedPlans, activePlan, activeViewPlan, currentActivePlan]);

  // ── Log an entire slot from plan via API ───────────────────────────────
  const handleLogSlot = async (slot: LoggedFood['slot'], items: any[]) => {
    const success = await logSlotFromPlan(slot, items);
    if (success) {
      setSaveMsg(`${slot} logged successfully!`);
      setTimeout(() => setSaveMsg(null), 3000);
    }
  };

  // ── Determine which plan to display ──────────────────────────────────
  const selectedSavedPlan = savedPlans.find(p => p._id === activeViewPlan) ?? currentActivePlan ?? savedPlans[0];
  const displayPlan = selectedSavedPlan;
  const planName = selectedSavedPlan?.name ?? 'Plan 1';

  // Chronologically sort meals by time of day
  const sortedMeals = useMemo(() => {
    if (!displayPlan?.meals) return [];
    return [...displayPlan.meals].sort((a, b) => {
      const timeA = parseTimeToMinutes(a.time || (SLOT_TIMES[a.slot] ?? '12:00 PM'));
      const timeB = parseTimeToMinutes(b.time || (SLOT_TIMES[b.slot] ?? '12:00 PM'));
      return timeA - timeB;
    });
  }, [displayPlan]);

  const totalPlanCalories = displayPlan
    ? displayPlan.meals.reduce((s, m) => s + m.totalCalories, 0)
    : 0;
  const totalPlanProtein = displayPlan
    ? displayPlan.meals.reduce((s, m) => s + m.totalProtein, 0)
    : 0;
  const totalPlanCarbs = displayPlan
    ? displayPlan.meals.reduce((s, m) => {
        const carbs = m.items.reduce((itSum: number, it: any) => {
          const macros = it.food ? it.food.macros : (it.macros ?? {});
          return itSum + (macros.carbs_g ?? macros.carbs ?? 0) * (it.loggedQty ?? 1);
        }, 0);
        return s + carbs;
      }, 0)
    : 0;
  const totalPlanFat = displayPlan
    ? displayPlan.meals.reduce((s, m) => {
        const fat = m.items.reduce((itSum: number, it: any) => {
          const macros = it.food ? it.food.macros : (it.macros ?? {});
          return itSum + (macros.fat_g ?? macros.fat ?? 0) * (it.loggedQty ?? 1);
        }, 0);
        return s + fat;
      }, 0)
    : 0;

  return (
    <div className="app-container">
      {/* ── Header ───────────────────────────────────────────── */}
      <AppHeader
        title={
          <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Meal Plan
          </h1>
        }
      />

      <div className="page-content">
        {displayPlan ? (
          <>
            {/* ── Single Merged Unified Meal Plan Banner Card ─────── */}
            <div
              className="card animate-fade-up"
              style={{
                padding: 16,
                marginBottom: 16,
                background: 'linear-gradient(135deg, #064E3B, #065F46)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                borderRadius: 'var(--radius-lg)',
                color: '#FFFFFF',
              }}
            >
              {/* Header row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: '0.7rem', color: '#34D399', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    🌟 {selectedSavedPlan?.isActive || currentActivePlan?._id === selectedSavedPlan?._id ? 'Active Plan' : 'Meal Plan'}
                  </span>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#34D399', display: 'inline-block' }} />
                </div>

                <button
                  id="switch-plan-btn"
                  onClick={() => setShowSwitcher(prev => !prev)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: showSwitcher ? '#FFFFFF' : 'rgba(255, 255, 255, 0.15)',
                    color: showSwitcher ? '#064E3B' : '#FFFFFF',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {showSwitcher ? '✕ Close' : '🔄 Switch Plan'}
                </button>
              </div>

              {/* Plan Name & Metrics */}
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF', margin: '0 0 2px 0' }}>
                {planName}
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.85)', margin: 0 }}>
                High Protein Plan · {Math.round(totalPlanCalories)} kcal · {Math.round(totalPlanProtein)}g P · {Math.round(totalPlanCarbs)}g C · {Math.round(totalPlanFat)}g F
              </p>

          {/* Integrated Selector inside the same banner */}
          {showSwitcher && (
            <div
              style={{
                marginTop: 14,
                paddingTop: 14,
                borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#34D399', margin: '0 0 4px 0' }}>
                Select a Meal Plan:
              </p>
              {savedPlans.map(plan => {
                const isSelected = activeViewPlan === plan._id || (!activeViewPlan && plan._id === selectedSavedPlan?._id);
                const isPlanActive = plan.isActive || currentActivePlan?._id === plan._id;
                const planCals = plan.meals.reduce((s: number, m: any) => s + m.totalCalories, 0);
                const planProtein = plan.meals.reduce((s: number, m: any) => s + m.totalProtein, 0);
                const planCarbs = plan.meals.reduce((s: number, m: any) => s + m.items.reduce((itSum: number, it: any) => {
                  const macros = it.food ? it.food.macros : (it.macros ?? {});
                  return itSum + (macros.carbs_g ?? macros.carbs ?? 0) * (it.loggedQty ?? 1);
                }, 0), 0);
                const planFat = plan.meals.reduce((s: number, m: any) => s + m.items.reduce((itSum: number, it: any) => {
                  const macros = it.food ? it.food.macros : (it.macros ?? {});
                  return itSum + (macros.fat_g ?? macros.fat ?? 0) * (it.loggedQty ?? 1);
                }, 0), 0);

                return (
                  <div
                    key={plan._id}
                    onClick={() => {
                      setActiveViewPlan(plan._id!);
                      setShowSwitcher(false);
                    }}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                      border: `1px solid ${isSelected ? '#34D399' : 'rgba(255, 255, 255, 0.1)'}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.85rem', color: '#FFFFFF', margin: 0 }}>
                        {plan.name} {isSelected ? '(Viewing)' : ''}
                      </p>
                      <p style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.75)', margin: '2px 0 0 0' }}>
                        {Math.round(planCals)} kcal · {Math.round(planProtein)}g P · {Math.round(planCarbs)}g C · {Math.round(planFat)}g F
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {isPlanActive ? (
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, backgroundColor: '#34D399', color: '#064E3B', padding: '3px 8px', borderRadius: 'var(--radius-full)' }}>
                          Active Plan ✓
                        </span>
                      ) : (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            const ok = await setActiveMealPlan(plan._id!);
                            if (ok) {
                              setActiveViewPlan(plan._id!);
                              setSaveMsg(`${plan.name} activated!`);
                              setShowSwitcher(false);
                              setTimeout(() => setSaveMsg(null), 2500);
                            }
                          }}
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            color: '#FFFFFF',
                            backgroundColor: 'rgba(255, 255, 255, 0.15)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-full)',
                            cursor: 'pointer',
                          }}
                        >
                          Set Active
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {savedPlans.length < 3 && (
                <button
                  id="create-new-plan-btn"
                  onClick={() => navigate('/generate-plan')}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'transparent',
                    border: '1.5px dashed rgba(52, 211, 153, 0.6)',
                    color: '#34D399',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    marginTop: 2,
                    textAlign: 'center',
                  }}
                >
                  ➕ Create New Plan ({savedPlans.length}/3)
                </button>
              )}
            </div>
          )}
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

            {/* ── Meal slot cards (Timeline View) ────────────────── */}
            <div style={{ position: 'relative', paddingLeft: 20, marginBottom: 24 }}>
              {/* Vertical Glowing Timeline Track Line */}
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
                {sortedMeals.map((meal, i) => {
                  const isLogged = todayLog?.meals?.some((m: any) => m.slot === meal.slot) ?? false;
                  return (
                    <div
                      key={meal.slot}
                      id={`meal-plan-${meal.slot.toLowerCase()}`}
                      style={{ position: 'relative' }}
                    >
                      {/* Glowing Timeline Node Dot */}
                      <div
                        style={{
                          position: 'absolute',
                          left: -20,
                          top: 20,
                          width: 14,
                          height: 14,
                          borderRadius: '50%',
                          backgroundColor: 'var(--bg-dark)',
                          border: `2.5px solid ${isLogged ? '#34D399' : 'var(--primary)'}`,
                          boxShadow: `0 0 8px ${isLogged ? 'rgba(52, 211, 153, 0.7)' : 'rgba(22, 163, 74, 0.5)'}`,
                          zIndex: 2,
                        }}
                      />

                      {/* Meal Card */}
                      <div
                        className="card animate-fade-up"
                        style={{ padding: 16, animationDelay: `${(i + 1) * 60}ms` }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div
                              style={{
                                width: 42,
                                height: 42,
                                borderRadius: 10,
                                backgroundColor: 'var(--primary-bg)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.25rem',
                              }}
                            >
                              {SLOT_EMOJIS[meal.slot] ?? '🍽️'}
                            </div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <p style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)', margin: 0 }}>
                                  {meal.slot}
                                </p>
                                <span
                                  style={{
                                    fontSize: '0.7rem',
                                    fontWeight: 600,
                                    color: 'var(--primary)',
                                    backgroundColor: 'var(--primary-bg)',
                                    padding: '2px 8px',
                                    borderRadius: 'var(--radius-full)',
                                  }}
                                >
                                  ⏰ {meal.time || (typeof SLOT_TIMES !== 'undefined' && SLOT_TIMES[meal.slot]) ? (meal.time || SLOT_TIMES[meal.slot]) : '12:00 PM'}
                                </span>
                              </div>
                              <p className="tabular-nums" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                                {Math.round(meal.totalCalories)} kcal · {Math.round(meal.totalProtein)}g P · {Math.round(meal.items.reduce((s: number, it: any) => s + ((it.food?.macros?.carbs_g ?? it.macros?.carbs ?? 0) * (it.loggedQty ?? 1)), 0))}g C · {Math.round(meal.items.reduce((s: number, it: any) => s + ((it.food?.macros?.fat_g ?? it.macros?.fat ?? 0) * (it.loggedQty ?? 1)), 0))}g F
                              </p>
                            </div>
                          </div>

                          <button
                            id={`log-slot-${meal.slot.toLowerCase()}`}
                            onClick={() => handleLogSlot(meal.slot, meal.items)}
                            title={isLogged ? "Logged (Click to re-log)" : "Log Slot"}
                            aria-label={isLogged ? "Logged" : "Log Slot"}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              backgroundColor: isLogged ? 'var(--primary)' : 'var(--primary-bg)',
                              color: isLogged ? '#FFFFFF' : 'var(--primary)',
                              fontSize: '1.05rem',
                              fontWeight: 700,
                              border: `1.5px solid ${isLogged ? 'var(--primary)' : 'rgba(22,163,74,0.3)'}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              flexShrink: 0,
                              transition: 'all 0.2s ease',
                            }}
                          >
                            {isLogged ? '✓' : '+'}
                          </button>
                        </div>

                      {/* Food items */}
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
                );
              })}
              </div>
            </div>

            {/* ── Actions row ──────────────────────────────────── */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              {selectedSavedPlan ? (
                <>
                  {currentActivePlan?._id !== selectedSavedPlan._id ? (
                    <button
                      className="btn-ghost"
                      style={{ flex: 1 }}
                      onClick={async () => {
                        const targetId = selectedSavedPlan._id || activeViewPlan;
                        const ok = await setActiveMealPlan(targetId);
                        if (ok) setSaveMsg('Plan activated!');
                        setTimeout(() => setSaveMsg(null), 2500);
                      }}
                    >
                      ⚡ Set Active
                    </button>
                  ) : (
                    <span
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--primary-bg)',
                        color: 'var(--primary)',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                      }}
                    >
                      Active Plan ✓
                    </span>
                  )}
                  <button
                    className="btn-ghost"
                    style={{ flex: 1, color: 'var(--color-red)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                    onClick={async () => {
                      const targetId = selectedSavedPlan._id || activeViewPlan;
                      const ok = await deleteMealPlan(targetId);
                      if (ok) {
                        const remaining = savedPlans.filter(p => p._id !== targetId);
                        setActiveViewPlan(remaining[0]?._id || '');
                        setSaveMsg('Plan deleted');
                        setTimeout(() => setSaveMsg(null), 2500);
                      }
                    }}
                  >
                    🗑️ Delete Plan
                  </button>
                </>
              ) : (
                <button className="btn-primary" style={{ flex: 1 }} onClick={() => navigate('/generate-plan')}>
                  ➕ Create New Plan
                </button>
              )}
            </div>

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
          /* Empty state when no meal plan is saved */
          <div className="card animate-fade-up" style={{ padding: '36px 20px', textAlign: 'center', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🍲</div>
            <h2 style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: 8 }}>
              No Active Meal Plan
            </h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.5, maxWidth: 360, margin: '0 auto 24px auto' }}>
              You haven't generated or saved a custom meal plan yet. Create your first plan based on your daily targets, waking hours, and dietary preferences!
            </p>
            <button
              className="btn-primary"
              onClick={() => navigate('/generate-plan')}
              style={{ width: '100%', padding: '14px 16px', fontSize: '0.95rem', fontWeight: 700 }}
            >
              ⚡ Generate Personalized Meal Plan
            </button>
          </div>
        )}

        {/* ── Generate New Plan sticky CTA (Only shown when plan exists) ─────────────────────── */}
        {displayPlan && (
          <div style={{ position: 'sticky', bottom: 100, paddingTop: 12 }}>
            <button
              id="generate-new-plan-btn"
              className="btn-primary"
              onClick={() => navigate('/generate-plan')}
            >
              🔄 Generate New Plan
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
