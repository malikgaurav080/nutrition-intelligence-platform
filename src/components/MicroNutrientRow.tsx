

interface MicroNutrientRowProps {
  name: string;
  unit: string;
  target: number;
  consumed: number;
  /** 3 = ⭐⭐⭐, 2 = ⭐⭐ */
  priority: 2 | 3;
  delay?: number;
}

/**
 * Single nutrient detail row for the micronutrient view.
 * PRD Section 6.2 — shows name, daily target, consumed, remaining, progress bar.
 */
export default function MicroNutrientRow({
  name,
  unit,
  target,
  consumed,
  priority,
  delay = 0,
}: MicroNutrientRowProps) {
  const pct = target > 0 ? Math.min((consumed / target) * 100, 100) : 0;
  const remaining = Math.max(target - consumed, 0);
  const stars = priority === 3 ? '⭐⭐⭐' : '⭐⭐';

  // Colour based on completion
  const barColour = pct >= 80 ? '#10B981' : pct >= 40 ? '#F59E0B' : '#6366F1';

  return (
    <div
      className="animate-fade-up"
      style={{
        borderBottom: '1px solid var(--divider)',
        paddingBottom: 14,
        marginBottom: 14,
        animationDelay: `${delay}ms`,
      }}
    >
      {/* Row header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{name}</span>
          <span
            role="img"
            aria-label={`Priority: ${stars}`}
            title={priority === 3 ? 'High priority' : 'Medium priority'}
            style={{ fontSize: '0.6rem', letterSpacing: '-1px' }}
          >
            {stars}
          </span>
        </div>
        <span className="tabular-nums" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
          <span style={{ color: barColour, fontWeight: 600 }}>{consumed.toFixed(1)}</span>
          {' / '}{target}{unit}
        </span>
      </div>

      {/* Progress bar */}
      <div className="progress-track" style={{ height: 5, marginBottom: 5 }}>
        <div
          className="progress-fill"
          role="progressbar"
          aria-valuenow={Math.round(pct)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${name} progress`}
          style={{
            width: `${pct}%`,
            backgroundColor: barColour,
            animationDelay: `${delay + 100}ms`,
          }}
        />
      </div>

      {/* Footer row */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.65rem', color: barColour, fontWeight: 600 }}>{Math.round(pct)}% complete</span>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
          {remaining.toFixed(1)}{unit} remaining
        </span>
      </div>
    </div>
  );
}
