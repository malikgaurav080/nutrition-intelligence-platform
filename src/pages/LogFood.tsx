import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNutrition } from '../context/NutritionContext';
import { VEGETARIAN_FOODS } from '../data/foodDatabase';
import type { FoodItem, LoggedFood } from '../types/nutrition.types';
import AppHeader from '../components/layout/AppHeader';
import BottomNav from '../components/layout/BottomNav';

type FilterCategory = 'All' | 'My Foods' | 'Recipes' | 'Scan';

const SLOTS: LoggedFood['slot'][] = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

/**
 * Quick-add items shown by default (most commonly logged foods from PRD spec).
 */
const QUICK_ADD_IDS = ['oats', 'banana', 'almonds'];

/**
 * Screen 7 — Add Meal / Food Logger
 * PRD Section 7.6, ui-screens-spec.md Screen 7:
 * Search bar + filter pills + quick add list + log to slot.
 * All logging wired to NutritionContext.logFood → /api/logs/food (backend API).
 */
export default function LogFood() {
  const { logFood, loading } = useNutrition();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<FilterCategory>('All');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<LoggedFood['slot']>('Breakfast');
  const [qty, setQty] = useState(1);
  const [logMessage, setLogMessage] = useState<string | null>(null);
  const [logError, setLogError] = useState<string | null>(null);

  // ── Search results ─────────────────────────────────────────────────────
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return VEGETARIAN_FOODS.filter(f => f.name.toLowerCase().includes(q)).slice(0, 8);
  }, [searchQuery]);

  // ── Quick add list (defaults) ──────────────────────────────────────────
  const quickAddFoods = useMemo(() => {
    const found = QUICK_ADD_IDS
      .map(id => VEGETARIAN_FOODS.find(f => f.id === id || f.name.toLowerCase().includes(id)))
      .filter(Boolean) as FoodItem[];
    // Fill remaining slots if not found
    if (found.length < 4) {
      const extras = VEGETARIAN_FOODS
        .filter(f => !found.includes(f))
        .slice(0, 4 - found.length);
      found.push(...extras);
    }
    return found.slice(0, 4);
  }, []);

  const displayFoods = searchQuery ? searchResults : quickAddFoods;

  // ── Log food via backend API ───────────────────────────────────────────
  const handleLog = async (food: FoodItem, logQty = 1, slot = selectedSlot) => {
    const success = await logFood(slot, food.id, logQty);
    if (success) {
      setLogMessage(`${food.name} logged to ${slot}!`);
      setSelectedFood(null);
      setSearchQuery('');
      setTimeout(() => setLogMessage(null), 2500);
    } else {
      setLogError('Failed to log. Please try again.');
      setTimeout(() => setLogError(null), 2500);
    }
  };

  const handleQuickAdd = (food: FoodItem) => {
    handleLog(food, 1, selectedSlot);
  };

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
            Add Meal
          </h1>
        }
        right={
          <button aria-label="Share" style={{ color: 'var(--text-secondary)', display: 'flex' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </button>
        }
      />

      <div className="page-content">
        {/* ── Slot selector ────────────────────────────────────── */}
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 8 }}>Log to meal slot:</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {SLOTS.map(slot => (
              <button
                key={slot}
                id={`slot-btn-${slot.toLowerCase()}`}
                onClick={() => setSelectedSlot(slot)}
                style={{
                  flex: 1,
                  padding: '7px 4px',
                  borderRadius: 'var(--radius-md)',
                  border: `1.5px solid ${selectedSlot === slot ? 'var(--primary)' : 'var(--border)'}`,
                  backgroundColor: selectedSlot === slot ? 'var(--primary-bg)' : 'var(--bg-card)',
                  color: selectedSlot === slot ? 'var(--primary)' : 'var(--text-secondary)',
                  fontSize: '0.72rem',
                  fontWeight: selectedSlot === slot ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        {/* ── Search Input ─────────────────────────────────────── */}
        <div className="search-wrapper" style={{ marginBottom: 14 }}>
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            id="food-search-input"
            type="search"
            className="input-field"
            placeholder="Search food or recipe"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            aria-label="Search food"
          />
        </div>

        {/* ── Filter Pills ─────────────────────────────────────── */}
        <div className="pill-tabs" style={{ marginBottom: 18 }}>
          {(['All', 'My Foods', 'Recipes', 'Scan'] as FilterCategory[]).map(tab => (
            <button
              key={tab}
              id={`food-filter-${tab.toLowerCase().replace(/\s+/g, '-')}`}
              className={`pill-tab ${filterTab === tab ? 'active' : ''}`}
              onClick={() => setFilterTab(tab)}
            >
              {tab === 'Scan' ? '📷 Scan' : tab}
            </button>
          ))}
        </div>

        {/* ── Status messages ──────────────────────────────────── */}
        {logMessage && (
          <div style={{ padding: '10px 14px', backgroundColor: 'var(--primary-bg)', borderRadius: 8, marginBottom: 12, textAlign: 'center' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>✓ {logMessage}</p>
          </div>
        )}
        {logError && (
          <div style={{ padding: '10px 14px', backgroundColor: 'var(--color-red-bg)', borderRadius: 8, marginBottom: 12, textAlign: 'center' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-red)', fontWeight: 600 }}>{logError}</p>
          </div>
        )}

        {/* ── Food Detail Panel (when food selected) ───────────── */}
        {selectedFood && (
          <div
            className="card animate-scale-in"
            style={{ padding: 16, marginBottom: 16, border: '1.5px solid var(--primary)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  {selectedFood.name}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {selectedFood.servingSize} {selectedFood.servingUnit}
                </p>
              </div>
              <button onClick={() => setSelectedFood(null)} style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>✕</button>
            </div>

            {/* Macros row */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
              {[
                { label: 'Calories', val: `${Math.round(selectedFood.macros.calories * qty)} kcal` },
                { label: 'Protein',  val: `${(selectedFood.macros.protein * qty).toFixed(1)}g` },
                { label: 'Carbs',    val: `${(selectedFood.macros.carbs * qty).toFixed(1)}g` },
                { label: 'Fat',      val: `${(selectedFood.macros.fat * qty).toFixed(1)}g` },
              ].map(m => (
                <div key={m.label} style={{ flex: 1, textAlign: 'center' }}>
                  <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginBottom: 2 }}>{m.label}</p>
                  <p className="tabular-nums" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{m.val}</p>
                </div>
              ))}
            </div>

            {/* Quantity adjuster */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Servings:</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  onClick={() => setQty(q => Math.max(0.5, parseFloat((q - 0.5).toFixed(1))))}
                  style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', fontWeight: 700, cursor: 'pointer' }}
                >−</button>
                <span className="tabular-nums" style={{ fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{qty}</span>
                <button
                  onClick={() => setQty(q => parseFloat((q + 0.5).toFixed(1)))}
                  style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', fontWeight: 700, cursor: 'pointer' }}
                >+</button>
              </div>
            </div>

            <button
              id="log-food-confirm-btn"
              className="btn-primary"
              style={{ fontSize: '0.88rem' }}
              disabled={loading}
              onClick={() => handleLog(selectedFood, qty, selectedSlot)}
            >
              {loading ? 'Logging…' : `Log to ${selectedSlot}`}
            </button>
          </div>
        )}

        {/* ── Quick Add list ───────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <p style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {searchQuery ? 'Search Results' : 'Quick Add'}
          </p>
        </div>

        <div className="card" style={{ padding: '0 16px', marginBottom: 16 }}>
          {displayFoods.length === 0 ? (
            <div style={{ padding: '20px 0', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                {searchQuery ? `No foods found for "${searchQuery}"` : 'No foods available'}
              </p>
            </div>
          ) : (
            displayFoods.map((food, i) => (
              <div
                key={food.id}
                id={`food-item-${food.id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 0',
                  borderBottom: i < displayFoods.length - 1 ? '1px solid var(--border)' : 'none',
                  cursor: 'pointer',
                }}
                onClick={() => { setSelectedFood(food); setQty(1); setSearchQuery(''); }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      backgroundColor: 'var(--bg-surface)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                    }}
                  >
                    {food.category === 'fruits' ? '🍎'
                      : food.category === 'vegetables' ? '🥦'
                      : food.category === 'grains_legumes' ? '🌾'
                      : food.category === 'seeds_nuts' ? '🥜'
                      : '🥛'}
                  </div>
                  <div>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {food.name}
                    </p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {food.servingSize} {food.servingUnit}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className="tabular-nums" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {food.macros.calories} kcal
                  </span>
                  <button
                    id={`quick-add-${food.id}`}
                    aria-label={`Quick add ${food.name}`}
                    onClick={e => {
                      e.stopPropagation();
                      handleQuickAdd(food);
                    }}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Create Custom Meal CTA ───────────────────────────── */}
        <button
          id="create-custom-meal-btn"
          className="btn-ghost"
          style={{ width: '100%' }}
          onClick={() => {/* future: open custom meal creator */}}
        >
          + Create Custom Meal
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
