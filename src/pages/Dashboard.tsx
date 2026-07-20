import { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useNutrition } from '../context/NutritionContext';
import CalorieRing from '../components/CalorieRing';
import MacroBar from '../components/MacroBar';
import WaterTracker from '../components/WaterTracker';

/**
 * Main Dashboard page.
 * PRD Sections 6.1–6.3: Macro widgets, water tracker, health system score cards.
 */
export default function Dashboard() {
  const { currentUser, nutritionTargets, logoutUser } = useUser();
  const { todayLog, updateWater } = useNutrition();

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

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  })();

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '100px' }}>
      {/* ── Header ───────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{greeting}</p>
          <h1 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginTop: 2 }}>
            {currentUser?.name?.split(' ')[0] ?? 'Explorer'} 👋
          </h1>
        </div>
        <button
          id="logout-btn"
          onClick={logoutUser}
          aria-label="Log out"
          style={{
            padding: '6px 14px',
            border: '1px solid var(--divider)',
            backgroundColor: 'transparent',
            color: 'var(--text-secondary)',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: '0.75rem',
          }}
        >
          Sign out
        </button>
      </div>

      {/* ── Daily Macros ─────────────────────────────────── */}
      <p className="section-label" style={{ marginTop: 20 }}>Daily Macros</p>

      <div className="premium-card animate-fade-up" style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
        <CalorieRing
          target={nutritionTargets?.calories ?? 0}
          consumed={dailyTotals.calories}
          maintenance={nutritionTargets?.tdee ?? 0}
        />
      </div>

      <div className="premium-card animate-fade-up" style={{ marginBottom: 16 }}>
        <MacroBar
          label="Protein"
          consumed={Math.round(dailyTotals.protein)}
          target={nutritionTargets?.protein_g ?? 0}
          unit="g"
          colour="#10B981"
          delay={0}
        />
        <MacroBar
          label="Carbohydrates"
          consumed={Math.round(dailyTotals.carbs)}
          target={nutritionTargets?.carbs_g ?? 0}
          unit="g"
          colour="#3B82F6"
          delay={80}
        />
        <MacroBar
          label="Fat"
          consumed={Math.round(dailyTotals.fat)}
          target={nutritionTargets?.fat_g ?? 0}
          unit="g"
          colour="#F59E0B"
          delay={160}
        />
        <MacroBar
          label="Fiber"
          consumed={Math.round(dailyTotals.fiber)}
          target={nutritionTargets?.fiber_g ?? 0}
          unit="g"
          colour="#8B5CF6"
          delay={240}
        />
      </div>

      {/* ── Water ─────────────────────────────────────────── */}
      <WaterTracker
        targetMl={nutritionTargets?.water_ml ?? 2000}
        consumed={todayLog.waterConsumed}
        onAdd={() => updateWater(todayLog.waterConsumed + 250)}
      />

      {/* ── Bottom Nav ───────────────────────────────────── */}
      <nav className="bottom-nav" aria-label="Main navigation">
        <NavLink to="/dashboard" id="nav-home">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Home
        </NavLink>
        <NavLink to="/insights" id="nav-insights">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          Insights
        </NavLink>
        <NavLink to="/health" id="nav-health">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
          </svg>
          Health
        </NavLink>
        <NavLink to="/meals" id="nav-meals">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
            <path d="M12 8v4l3 3"/>
          </svg>
          Meals
        </NavLink>
        <NavLink to="/profile" id="nav-profile">
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
