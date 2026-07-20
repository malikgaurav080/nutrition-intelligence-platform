import { useState, useMemo, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useNutrition } from '../context/NutritionContext';
import { useUser } from '../context/UserContext';
import { VEGETARIAN_FOODS } from '../data/foodDatabase';
import { generateMealPlan } from '../engine/mealGenerator';
import type { RecommendedMeal, SmartAdjustment } from '../engine/mealGenerator';
import type { LoggedFood, FoodItem, SavedMealPlan } from '../types/nutrition.types';
import type { HealthSystem } from '../engine/healthScore';

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

const SLOTS: LoggedFood['slot'][] = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

const CATEGORY_LABELS: Record<string, string> = {
  proteins_dairy: 'Proteins & Dairy',
  grains_legumes: 'Grains & Legumes',
  seeds_nuts: 'Seeds & Nuts',
  vegetables: 'Vegetables',
  fruits: 'Fruits'
};

export default function Meals() {
  const { 
    todayLog, 
    logFood, 
    removeFood, 
    savedPlans, 
    activePlan, 
    saveMealPlan, 
    setActiveMealPlan, 
    deleteMealPlan, 
    logSlotFromPlan 
  } = useNutrition();

  const { currentUser, nutritionTargets, microRDA } = useUser();

  // Search & Log UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [logQty, setLogQty] = useState<number>(1);
  const [logSlot, setLogSlot] = useState<LoggedFood['slot']>('Breakfast');
  const [activeAccordion, setActiveAccordion] = useState<LoggedFood['slot'] | null>('Breakfast');

  // Generator State
  const [planOffset, setPlanOffset] = useState<number>(0);
  const [recommendations, setRecommendations] = useState<{ meals: RecommendedMeal[]; adjustments: SmartAdjustment[]; planDeficiencies: string[] } | null>(null);

  // Customizable Target Filters (only allowed/excluded ingredients)
  const [allowedIngredients, setAllowedIngredients] = useState<string[]>([]);
  const [excludedIngredients, setExcludedIngredients] = useState<string[]>([]);
  const [ingSearch, setIngSearch] = useState<string>('');

  // Active viewed tab state: 'generator' or dynamic ID of saved meal plan
  const [activeTab, setActiveTab] = useState<string>('generator');

  // Stored plan currently being viewed and customized
  const [viewedPlan, setViewedPlan] = useState<SavedMealPlan | null>(null);

  // Save plan form state
  const [newPlanName, setNewPlanName] = useState<string>('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showOverwriteSelect, setShowOverwriteSelect] = useState<boolean>(false);
  const [planListToOverwrite, setPlanListToOverwrite] = useState<{ id: string; name: string }[]>([]);

  // Clone viewed plan details when activeTab changes
  useEffect(() => {
    if (activeTab === 'generator') {
      setViewedPlan(null);
    } else {
      const plan = savedPlans.find(p => p._id === activeTab);
      setViewedPlan(plan ? JSON.parse(JSON.stringify(plan)) : null);
    }
  }, [activeTab, savedPlans]);

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

  // Exclude already logged foods from search list, and search query match
  const filteredSearchFoods = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return VEGETARIAN_FOODS.filter(food =>
      food.name.toLowerCase().includes(query)
    ).slice(0, 5);
  }, [searchQuery]);

  // Filter 44 ingredients search
  const filteredIngCandidates = useMemo(() => {
    return VEGETARIAN_FOODS.filter(f => f.name.toLowerCase().includes(ingSearch.toLowerCase()));
  }, [ingSearch]);

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    setLogQty(1);
    setSearchQuery('');
  };

  const handleLogFood = async () => {
    if (!selectedFood) return;
    const success = await logFood(logSlot, selectedFood.id, logQty);
    if (success) {
      setSelectedFood(null);
      setRecommendations(null); // invalidate cached suggestions
    }
  };

  const handleRemoveFood = async (slot: LoggedFood['slot'], foodId: string) => {
    const success = await removeFood(slot, foodId);
    if (success) {
      setRecommendations(null); // invalidate cached suggestions
    }
  };

  // Triggers recommendations using user targets calculated from settings profile
  const handleTriggerMealPlan = (offsetVal = planOffset) => {
    if (!nutritionTargets || !microRDA) return;

    // Daily targets are remaining profile limits (anchored to dashboard targets)
    const remainingCalories = Math.max((nutritionTargets.calories ?? 0) - dailyTotals.calories, 0);
    const remainingProtein = Math.max((nutritionTargets.protein_g ?? 0) - dailyTotals.protein, 0);
    const selectedSystems = (currentUser?.healthPriorities ?? []).map(p => PRIORITY_MAP[p]).filter(Boolean);

    const plan = generateMealPlan(
      remainingCalories,
      remainingProtein,
      microRDA,
      dailyTotals.micros,
      selectedSystems,
      allowedIngredients,
      excludedIngredients,
      currentUser?.dietaryRestrictions ?? [],
      offsetVal
    );

    setRecommendations(plan);
    setActiveTab('generator');
  };

  const handleRegenerateMealPlan = () => {
    const nextOffset = planOffset + 1;
    setPlanOffset(nextOffset);
    handleTriggerMealPlan(nextOffset);
  };

  // Adjusts serving sizes (+/-) of suggested items inline in the recommendation list
  const handleAdjustQuantity = (slot: LoggedFood['slot'], foodId: string, delta: number) => {
    if (activeTab === 'generator') {
      if (!recommendations) return;

      const updatedMeals = recommendations.meals.map(m => {
        if (m.slot !== slot) return m;

        const updatedItems = m.items.map(item => {
          if (item.food.id !== foodId) return item;
          const newQty = Math.max(parseFloat((item.loggedQty + delta).toFixed(1)), 0.1);
          return { ...item, loggedQty: newQty };
        });

        const totalCalories = Math.round(updatedItems.reduce((sum, item) => sum + item.food.macros.calories * item.loggedQty, 0));
        const totalProtein = Math.round(updatedItems.reduce((sum, item) => sum + item.food.macros.protein * item.loggedQty, 0));

        return { ...m, items: updatedItems, totalCalories, totalProtein };
      });

      setRecommendations({
        ...recommendations,
        meals: updatedMeals
      });
    } else {
      if (!viewedPlan) return;

      const updatedMeals = viewedPlan.meals.map(m => {
        if (m.slot !== slot) return m;

        const updatedItems = m.items.map(item => {
          if (item.foodId !== foodId) return item;
          const newQty = Math.max(parseFloat((item.loggedQty + delta).toFixed(1)), 0.1);
          return { ...item, loggedQty: newQty };
        });

        const totalCalories = Math.round(updatedItems.reduce((sum, item) => sum + item.macros.calories * item.loggedQty, 0));
        const totalProtein = Math.round(updatedItems.reduce((sum, item) => sum + item.macros.protein * item.loggedQty, 0));

        return { ...m, items: updatedItems, totalCalories, totalProtein };
      });

      setViewedPlan({
        ...viewedPlan,
        meals: updatedMeals
      });
    }
  };

  // Log single slot option from viewed plan (generator or active/saved)
  const handleLogSlotFromPlan = async (slot: LoggedFood['slot'], items: any[]) => {
    const success = await logSlotFromPlan(slot, items);
    if (success) {
      setActiveAccordion(slot);
    }
  };

  // Save the currently generated recommendation as a diet plan
  const handleSavePlan = async (overwriteId?: string) => {
    if (!recommendations) return;
    if (!newPlanName.trim()) {
      setSaveError('Please enter a name for the plan');
      return;
    }

    setSaveError(null);

    const flattenedMeals = recommendations.meals.map(recMeal => ({
      slot: recMeal.slot,
      totalCalories: recMeal.totalCalories,
      totalProtein: recMeal.totalProtein,
      items: recMeal.items.map(item => ({
        foodId: item.food.id,
        name: item.food.name,
        servingSize: item.food.servingSize,
        servingUnit: item.food.servingUnit,
        baseQty: item.food.baseQty,
        loggedQty: item.loggedQty,
        reason: item.reason || 'Recommended item',
        macros: {
          calories: Math.round(item.food.macros.calories * item.loggedQty),
          protein: Math.round(item.food.macros.protein * item.loggedQty * 10) / 10,
          carbs: Math.round(item.food.macros.carbs * item.loggedQty * 10) / 10,
          fat: Math.round(item.food.macros.fat * item.loggedQty * 10) / 10,
          fiber: Math.round(item.food.macros.fiber * item.loggedQty * 10) / 10,
        },
        micros: {
          vitA: Math.round((item.food.micros.vitA || 0) * item.loggedQty * 10) / 10,
          vitC: Math.round((item.food.micros.vitC || 0) * item.loggedQty * 10) / 10,
          vitD: Math.round((item.food.micros.vitD || 0) * item.loggedQty * 10) / 10,
          vitE: Math.round((item.food.micros.vitE || 0) * item.loggedQty * 10) / 10,
          vitB12: Math.round((item.food.micros.vitB12 || 0) * item.loggedQty * 10) / 10,
          calcium: Math.round((item.food.micros.calcium || 0) * item.loggedQty * 10) / 10,
          iron: Math.round((item.food.micros.iron || 0) * item.loggedQty * 10) / 10,
          zinc: Math.round((item.food.micros.zinc || 0) * item.loggedQty * 10) / 10,
          magnesium: Math.round((item.food.micros.magnesium || 0) * item.loggedQty * 10) / 10,
          potassium: Math.round((item.food.micros.potassium || 0) * item.loggedQty * 10) / 10,
          folate: Math.round((item.food.micros.folate || 0) * item.loggedQty * 10) / 10,
          omega3: Math.round((item.food.micros.omega3 || 0) * item.loggedQty * 10) / 10,
        }
      }))
    }));

    const result = await saveMealPlan(
      newPlanName,
      flattenedMeals,
      recommendations.planDeficiencies,
      recommendations.adjustments,
      overwriteId
    );

    if (result.success) {
      setNewPlanName('');
      setShowOverwriteSelect(false);
      setPlanListToOverwrite([]);
      setActiveTab('generator');
    } else {
      if (result.existingPlans) {
        setShowOverwriteSelect(true);
        setPlanListToOverwrite(result.existingPlans);
      } else {
        setSaveError(result.error || 'Failed to save plan');
      }
    }
  };

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '100px' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.4rem' }}>Intelligent Diet Planner</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: 2 }}>
          Configure customizable meal plans and track logs
        </p>
      </div>

      {/* ── Active Diet Plan Banner (PRD 7.6) ──────────────── */}
      {activePlan ? (
        <div className="premium-card score-indigo-bg" style={{ marginBottom: 16, border: '1px solid rgba(99, 102, 241, 0.4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '0.65rem', color: '#6366F1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                🌟 Active Diet Plan
              </p>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '4px 0 2px 0' }}>{activePlan.name}</h2>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                You can create up to 3 meal plans and switch here.
              </p>
            </div>
            <span style={{ fontSize: '0.75rem', backgroundColor: '#6366F1', color: 'white', padding: '4px 8px', borderRadius: 4, fontWeight: 700 }}>
              Active
            </span>
          </div>
        </div>
      ) : (
        <div className="premium-card score-indigo-bg" style={{ marginBottom: 16, border: '1px dashed rgba(99, 102, 241, 0.4)' }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, textAlign: 'center' }}>
            No active diet plan saved yet. Customize filters and generate one below!
          </p>
        </div>
      )}

      {/* ── Meal History / Switcher Tab Controls ────────────────── */}
      {savedPlans.length > 0 && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
          {activeTab !== 'generator' && (
            <button
              onClick={() => setActiveTab('generator')}
              style={{
                whiteSpace: 'nowrap',
                padding: '8px 12px',
                borderRadius: 6,
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--divider)',
                color: 'var(--text-secondary)',
              }}
            >
              ✨ Customize New Plan
            </button>
          )}
          {savedPlans.map((plan) => (
            <button
              key={plan._id}
              onClick={() => setActiveTab(plan._id || '')}
              style={{
                whiteSpace: 'nowrap',
                padding: '8px 12px',
                borderRadius: 6,
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: activeTab === plan._id ? '#6366F1' : 'rgba(255,255,255,0.03)',
                border: activeTab === plan._id ? 'none' : '1px solid var(--divider)',
                color: activeTab === plan._id ? 'white' : 'var(--text-secondary)',
              }}
            >
              📋 {plan.name} {plan.isActive ? '(Active)' : ''}
            </button>
          ))}
        </div>
      )}

      {/* ── Tab Content: Saved Meal Plan details ──────────────── */}
      {activeTab !== 'generator' && viewedPlan && (
        <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
          {/* Stored Plan Actions Banner */}
          <div className="premium-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>{viewedPlan.name} Settings</h3>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                {viewedPlan.isActive ? 'This plan is currently active.' : 'Activate this plan to track matches.'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {!viewedPlan.isActive && (
                <button
                  onClick={() => setActiveMealPlan(viewedPlan._id || '')}
                  style={{
                    backgroundColor: '#6366F1',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: 4,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Activate
                </button>
              )}
              <button
                onClick={() => {
                  deleteMealPlan(viewedPlan._id || '');
                  setActiveTab('generator');
                }}
                style={{
                  backgroundColor: 'transparent',
                  color: '#EF4444',
                  border: '1px solid #EF4444',
                  padding: '6px 12px',
                  borderRadius: 4,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
          </div>

          {/* Viewed Plan Deficiency audit display */}
          {viewedPlan.planDeficiencies && viewedPlan.planDeficiencies.length > 0 && (
            <div className="premium-card score-amber-bg" style={{ border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              <p className="section-label" style={{ color: 'var(--warning)' }}>Audited Deficiencies in {viewedPlan.name}</p>
              <ul style={{ paddingLeft: 16, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {viewedPlan.planDeficiencies.map((def, i) => (
                  <li key={i} style={{ fontSize: '0.78rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    ⚠️ {def}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Stored Plan Suggested meals list with individual log buttons */}
          <p className="section-label">Recommended Dishes</p>
          {viewedPlan.meals.map(recMeal => (
            <div key={recMeal.slot} className="premium-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: '#3B82F6', fontWeight: 700 }}>{recMeal.slot}</h4>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                    {recMeal.totalCalories} kcal ({recMeal.totalProtein}g protein)
                  </span>
                </div>
                <button
                  onClick={() => handleLogSlotFromPlan(recMeal.slot, recMeal.items)}
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: 4,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(16, 185, 129, 0.2)'
                  }}
                >
                  Log {recMeal.slot} Option
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recMeal.items.map((recItem: any) => (
                  <div key={recItem.foodId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', paddingBottom: 6, borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <div>
                      <span style={{ fontWeight: 600 }}>{recItem.name}</span>
                      <span style={{ color: 'var(--text-secondary)', marginLeft: 6 }}>
                        · {recItem.loggedQty} serving{recItem.loggedQty === 1 ? '' : 's'} ({Math.round(recItem.baseQty * recItem.loggedQty)}{recItem.servingUnit})
                      </span>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        {Math.round(recItem.macros.calories)} kcal · {Math.round(recItem.macros.protein)}g protein
                      </p>
                    </div>
                    
                    {/* Inline Portion Adjustment for Stored Plan */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button
                        onClick={() => handleAdjustQuantity(recMeal.slot, recItem.foodId, -0.1)}
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--divider)',
                          color: 'var(--text-primary)', padding: '2px 8px', borderRadius: 4, cursor: 'pointer',
                          fontWeight: 700, fontSize: '0.75rem'
                        }}
                      >
                        -
                      </button>
                      <span className="tabular-nums" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                        {recItem.loggedQty.toFixed(1)}
                      </span>
                      <button
                        onClick={() => handleAdjustQuantity(recMeal.slot, recItem.foodId, 0.1)}
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--divider)',
                          color: 'var(--text-primary)', padding: '2px 8px', borderRadius: 4, cursor: 'pointer',
                          fontWeight: 700, fontSize: '0.75rem'
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Tab Content: Plan Generator ─────────────────────────── */}
      {activeTab === 'generator' && (
        <div style={{ marginBottom: 24 }}>
          {/* Customizer Filters Panel */}
          <div className="premium-card" style={{ marginBottom: 16 }}>
            <p className="section-label" style={{ color: 'var(--primary)', marginBottom: 12 }}>Meal Customizer & Live Filters</p>
            
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.3 }}>
              Daily nutrition limits are locked to your profile targets: 
              <strong> {nutritionTargets?.calories ?? 2000} kcal</strong> and 
              <strong> {nutritionTargets?.protein_g ?? 60}g Protein</strong>. 
              Portion sizes of suggested dishes can be customized inline below.
            </p>

            {/* Allowed & Excluded ingredients toggle widget */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                Prioritize / Exclude specific ingredients (Live Filters)
              </label>
              <input
                type="text"
                placeholder="Filter ingredients list by name..."
                value={ingSearch}
                onChange={(e) => setIngSearch(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-dark)',
                  border: '1px solid var(--divider)',
                  color: 'var(--text-primary)',
                  padding: '8px 10px',
                  borderRadius: 6,
                  fontSize: '0.78rem',
                  outline: 'none',
                  marginBottom: 8
                }}
              />

              <div style={{ 
                maxHeight: 220, 
                overflowY: 'auto', 
                border: '1px solid var(--divider)', 
                borderRadius: 8, 
                padding: '8px 12px', 
                backgroundColor: 'var(--bg-dark)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}>
                {(Object.keys(CATEGORY_LABELS) as Array<keyof typeof CATEGORY_LABELS>).map(catKey => {
                  const catFoods = filteredIngCandidates.filter(f => f.category === catKey);
                  if (catFoods.length === 0) return null;

                  return (
                    <div key={catKey} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <p style={{ 
                        fontSize: '0.72rem', 
                        color: '#6366F1', 
                        fontWeight: 700, 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.05em',
                        borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
                        paddingBottom: 4,
                        margin: '4px 0 2px 0'
                      }}>
                        {CATEGORY_LABELS[catKey]}
                      </p>
                      {catFoods.map(food => {
                        const isAllowed = allowedIngredients.includes(food.id);
                        const isExcluded = excludedIngredients.includes(food.id);

                        return (
                          <div key={food.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)' }}>{food.name}</span>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button
                                onClick={() => {
                                  if (isAllowed) {
                                    setAllowedIngredients(prev => prev.filter(id => id !== food.id));
                                  } else {
                                    setAllowedIngredients(prev => [...prev, food.id]);
                                    setExcludedIngredients(prev => prev.filter(id => id !== food.id));
                                  }
                                }}
                                style={{
                                  fontSize: '0.62rem', padding: '2px 6px', borderRadius: 4, cursor: 'pointer',
                                  backgroundColor: isAllowed ? 'rgba(16,185,129,0.2)' : 'transparent',
                                  border: `1px solid ${isAllowed ? '#10B981' : 'var(--divider)'}`,
                                  color: isAllowed ? '#10B981' : 'var(--text-secondary)'
                                }}
                              >
                                Prioritize
                              </button>
                              <button
                                onClick={() => {
                                  if (isExcluded) {
                                    setExcludedIngredients(prev => prev.filter(id => id !== food.id));
                                  } else {
                                    setExcludedIngredients(prev => [...prev, food.id]);
                                    setAllowedIngredients(prev => prev.filter(id => id !== food.id));
                                  }
                                }}
                                style={{
                                  fontSize: '0.62rem', padding: '2px 6px', borderRadius: 4, cursor: 'pointer',
                                  backgroundColor: isExcluded ? 'rgba(239,68,68,0.2)' : 'transparent',
                                  border: `1px solid ${isExcluded ? '#EF4444' : 'var(--divider)'}`,
                                  color: isExcluded ? '#EF4444' : 'var(--text-secondary)'
                                }}
                              >
                                Exclude
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => handleTriggerMealPlan(0)}
              style={{
                width: '100%',
                backgroundColor: '#3B82F6',
                color: 'white',
                border: 'none',
                padding: '12px 0',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.9rem',
                boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
              }}
            >
              ✨ Generate / Update Meal Plan
            </button>
          </div>

          {/* Generated plan results */}
          {recommendations && (
            <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Overwrite or Save custom plan form */}
              <div className="premium-card">
                <p className="section-label">Save as Custom Diet Plan (Max 3 Allowed)</p>
                {saveError && (
                  <p style={{ color: '#EF4444', fontSize: '0.75rem', marginBottom: 8 }}>{saveError}</p>
                )}

                {showOverwriteSelect ? (
                  <div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                      Choose an existing plan to overwrite:
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {planListToOverwrite.map(plan => (
                        <button
                          key={plan.id}
                          onClick={() => handleSavePlan(plan.id)}
                          style={{
                            textAlign: 'left',
                            padding: '10px 14px',
                            backgroundColor: 'rgba(255,255,255,0.03)',
                            border: '1px solid var(--divider)',
                            color: 'var(--text-primary)',
                            borderRadius: 6,
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            fontWeight: 600
                          }}
                        >
                          Overwrite "{plan.name}"
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          setShowOverwriteSelect(false);
                          setPlanListToOverwrite([]);
                        }}
                        style={{
                          backgroundColor: 'transparent',
                          color: 'var(--text-secondary)',
                          border: 'none',
                          padding: '6px 0',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          marginTop: 6
                        }}
                      >
                        Cancel Overwrite
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      placeholder="E.g., High Protein Plan, Slimming Plan..."
                      value={newPlanName}
                      onChange={(e) => setNewPlanName(e.target.value)}
                      style={{
                        flex: 1,
                        backgroundColor: 'var(--bg-dark)',
                        border: '1px solid var(--divider)',
                        color: 'var(--text-primary)',
                        padding: '10px 14px',
                        borderRadius: 8,
                        fontSize: '0.85rem',
                        outline: 'none',
                      }}
                    />
                    <button
                      onClick={() => handleSavePlan()}
                      style={{
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        padding: '0 20px',
                        borderRadius: 8,
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                      }}
                    >
                      Save Plan
                    </button>
                  </div>
                )}
              </div>

              {/* Suggest New Plan (Shuffles offset) */}
              <button
                onClick={handleRegenerateMealPlan}
                style={{
                  width: '100%',
                  backgroundColor: 'transparent',
                  color: '#3B82F6',
                  border: '1px solid #3B82F6',
                  padding: '10px 0',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                }}
              >
                🔄 Suggest New Diet Plan (Regenerate alternative)
              </button>

              {/* Smart Deficit Adjustments */}
              <div className="premium-card score-indigo-bg" style={{ border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                <p className="section-label" style={{ color: '#6366F1' }}>Smart Deficit Adjustments</p>
                <ul style={{ paddingLeft: 16, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {recommendations.adjustments.map((adj, i) => (
                    <li key={i} style={{ fontSize: '0.78rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                      {adj.text}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Plan Deficit Audit Analysis */}
              {recommendations.planDeficiencies.length > 0 && (
                <div className="premium-card score-amber-bg" style={{ border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                  <p className="section-label" style={{ color: 'var(--warning)' }}>Audited Deficiencies in Recommended Plan</p>
                  <ul style={{ paddingLeft: 16, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {recommendations.planDeficiencies.map((def, i) => (
                      <li key={i} style={{ fontSize: '0.78rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                        ⚠️ {def}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations list with slot finalize logging buttons */}
              <p className="section-label">Recommended Dishes</p>
              {recommendations.meals.map(recMeal => (
                <div key={recMeal.slot} className="premium-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div>
                      <h4 style={{ fontSize: '0.85rem', color: '#3B82F6', fontWeight: 700 }}>{recMeal.slot} Suggestion</h4>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        {recMeal.totalCalories} kcal ({recMeal.totalProtein}g protein)
                      </span>
                    </div>
                    <button
                      onClick={() => handleLogSlotFromPlan(recMeal.slot, recMeal.items.map(item => ({
                        foodId: item.food.id,
                        name: item.food.name,
                        servingSize: item.food.servingSize,
                        servingUnit: item.food.servingUnit,
                        baseQty: item.food.baseQty,
                        loggedQty: item.loggedQty,
                        macros: {
                          calories: Math.round(item.food.macros.calories * item.loggedQty),
                          protein: Math.round(item.food.macros.protein * item.loggedQty * 10) / 10,
                          carbs: Math.round(item.food.macros.carbs * item.loggedQty * 10) / 10,
                          fat: Math.round(item.food.macros.fat * item.loggedQty * 10) / 10,
                          fiber: Math.round(item.food.macros.fiber * item.loggedQty * 10) / 10,
                        },
                        micros: {
                          vitA: Math.round(item.food.micros.vitA * item.loggedQty * 10) / 10,
                          vitC: Math.round(item.food.micros.vitC * item.loggedQty * 10) / 10,
                          vitD: Math.round(item.food.micros.vitD * item.loggedQty * 10) / 10,
                          vitE: Math.round(item.food.micros.vitE * item.loggedQty * 10) / 10,
                          vitB12: Math.round(item.food.micros.vitB12 * item.loggedQty * 10) / 10,
                          calcium: Math.round(item.food.micros.calcium * item.loggedQty * 10) / 10,
                          iron: Math.round(item.food.micros.iron * item.loggedQty * 10) / 10,
                          zinc: Math.round(item.food.micros.zinc * item.loggedQty * 10) / 10,
                          magnesium: Math.round(item.food.micros.magnesium * item.loggedQty * 10) / 10,
                          potassium: Math.round(item.food.micros.potassium * item.loggedQty * 10) / 10,
                          folate: Math.round(item.food.micros.folate * item.loggedQty * 10) / 10,
                          omega3: Math.round(item.food.micros.omega3 * item.loggedQty * 10) / 10,
                        }
                      })))}
                      style={{
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: 4,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(16, 185, 129, 0.2)'
                      }}
                    >
                      Log {recMeal.slot} Option
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {recMeal.items.map(recItem => (
                      <div key={recItem.food.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', paddingBottom: 6, borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                        <div>
                          <span style={{ fontWeight: 600 }}>{recItem.food.name}</span>
                          <span style={{ color: 'var(--text-secondary)', marginLeft: 6 }}>
                            · {recItem.loggedQty} serving{recItem.loggedQty === 1 ? '' : 's'} ({Math.round(recItem.food.baseQty * recItem.loggedQty)}{recItem.food.servingUnit})
                          </span>
                          <p style={{ margin: '2px 0 0 0', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                            {Math.round(recItem.food.macros.calories * recItem.loggedQty)} kcal · {Math.round(recItem.food.macros.protein * recItem.loggedQty)}g protein
                          </p>
                        </div>
                        
                        {/* Inline Portion Adjustment for Generator Recommendations */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <button
                            onClick={() => handleAdjustQuantity(recMeal.slot, recItem.food.id, -0.1)}
                            style={{
                              backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--divider)',
                              color: 'var(--text-primary)', padding: '2px 8px', borderRadius: 4, cursor: 'pointer',
                              fontWeight: 700, fontSize: '0.75rem'
                            }}
                          >
                            -
                          </button>
                          <span className="tabular-nums" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                            {recItem.loggedQty.toFixed(1)}
                          </span>
                          <button
                            onClick={() => handleAdjustQuantity(recMeal.slot, recItem.food.id, 0.1)}
                            style={{
                              backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--divider)',
                              color: 'var(--text-primary)', padding: '2px 8px', borderRadius: 4, cursor: 'pointer',
                              fontWeight: 700, fontSize: '0.75rem'
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Search and Log Widget ────────────────────────── */}
      <div className="premium-card" style={{ marginBottom: 16, position: 'relative' }}>
        <p className="section-label">Log Food Item manually</p>
        <div style={{ position: 'relative' }}>
          <input
            id="food-search-input"
            type="text"
            placeholder="Search 44 vegetarian foods (e.g. Tofu, Oats, Paneer...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: 'var(--bg-dark)',
              border: '1px solid var(--divider)',
              color: 'var(--text-primary)',
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: '0.85rem',
              outline: 'none',
            }}
          />
          
          {/* Autocomplete dropdown */}
          {filteredSearchFoods.length > 0 && (
            <div style={{
              position: 'absolute', top: '105%', left: 0, right: 0,
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--divider)',
              borderRadius: 8,
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              zIndex: 50,
              maxHeight: 200,
              overflowY: 'auto'
            }}>
              {filteredSearchFoods.map(food => (
                <button
                  key={food.id}
                  onClick={() => handleSelectFood(food)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '10px 14px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    borderBottom: '1px solid var(--divider)',
                  }}
                >
                  {food.name} <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>({food.servingSize})</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected food serving calculator */}
        {selectedFood && (
          <div className="animate-fade-up" style={{ marginTop: 14, borderTop: '1px solid var(--divider)', paddingTop: 14 }}>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary)', marginBottom: 8 }}>
              {selectedFood.name}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Servings Multiplier
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={logQty}
                  onChange={(e) => setLogQty(Math.max(parseFloat(e.target.value) || 0.1, 0.1))}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-dark)',
                    border: '1px solid var(--divider)',
                    color: 'var(--text-primary)',
                    padding: '8px 10px',
                    borderRadius: 6,
                    fontSize: '0.85rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Meal Slot
                </label>
                <select
                  value={logSlot}
                  onChange={(e) => setLogSlot(e.target.value as LoggedFood['slot'])}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-dark)',
                    border: '1px solid var(--divider)',
                    color: 'var(--text-primary)',
                    padding: '8px 10px',
                    borderRadius: 6,
                    fontSize: '0.85rem',
                  }}
                >
                  {SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Preview macros */}
            <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.03)', padding: 10, borderRadius: 6, marginBottom: 12 }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {Math.round(selectedFood.macros.calories * logQty)}
                </p>
                <p style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>kcal</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#10B981' }}>
                  {(selectedFood.macros.protein * logQty).toFixed(1)}g
                </p>
                <p style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>protein</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3B82F6' }}>
                  {(selectedFood.macros.carbs * logQty).toFixed(1)}g
                </p>
                <p style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>carbs</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#F59E0B' }}>
                  {(selectedFood.macros.fat * logQty).toFixed(1)}g
                </p>
                <p style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>fat</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleLogFood}
                style={{
                  flex: 1,
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  padding: '8px 0',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                }}
              >
                Log to {logSlot}
              </button>
              <button
                onClick={() => setSelectedFood(null)}
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--divider)',
                  padding: '8px 16px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Meal Slots Accordion ─────────────────────────── */}
      <p className="section-label" style={{ marginTop: 20 }}>Meal Slots (Today's Logs)</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        {SLOTS.map(slot => {
          const slotMeals = todayLog.meals.filter(m => m.slot === slot);
          const slotCalories = slotMeals.reduce((sum, m) => sum + m.macros.calories, 0);
          const isExpanded = activeAccordion === slot;

          return (
            <div key={slot} className="premium-card" style={{ padding: '14px 16px' }}>
              <div
                onClick={() => setActiveAccordion(isExpanded ? null : slot)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              >
                <div>
                  <h3 style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{slot}</h3>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                    {slotMeals.length} item{slotMeals.length === 1 ? '' : 's'} logged
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="tabular-nums" style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>
                    {slotCalories} kcal
                  </span>
                  <span style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    ▶
                  </span>
                </div>
              </div>

              {isExpanded && (
                <div style={{ marginTop: 12, borderTop: '1px solid var(--divider)', paddingTop: 10 }}>
                  {slotMeals.length === 0 ? (
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', margin: '8px 0' }}>
                      No food items logged for {slot}
                    </p>
                  ) : (
                    slotMeals.map(mealItem => (
                      <div
                        key={mealItem.foodId}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 0',
                          borderBottom: '1px solid rgba(255,255,255,0.02)'
                        }}
                      >
                        <div>
                          <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>{mealItem.name}</p>
                          <p style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                            {mealItem.loggedQty} serving{mealItem.loggedQty === 1 ? '' : 's'} ({Math.round(mealItem.baseQty * mealItem.loggedQty)}{mealItem.servingUnit})
                            <span style={{ marginLeft: 8, color: 'var(--primary)' }}>
                              · {mealItem.macros.calories} kcal · {mealItem.macros.protein}g protein
                            </span>
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveFood(slot, mealItem.foodId)}
                          style={{
                            backgroundColor: 'transparent',
                            color: '#EF4444',
                            border: 'none',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            padding: '4px 8px'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Nav */}
      <nav className="bottom-nav" aria-label="Main navigation">
        <NavLink to="/dashboard" id="meals-nav-home">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Home
        </NavLink>
        <NavLink to="/insights" id="meals-nav-insights">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          Insights
        </NavLink>
        <NavLink to="/health" id="meals-nav-health">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
          </svg>
          Health
        </NavLink>
        <NavLink to="/meals" id="meals-nav-meals">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
            <path d="M12 8v4l3 3"/>
          </svg>
          Meals
        </NavLink>
        <NavLink to="/profile" id="meals-nav-profile">
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
