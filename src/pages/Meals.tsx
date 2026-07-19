import { useState, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useNutrition } from '../context/NutritionContext';
import { useUser } from '../context/UserContext';
import { VEGETARIAN_FOODS } from '../data/foodDatabase';
import { generateMealPlan } from '../engine/mealGenerator';
import type { RecommendedMeal, SmartAdjustment } from '../engine/mealGenerator';
import type { LoggedFood, FoodItem } from '../types/nutrition.types';
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

export default function Meals() {
  const { todayLog, logFood, removeFood } = useNutrition();
  const { currentUser, nutritionTargets, microRDA } = useUser();

  // Search & Log UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [logQty, setLogQty] = useState<number>(1);
  const [logSlot, setLogSlot] = useState<LoggedFood['slot']>('Breakfast');
  const [activeAccordion, setActiveAccordion] = useState<LoggedFood['slot'] | null>('Breakfast');

  // Generator State
  const [recommendations, setRecommendations] = useState<{ meals: RecommendedMeal[]; adjustments: SmartAdjustment[] } | null>(null);

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

  const handleTriggerMealPlan = () => {
    if (!nutritionTargets || !microRDA) return;

    const remainingCalories = Math.max((nutritionTargets.calories ?? 0) - dailyTotals.calories, 0);
    const remainingProtein = Math.max((nutritionTargets.protein_g ?? 0) - dailyTotals.protein, 0);
    const selectedSystems = (currentUser?.healthPriorities ?? []).map(p => PRIORITY_MAP[p]).filter(Boolean);

    const plan = generateMealPlan(
      remainingCalories,
      remainingProtein,
      microRDA,
      dailyTotals.micros,
      selectedSystems,
      currentUser?.dietaryRestrictions ?? []
    );

    setRecommendations(plan);
  };

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '100px' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.4rem' }}>Daily Planner</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: 2 }}>
          Log meals & optimize nutrition targets
        </p>
      </div>

      {/* ── Search and Log Widget ────────────────────────── */}
      <div className="premium-card" style={{ marginBottom: 16, position: 'relative' }}>
        <p className="section-label">Log Food Item</p>
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
      <p className="section-label" style={{ marginTop: 20 }}>Meal Slots</p>
      
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
                <div className="animate-fade-up" style={{ marginTop: 14, borderTop: '1px solid var(--divider)', paddingTop: 14 }}>
                  {slotMeals.length === 0 ? (
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '10px 0' }}>
                      No foods logged in this slot.
                    </p>
                  ) : (
                    slotMeals.map(meal => (
                      <div
                        key={meal.foodId}
                        style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          paddingBottom: 10, marginBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.03)'
                        }}
                      >
                        <div>
                          <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {meal.name}
                          </p>
                          <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                            {meal.loggedQty} serving{meal.loggedQty === 1 ? '' : 's'} ({Math.round(meal.baseQty * meal.loggedQty)}{meal.servingUnit})
                          </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <div style={{ textAlign: 'right' }}>
                            <p className="tabular-nums" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                              {meal.macros.calories} kcal
                            </p>
                            <p style={{ fontSize: '0.65rem', color: '#10B981' }}>
                              {meal.macros.protein}g protein
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveFood(slot, meal.foodId)}
                            aria-label={`Remove ${meal.name}`}
                            style={{
                              border: 'none', backgroundColor: 'transparent',
                              color: 'var(--error)', cursor: 'pointer', fontSize: '1.1rem',
                              padding: '4px'
                            }}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Meal Generator ───────────────────────────────── */}
      <button
        onClick={handleTriggerMealPlan}
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
          marginBottom: 16
        }}
      >
        ✨ Generate Custom Meal Recommendations
      </button>

      {recommendations && (
        <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Smart Adjustments */}
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

          {/* Recommendations list */}
          <p className="section-label">Recommended Dishes</p>
          {recommendations.meals.map(recMeal => (
            <div key={recMeal.slot} className="premium-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h4 style={{ fontSize: '0.85rem', color: '#3B82F6' }}>{recMeal.slot} Suggestion</h4>
                <div style={{ textAlign: 'right' }}>
                  <span className="tabular-nums" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    {recMeal.totalCalories} kcal
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginLeft: 8 }}>
                    ({recMeal.totalProtein}g protein)
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {recMeal.items.map(recItem => (
                  <div key={recItem.food.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', paddingBottom: 6, borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <div>
                      <span style={{ fontWeight: 600 }}>{recItem.food.name}</span>
                      <span style={{ color: 'var(--text-secondary)', marginLeft: 6 }}>
                        · {recItem.loggedQty} serving{recItem.loggedQty === 1 ? '' : 's'} ({Math.round(recItem.food.baseQty * recItem.loggedQty)}{recItem.food.servingUnit})
                      </span>
                    </div>
                    <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.72rem' }}>
                      {recItem.reason}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Nav */}
      <nav className="bottom-nav" aria-label="Main navigation">
        <NavLink to="/dashboard" id="meals-nav-home">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Home
        </NavLink>
        <NavLink to="/meals" id="meals-nav-meals">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
            <path d="M12 8v4l3 3"/>
          </svg>
          Meals
        </NavLink>
        <NavLink to="/insights" id="meals-nav-insights">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          Insights
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
