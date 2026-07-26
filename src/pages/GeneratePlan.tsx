import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNutrition } from '../context/NutritionContext';
import { useUser } from '../context/UserContext';
import { generateMealPlan } from '../engine/mealGenerator';
import type { RecommendedMeal, SmartAdjustment } from '../engine/mealGenerator';
import type { HealthSystem } from '../engine/healthScore';
import type { MealPlanWizardState } from '../types/nutrition.types';
import AppHeader from '../components/layout/AppHeader';
import BottomNav from '../components/layout/BottomNav';

/** Custom Mouse/Touch Dual-Handle Stretch Component for 24-Hour Waking Window */
function DualRangeTrack24h({
  wakeHour,
  sleepHour,
  onChange,
}: {
  wakeHour: number;
  sleepHour: number;
  onChange: (wake: number, sleep: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<'wake' | 'sleep' | null>(null);

  const getHourFromX = (clientX: number) => {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(pct * 24);
  };

  const handlePointerDown = (type: 'wake' | 'sleep') => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(type);
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch (_) {}
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const hour = getHourFromX(e.clientX);
    if (dragging === 'wake') {
      const newWake = Math.min(Math.max(0, hour), sleepHour - 1);
      onChange(newWake, sleepHour);
    } else if (dragging === 'sleep') {
      const newSleep = Math.max(wakeHour + 1, Math.min(24, hour));
      onChange(wakeHour, newSleep);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragging) {
      setDragging(null);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (_) {}
    }
  };

  const wakePct = (wakeHour / 24) * 100;
  const sleepPct = (sleepHour / 24) * 100;

  const formatHourLabel = (h: number) => {
    if (h === 0 || h === 24) return '12 AM';
    if (h === 12) return '12 PM';
    return h > 12 ? `${h - 12} PM` : `${h} AM`;
  };

  return (
    <div style={{ padding: '0 4px', marginBottom: 20 }}>
      {/* Time Badges & Fine-Tune Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        {/* Wake Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => onChange(Math.max(0, wakeHour - 1), sleepHour)}
            style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: 6, border: '1px solid var(--border)' }}
          >
            -1h
          </button>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>
            🌅 Wake: {formatHourLabel(wakeHour)}
          </span>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => onChange(Math.min(sleepHour - 1, wakeHour + 1), sleepHour)}
            style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: 6, border: '1px solid var(--border)' }}
          >
            +1h
          </button>
        </div>

        {/* Sleep Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => onChange(wakeHour, Math.max(wakeHour + 1, sleepHour - 1))}
            style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: 6, border: '1px solid var(--border)' }}
          >
            -1h
          </button>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34D399' }}>
            🌙 Sleep: {formatHourLabel(sleepHour)}
          </span>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => onChange(wakeHour, Math.min(24, sleepHour + 1))}
            style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: 6, border: '1px solid var(--border)' }}
          >
            +1h
          </button>
        </div>
      </div>

      {/* 24-Hour Continuous Track Bar */}
      <div
        ref={trackRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          position: 'relative',
          height: 48,
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          userSelect: 'none',
          touchAction: 'none',
        }}
      >
        {/* Background Track Line (0-24h) */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: 12,
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderRadius: 6,
            border: '1px solid var(--border)',
          }}
        />

        {/* Highlighted Stretch Window Segment */}
        <div
          style={{
            position: 'absolute',
            left: `${wakePct}%`,
            width: `${sleepPct - wakePct}%`,
            height: 12,
            background: 'linear-gradient(90deg, var(--primary) 0%, #34D399 100%)',
            borderRadius: 6,
            boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)',
          }}
        />

        {/* Wake Handle (First Point) */}
        <div
          onPointerDown={handlePointerDown('wake')}
          style={{
            position: 'absolute',
            left: `calc(${wakePct}% - 14px)`,
            width: 28,
            height: 28,
            borderRadius: '50%',
            backgroundColor: 'var(--primary)',
            border: '3px solid #FFFFFF',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
            cursor: 'grab',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            color: '#FFF',
            fontWeight: 800,
            transform: dragging === 'wake' ? 'scale(1.15)' : 'scale(1)',
            transition: 'transform 0.1s ease',
          }}
        >
          🌅
        </div>

        {/* Sleep Handle (Second Point) */}
        <div
          onPointerDown={handlePointerDown('sleep')}
          style={{
            position: 'absolute',
            left: `calc(${sleepPct}% - 14px)`,
            width: 28,
            height: 28,
            borderRadius: '50%',
            backgroundColor: '#34D399',
            border: '3px solid #FFFFFF',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
            cursor: 'grab',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            color: '#FFF',
            fontWeight: 800,
            transform: dragging === 'sleep' ? 'scale(1.15)' : 'scale(1)',
            transition: 'transform 0.1s ease',
          }}
        >
          🌙
        </div>
      </div>

      {/* 24-Hour Timeline Ticks & Labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
        <span>12 AM (0h)</span>
        <span>6 AM (6h)</span>
        <span>12 PM (12h)</span>
        <span>6 PM (18h)</span>
        <span>12 AM (24h)</span>
      </div>
    </div>
  );
}

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
  'Pre-Workout': '⚡',
  'Post-Workout': '💪',
  Breakfast: '☀️',
  Lunch: '🌤️',
  Snacks: '🍎',
  Dinner: '🌙',
};

const SLOT_TIMES: Record<string, string> = {
  'Pre-Workout': '6:30 AM',
  'Post-Workout': '8:30 AM',
  Breakfast: '9:00 AM',
  Lunch: '1:30 PM',
  Snacks: '5:00 PM',
  Dinner: '8:30 PM',
};

// Categorized food options for exclusion steps
const FOOD_OPTIONS = {
  fruits: [
    { id: 'apple', label: '🍎 Apple' },
    { id: 'banana', label: '🍌 Banana' },
    { id: 'orange', label: '🍊 Orange' },
    { id: 'mango', label: '🥭 Mango' },
    { id: 'papaya', label: '🍈 Papaya' },
    { id: 'grapes', label: '🍇 Grapes' },
    { id: 'blueberries', label: '🫐 Blueberries' },
  ],
  nuts: [
    { id: 'almonds', label: '🥜 Almonds' },
    { id: 'walnuts', label: '🌰 Walnuts' },
    { id: 'cashews', label: '🥥 Cashews' },
    { id: 'peanuts', label: '🥜 Peanuts' },
    { id: 'chia_seeds', label: '🌱 Chia Seeds' },
    { id: 'flaxseeds', label: '🌾 Flaxseeds' },
    { id: 'pumpkin_seeds', label: '🎃 Pumpkin Seeds' },
  ],
  veggies: [
    { id: 'spinach', label: '🥬 Spinach' },
    { id: 'broccoli', label: '🥦 Broccoli' },
    { id: 'carrots', label: '🥕 Carrots' },
    { id: 'sweet_potato', label: '🍠 Sweet Potato' },
    { id: 'bell_pepper', label: '🫑 Bell Pepper' },
    { id: 'beetroot', label: '🫚 Beetroot' },
    { id: 'tomatoes', label: '🍅 Tomatoes' },
  ],
  proteins: [
    { id: 'paneer', label: '🧀 Paneer' },
    { id: 'tofu', label: '🧊 Tofu' },
    { id: 'greek_yogurt', label: '🥛 Greek Yogurt' },
    { id: 'milk', label: '🥛 Milk' },
    { id: 'soya_chunks', label: '🫘 Soya Chunks' },
    { id: 'whey_protein', label: '🥤 Whey Protein' },
    { id: 'oats', label: '🥣 Oats' },
    { id: 'lentils_dal', label: '🍲 Lentils & Dal' },
  ],
};

function formatHour(h: number): string {
  if (h === 0 || h === 24) return '12:00 AM';
  if (h === 12) return '12:00 PM';
  if (h < 12) return `${h}:00 AM`;
  return `${h - 12}:00 PM`;
}

/**
 * Screen 5.1 — Generate & Preview Meal Plan with Multi-Step Wizard
 * PRD Section 7, ui-screens-spec.md Screen 5.1:
 * Interactive multi-step wizard gathering Gym status, 0-24h waking hours, dynamic workout timing,
 * PRD primary goals, protein powder usage, and categorized food exclusions.
 */
export default function GeneratePlan() {
  const { todayLog, savedPlans, saveMealPlan, setActiveMealPlan } = useNutrition();
  const { currentUser, nutritionTargets, microRDA } = useUser();
  const navigate = useNavigate();

  // Wizard State
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [isWizardActive, setIsWizardActive] = useState<boolean>(true);

  const [wizardConfig, setWizardConfig] = useState<MealPlanWizardState>(() => {
    try {
      const saved = localStorage.getItem('nutrition_wizard_config');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved wizard config', e);
    }
    return {
      gymWorkout: true,
      primaryGoal: 'Muscle Build',
      workoutTime: '8:00 AM',
      wakeHour: 7, // 7:00 AM
      sleepHour: 23, // 11:00 PM
      mealCount: 5,
      proteinScoops: 1,
      excludedFruits: [],
      excludedNuts: [],
      excludedVeggies: [],
      excludedProteins: [],
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem('nutrition_wizard_config', JSON.stringify(wizardConfig));
    } catch (e) {
      console.error('Failed to save wizard config', e);
    }
  }, [wizardConfig]);

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

  // Dynamically calculate workout suggestions strictly inside selected waking hours
  const suggestedWorkouts = useMemo(() => {
    const wake = wizardConfig.wakeHour;
    const sleep = wizardConfig.sleepHour;
    const range = sleep - wake;

    const m = Math.min(wake + Math.max(Math.floor(range * 0.15), 1), sleep - 1);
    const d = Math.min(wake + Math.max(Math.floor(range * 0.40), 2), sleep - 1);
    const e = Math.min(wake + Math.max(Math.floor(range * 0.70), 3), sleep - 1);
    const n = Math.max(sleep - 2, wake + 1);

    return [
      { label: `🌅 Morning (${formatHour(m)})`, time: formatHour(m) },
      { label: `☀️ Mid-Day (${formatHour(d)})`, time: formatHour(d) },
      { label: `🌆 Evening (${formatHour(e)})`, time: formatHour(e) },
      { label: `🌙 Night (${formatHour(n)})`, time: formatHour(n) },
    ];
  }, [wizardConfig.wakeHour, wizardConfig.sleepHour]);

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
  const handleGenerate = (offset = planOffset, config = wizardConfig) => {
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
      offset,
      config
    );
    setRecommendations(plan);
    setIsGenerating(false);
  };

  const handleFinishWizard = () => {
    setIsWizardActive(false);
    handleGenerate(0, wizardConfig);
  };

  const handleRegenerate = () => {
    const next = planOffset + 1;
    setPlanOffset(next);
    handleGenerate(next, wizardConfig);
  };

  const toggleExclusion = (category: 'excludedFruits' | 'excludedNuts' | 'excludedVeggies' | 'excludedProteins', id: string) => {
    setWizardConfig(prev => {
      const list = prev[category];
      const exists = list.includes(id);
      return {
        ...prev,
        [category]: exists ? list.filter(item => item !== id) : [...list, id],
      };
    });
  };

  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const isMaxLimitReached = savedPlans.length >= 3;

  const totalCalories = recommendations
    ? recommendations.meals.reduce((s, m) => s + m.totalCalories, 0)
    : 0;
  const totalProtein = recommendations
    ? recommendations.meals.reduce((s, m) => s + m.totalProtein, 0)
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

  const handleConfirmSave = async () => {
    if (!recommendations) return;
    setIsSaving(true);

    const planTitle = customName.trim() || `Plan ${savedPlans.length + 1}`;
    const result = await saveMealPlan(
      planTitle,
      recommendations.meals,
      recommendations.planDeficiencies,
      recommendations.adjustments,
      undefined,
      wizardConfig
    );

    const res = result as { success: boolean; error?: string; newPlanId?: string };

    if (res.success) {
      if (makeActive && res.newPlanId) {
        await setActiveMealPlan(res.newPlanId);
      }
      setSaveMsg('✅ Meal Plan saved successfully!');
      setShowSaveModal(false);
      setTimeout(() => {
        navigate('/meals');
      }, 800);
    } else {
      setSaveMsg(res.error || 'Failed to save plan.');
    }
    setIsSaving(false);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-dark)', color: 'var(--text-primary)', paddingBottom: 110 }}>
      <AppHeader title="Meal Plan Generator 🍲" />

      <main style={{ maxWidth: 640, margin: '0 auto', padding: '16px 16px' }}>

        {/* ── QUESTIONNAIRE WIZARD ─────────────────────────────────────── */}
        {isWizardActive ? (
          <div className="premium-card animate-fade-up" style={{ padding: 22 }}>

            {/* Wizard Header Progress */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <span className="badge-pill emerald" style={{ fontSize: '0.72rem', fontWeight: 700 }}>
                  STEP {wizardStep} OF {wizardConfig.gymWorkout ? '9' : '8'}
                </span>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: 4, color: 'var(--text-primary)' }}>
                  Personalize Your Plan
                </h2>
              </div>
              <button
                className="btn-ghost"
                onClick={handleFinishWizard}
                style={{ fontSize: '0.75rem', color: 'var(--primary)' }}
              >
                Skip Wizard ⚡
              </button>
            </div>

            {/* STEP 1: GYM WORKOUT STATUS */}
            {wizardStep === 1 && (
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 8 }}>
                  1. Do you workout in the GYM? 🏋️
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
                  Selecting Yes will automatically include Pre-Workout & Post-Workout meal slots around your training schedule.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <button
                    onClick={() => setWizardConfig(prev => ({ ...prev, gymWorkout: true }))}
                    style={{
                      padding: '20px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: `2px solid ${wizardConfig.gymWorkout ? 'var(--primary)' : 'var(--border)'}`,
                      backgroundColor: wizardConfig.gymWorkout ? 'var(--primary-bg)' : 'rgba(255,255,255,0.02)',
                      color: 'var(--text-primary)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '1.05rem',
                      textAlign: 'center',
                    }}
                  >
                    🏋️‍♂️ Yes, I Gym Daily
                  </button>
                  <button
                    onClick={() => setWizardConfig(prev => ({ ...prev, gymWorkout: false }))}
                    style={{
                      padding: '20px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: `2px solid ${!wizardConfig.gymWorkout ? 'var(--primary)' : 'var(--border)'}`,
                      backgroundColor: !wizardConfig.gymWorkout ? 'var(--primary-bg)' : 'rgba(255,255,255,0.02)',
                      color: 'var(--text-primary)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '1.05rem',
                      textAlign: 'center',
                    }}
                  >
                    🚶 No, Light Activity
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: NON-SLEEPING HOURS (CUSTOM DUAL-HANDLE POINTER STRETCH COMPONENT) */}
            {wizardStep === 2 && (
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 6 }}>
                  2. Non-Sleeping / Active Waking Hours ☀️
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
                  Drag the handles on the 24-hour stretch line below to set your active waking window (or tap -1h/+1h buttons):
                </p>

                {/* Active Window Banner */}
                <div style={{
                  padding: '16px 18px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary-bg)',
                  border: '1.5px solid var(--primary)',
                  marginBottom: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                      Active Waking Window
                    </span>
                    <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '2px 0 0 0' }}>
                      🌅 {formatHour(wizardConfig.wakeHour)} ➔ 🌙 {formatHour(wizardConfig.sleepHour)}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                      {Math.max(wizardConfig.sleepHour - wizardConfig.wakeHour, 0)} hrs
                    </span>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>Waking Duration</p>
                  </div>
                </div>

                {/* Custom Pointer-Enabled 24h Dual Handle Stretch Track */}
                <DualRangeTrack24h
                  wakeHour={wizardConfig.wakeHour}
                  sleepHour={wizardConfig.sleepHour}
                  onChange={(wake, sleep) => setWizardConfig(prev => ({ ...prev, wakeHour: wake, sleepHour: sleep }))}
                />
              </div>
            )}

            {/* STEP 3: WORKOUT TIMING (DYNAMICALLY SUGGESTED FROM WAKING HOURS) */}
            {wizardStep === 3 && wizardConfig.gymWorkout && (
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 6 }}>
                  3. What time do you workout? ⏰
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
                  Suggested windows dynamically calculated from your active waking hours (<strong>{formatHour(wizardConfig.wakeHour)} – {formatHour(wizardConfig.sleepHour)}</strong>):
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                  {suggestedWorkouts.map(t => (
                    <button
                      key={t.time}
                      onClick={() => setWizardConfig(prev => ({ ...prev, workoutTime: t.time }))}
                      style={{
                        padding: '14px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: `1.5px solid ${wizardConfig.workoutTime === t.time ? 'var(--primary)' : 'var(--border)'}`,
                        backgroundColor: wizardConfig.workoutTime === t.time ? 'var(--primary-bg)' : 'rgba(255,255,255,0.02)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: DYNAMIC MEAL SLOTS */}
            {wizardStep === (wizardConfig.gymWorkout ? 4 : 3) && (
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 12 }}>
                  Dynamic Meal Slots Preview 🍽️
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                  {wizardConfig.gymWorkout
                    ? `Pre-Workout and Post-Workout slots are positioned around your ${wizardConfig.workoutTime} workout.`
                    : 'Standard meal slot structure across active waking hours.'}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {wizardConfig.gymWorkout ? (
                    <>
                      <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--primary)', backgroundColor: 'var(--primary-bg)', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>⚡ Pre-Workout (Carbs + Fuel)</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>1.5h Before Workout</span>
                      </div>
                      <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--primary)', backgroundColor: 'var(--primary-bg)', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>💪 Post-Workout (High Protein)</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>30m After Workout</span>
                      </div>
                      <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>☀️ Breakfast</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Morning</span>
                      </div>
                      <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>🌤️ Lunch</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Afternoon</span>
                      </div>
                      <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>🌙 Dinner</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Night</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>☀️ Breakfast</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Morning</span>
                      </div>
                      <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>🌤️ Lunch</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mid-Day</span>
                      </div>
                      <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>🍎 Evening Snacks</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Evening</span>
                      </div>
                      <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>🌙 Dinner</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Night</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* STEP 5: PROTEIN SCOOP USAGE */}
            {wizardStep === (wizardConfig.gymWorkout ? 5 : 4) && (
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 12 }}>
                  Protein Powder Supplementation 🥤
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                  Scoop protein will be assigned to Post-Workout or Morning/Snack slots:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { scoops: 0, label: '🚫 No Protein Powder', desc: 'Cover 100% target from whole food sources' },
                    { scoops: 1, label: '🥤 1 Scoop Daily (~24g Protein)', desc: 'Added into Post-Workout / Morning slot' },
                    { scoops: 2, label: '🥤🥤 2 Scoops Daily (~48g Protein)', desc: 'Split across Post-Workout & Evening slot' },
                  ].map(p => (
                    <button
                      key={p.scoops}
                      onClick={() => setWizardConfig(prev => ({ ...prev, proteinScoops: p.scoops as any }))}
                      style={{
                        padding: '14px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: `1.5px solid ${wizardConfig.proteinScoops === p.scoops ? 'var(--primary)' : 'var(--border)'}`,
                        backgroundColor: wizardConfig.proteinScoops === p.scoops ? 'var(--primary-bg)' : 'rgba(255,255,255,0.02)',
                        color: 'var(--text-primary)',
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      <p style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>{p.label}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>{p.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 6a: EXCLUDE FRUITS */}
            {wizardStep === (wizardConfig.gymWorkout ? 6 : 5) && (
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 6 }}>
                  Exclude Fruits 🍎
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                  Tap any fruits you want to EXCLUDE from your generated plan:
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {FOOD_OPTIONS.fruits.map(item => {
                    const isExcluded = wizardConfig.excludedFruits.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => toggleExclusion('excludedFruits', item.id)}
                        style={{
                          padding: '8px 14px',
                          borderRadius: 20,
                          border: `1.5px solid ${isExcluded ? 'var(--color-red)' : 'var(--border)'}`,
                          backgroundColor: isExcluded ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.03)',
                          color: isExcluded ? 'var(--color-red)' : 'var(--text-primary)',
                          fontWeight: 600,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          textDecoration: isExcluded ? 'line-through' : 'none',
                        }}
                      >
                        {item.label} {isExcluded ? '❌' : ''}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 6b: EXCLUDE NUTS */}
            {wizardStep === (wizardConfig.gymWorkout ? 7 : 6) && (
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 6 }}>
                  Exclude Nuts & Seeds 🥜
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                  Tap any nuts/seeds you want to EXCLUDE from your generated plan:
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {FOOD_OPTIONS.nuts.map(item => {
                    const isExcluded = wizardConfig.excludedNuts.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => toggleExclusion('excludedNuts', item.id)}
                        style={{
                          padding: '8px 14px',
                          borderRadius: 20,
                          border: `1.5px solid ${isExcluded ? 'var(--color-red)' : 'var(--border)'}`,
                          backgroundColor: isExcluded ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.03)',
                          color: isExcluded ? 'var(--color-red)' : 'var(--text-primary)',
                          fontWeight: 600,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          textDecoration: isExcluded ? 'line-through' : 'none',
                        }}
                      >
                        {item.label} {isExcluded ? '❌' : ''}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 6c: EXCLUDE VEGETABLES */}
            {wizardStep === (wizardConfig.gymWorkout ? 8 : 7) && (
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 6 }}>
                  Exclude Vegetables 🥦
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                  Tap any vegetables you want to EXCLUDE from your generated plan:
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {FOOD_OPTIONS.veggies.map(item => {
                    const isExcluded = wizardConfig.excludedVeggies.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => toggleExclusion('excludedVeggies', item.id)}
                        style={{
                          padding: '8px 14px',
                          borderRadius: 20,
                          border: `1.5px solid ${isExcluded ? 'var(--color-red)' : 'var(--border)'}`,
                          backgroundColor: isExcluded ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.03)',
                          color: isExcluded ? 'var(--color-red)' : 'var(--text-primary)',
                          fontWeight: 600,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          textDecoration: isExcluded ? 'line-through' : 'none',
                        }}
                      >
                        {item.label} {isExcluded ? '❌' : ''}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 6d: EXCLUDE PROTEINS & DAIRY */}
            {wizardStep === (wizardConfig.gymWorkout ? 9 : 8) && (
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 6 }}>
                  Exclude Proteins & Dairy 🧀
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                  Tap any proteins/dairy items you want to EXCLUDE:
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {FOOD_OPTIONS.proteins.map(item => {
                    const isExcluded = wizardConfig.excludedProteins.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => toggleExclusion('excludedProteins', item.id)}
                        style={{
                          padding: '8px 14px',
                          borderRadius: 20,
                          border: `1.5px solid ${isExcluded ? 'var(--color-red)' : 'var(--border)'}`,
                          backgroundColor: isExcluded ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.03)',
                          color: isExcluded ? 'var(--color-red)' : 'var(--text-primary)',
                          fontWeight: 600,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          textDecoration: isExcluded ? 'line-through' : 'none',
                        }}
                      >
                        {item.label} {isExcluded ? '❌' : ''}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Wizard Navigation Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              {wizardStep > 1 ? (
                <button
                  className="btn-ghost"
                  onClick={() => setWizardStep(prev => prev - 1)}
                >
                  ← Back
                </button>
              ) : <div />}

              {wizardStep < (wizardConfig.gymWorkout ? 9 : 8) ? (
                <button
                  className="btn-primary"
                  onClick={() => setWizardStep(prev => prev + 1)}
                >
                  Next Step →
                </button>
              ) : (
                <button
                  className="btn-primary"
                  onClick={handleFinishWizard}
                  style={{ backgroundColor: 'var(--primary)', color: '#FFF' }}
                >
                  🚀 Generate Personalized Plan
                </button>
              )}
            </div>

          </div>
        ) : (
          /* ── GENERATED MEAL PLAN PREVIEW ───────────────────────────────── */
          <div>
            {/* Top Wizard Summary Bar */}
            <div className="premium-card" style={{ padding: '12px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="badge-pill emerald" style={{ fontSize: '0.7rem', fontWeight: 700 }}>
                  ⚡ Preferences Applied
                </span>
                <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', margin: '2px 0 0 0' }}>
                  {wizardConfig.gymWorkout ? '🏋️ Gym Daily' : '🚶 Light Activity'} • Active: {formatHour(wizardConfig.wakeHour)}–{formatHour(wizardConfig.sleepHour)}
                </p>
              </div>
              <button
                className="btn-ghost"
                onClick={() => setIsWizardActive(true)}
                style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}
              >
                ✏️ Edit Questionnaire
              </button>
            </div>

            {/* Total Plan Macros Banner */}
            <div className="premium-card animate-fade-up" style={{ padding: 18, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Generated Meal Plan Totals
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn-ghost"
                    onClick={handleRegenerate}
                    disabled={isGenerating}
                    style={{ fontSize: '0.78rem', color: 'var(--primary)', padding: '4px 10px' }}
                  >
                    {isGenerating ? 'Generating…' : '🔄 Regenerate'}
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ padding: 12, borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0 0 2px 0' }}>Total Calories</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>{totalCalories} kcal</p>
                </div>
                <div style={{ padding: 12, borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0 0 2px 0' }}>Total Protein</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-indigo)', margin: 0 }}>{totalProtein} g</p>
                </div>
              </div>
            </div>

            {/* Nutrient Gap / Shortfall Alerts */}
            {recommendations && recommendations.planDeficiencies.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                  ⚠️ Nutrient Gap Insights
                </p>
                {recommendations.planDeficiencies.map((def, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid rgba(245, 158, 11, 0.25)',
                      color: 'var(--color-amber)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      marginBottom: 6,
                    }}
                  >
                    {def}
                  </div>
                ))}
              </div>
            )}

            {/* Meal Slots Timeline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
              {recommendations?.meals.map(meal => (
                <div key={meal.slot} className="premium-card" style={{ padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '1.2rem' }}>{SLOT_EMOJIS[meal.slot] ?? '🥗'}</span>
                      <div>
                        <p style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                          {meal.slot}
                        </p>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0 }}>
                          {meal.time || SLOT_TIMES[meal.slot] || 'Flexible'}
                        </p>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)' }}>
                        {meal.totalCalories} kcal
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 6 }}>
                        ({meal.totalProtein}g P)
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {meal.items.map((item, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'rgba(255,255,255,0.02)',
                        }}
                      >
                        <div>
                          <p style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                            {item.food.name}
                          </p>
                          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                            {item.loggedQty}x {item.food.servingSize} • {item.reason}
                          </p>
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                          {Math.round(item.food.macros.calories * item.loggedQty)} kcal
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Save CTA */}
            <div style={{ textAlign: 'center' }}>
              {saveMsg && (
                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', marginBottom: 10 }}>
                  {saveMsg}
                </p>
              )}
              <button
                className="btn-primary"
                onClick={handleOpenSaveModal}
                style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
              >
                💾 Save Custom Meal Plan
              </button>
            </div>
          </div>
        )}

      </main>

      {/* ── SAVE MEAL PLAN MODAL ────────────────────────────────────── */}
      {showSaveModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            className="premium-card animate-fade-up"
            style={{
              width: '100%',
              maxWidth: 420,
              padding: 24,
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 14 }}>
              💾 Save Meal Plan
            </h3>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                Plan Name
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
