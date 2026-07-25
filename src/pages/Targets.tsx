import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import AppHeader from '../components/layout/AppHeader';
import BottomNav from '../components/layout/BottomNav';
import SegmentedControl from '../components/ui/SegmentedControl';

/**
 * SVG Donut Chart for macro distribution.
 * Draws Protein, Carbs, Fat slices based on calorie percentages.
 */
function DonutChart({
  protein, carbs, fat, totalKcal
}: { protein: number; carbs: number; fat: number; totalKcal: number }) {
  const size = 200;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const proteinKcal = protein * 4;
  const carbsKcal   = carbs * 4;
  const fatKcal     = fat * 9;
  const total       = proteinKcal + carbsKcal + fatKcal || 1;

  const proteinPct = proteinKcal / total;
  const carbsPct   = carbsKcal   / total;
  const fatPct     = fatKcal     / total;

  // Compute stroke-dasharray and stroke-dashoffset for each segment
  const proteinDash = proteinPct * circumference;
  const carbsDash   = carbsPct   * circumference;
  const fatDash     = fatPct     * circumference;

  const proteinOffset = 0;
  const carbsOffset   = circumference - proteinDash;
  const fatOffset     = circumference - proteinDash - carbsDash;

  // Animate all three segments
  useEffect(() => {
    // Short delay to trigger CSS transition
    const timer = setTimeout(() => {
      document.querySelectorAll('.donut-seg').forEach(el => {
        (el as SVGCircleElement).style.opacity = '1';
      });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const cx = size / 2;
  const cy = size / 2;

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="var(--bg-surface)" strokeWidth={strokeWidth} />
        {/* Carbs (largest, drawn first as base) */}
        <circle
          className="donut-seg"
          cx={cx} cy={cy} r={radius}
          fill="none"
          stroke="var(--macro-carbs)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${carbsDash} ${circumference - carbsDash}`}
          strokeDashoffset={-carbsOffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease', opacity: 0.9 }}
        />
        {/* Fat */}
        <circle
          className="donut-seg"
          cx={cx} cy={cy} r={radius}
          fill="none"
          stroke="var(--macro-fat)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${fatDash} ${circumference - fatDash}`}
          strokeDashoffset={-fatOffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease 0.2s', opacity: 0.9 }}
        />
        {/* Protein */}
        <circle
          className="donut-seg"
          cx={cx} cy={cy} r={radius}
          fill="none"
          stroke="var(--macro-protein)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${proteinDash} ${circumference - proteinDash}`}
          strokeDashoffset={-proteinOffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease 0.1s', opacity: 0.9 }}
        />
      </svg>
      {/* Center label */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}
      >
        <p className="tabular-nums" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
          {totalKcal.toLocaleString()}
        </p>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: 2 }}>
          kcal Daily Target
        </p>
      </div>
    </div>
  );
}

/**
 * Screen 4 — Nutrition Targets
 * PRD Section 3.4, ui-screens-spec.md Screen 4:
 * Macros/Micronutrients toggle + donut chart + fiber & water cards.
 * All values from UserContext nutritionTargets (derived from backend user profile).
 */
export default function Targets() {
  const { nutritionTargets } = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'Macros' | 'Micronutrients'>('Macros');

  const targets = nutritionTargets;

  const protein = Math.round(targets?.protein_g ?? 145);
  const carbs   = Math.round(targets?.carbs_g   ?? 275);
  const fat     = Math.round(targets?.fat_g     ?? 73);
  const kcal    = Math.round(targets?.calories  ?? 2200);
  const fiber   = Math.round(targets?.fiber_g   ?? 25);
  const waterL  = parseFloat(((targets?.water_ml ?? 2500) / 1000).toFixed(1));

  const totalKcalMacro = protein * 4 + carbs * 4 + fat * 9;
  const proteinPct = Math.round((protein * 4 / totalKcalMacro) * 100);
  const carbsPct   = Math.round((carbs   * 4 / totalKcalMacro) * 100);
  const fatPct     = Math.round((fat     * 9 / totalKcalMacro) * 100);

  return (
    <div className="app-container">
      {/* ── Header ───────────────────────────────────────────── */}
      <AppHeader
        left={
          <button aria-label="Open menu" style={{ color: 'var(--text-primary)', display: 'flex' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <line x1="3" y1="6"  x2="21" y2="6"  />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        }
        title={
          <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Nutrition Targets
          </h1>
        }
        right={
          <button aria-label="Edit targets" style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600 }}>
            Edit
          </button>
        }
      />

      <div className="page-content">
        {/* ── Segmented toggle ─────────────────────────────────── */}
        <div style={{ marginBottom: 24 }}>
          <SegmentedControl
            id="targets-toggle"
            options={['Macros', 'Micronutrients']}
            value={activeTab}
            onChange={v => {
              if (v === 'Micronutrients') {
                navigate('/micronutrients');
              } else {
                setActiveTab('Macros');
              }
            }}
          />
        </div>

        {/* ── Donut Chart ──────────────────────────────────────── */}
        <div className="card animate-fade-up" style={{ padding: '24px 20px', marginBottom: 16 }}>
          <DonutChart
            protein={protein}
            carbs={carbs}
            fat={fat}
            totalKcal={kcal}
          />

          {/* Legend */}
          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 24 }}>
            {[
              { label: 'Protein', grams: protein, pct: proteinPct, color: 'var(--macro-protein)' },
              { label: 'Carbs',   grams: carbs,   pct: carbsPct,   color: 'var(--macro-carbs)'   },
              { label: 'Fat',     grams: fat,      pct: fatPct,     color: 'var(--macro-fat)'     },
            ].map(m => (
              <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: m.color, flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{m.label}</p>
                  <p className="tabular-nums" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {m.grams}g
                  </p>
                  <p style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{m.pct}%</p>
                </div>
              </div>
            ))}
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 16, lineHeight: 1.4 }}>
            These targets are personalized based on your profile and goals.
          </p>
        </div>

        {/* ── Fiber & Water Cards ──────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {/* Fiber */}
          <div
            id="target-fiber-card"
            className="card animate-fade-up delay-1"
            style={{ padding: 18 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: '1.1rem' }}>🌾</span>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Fiber</p>
            </div>
            <p className="tabular-nums" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
              {fiber} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>g</span>
            </p>
            <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 4 }}>
              14g per 1000 kcal
            </p>
          </div>

          {/* Water */}
          <div
            id="target-water-card"
            className="card animate-fade-up delay-2"
            style={{ padding: 18 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: '1.1rem' }}>💧</span>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Water</p>
            </div>
            <p className="tabular-nums" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-blue)' }}>
              {waterL} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>L</span>
            </p>
            <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Recommended
            </p>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
