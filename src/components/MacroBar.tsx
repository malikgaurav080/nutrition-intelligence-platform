

interface MacroBarProps {
  label: string;
  consumed: number;
  target: number;
  unit: string;
  colour?: string;
  /** Delay for staggered animation (ms) */
  delay?: number;
}

/**
 * Horizontal macro progress bar row.
 * PRD Section 6.1 — Protein, Carbs, Fat, Fiber bars.
 */
export default function MacroBar({
  label,
  consumed,
  target,
  unit,
  colour = '#10B981',
  delay = 0,
}: MacroBarProps) {
  const pct = target > 0 ? Math.min((consumed / target) * 100, 100) : 0;
  const remaining = Math.max(target - consumed, 0);

  return (
    <div style={{ marginBottom: 16 }}>
      {/* Row header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
        <span className="tabular-nums" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{consumed}{unit}</span>
          {' / '}{target}{unit}
        </span>
      </div>

      {/* Progress track */}
      <div className="progress-track">
        <div
          className="progress-fill"
          role="progressbar"
          aria-valuenow={Math.round(pct)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label} progress`}
          style={{
            width: `${pct}%`,
            backgroundColor: colour,
            animationDelay: `${delay}ms`,
            boxShadow: `0 0 8px ${colour}50`,
          }}
        />
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: '0.65rem', color: colour, fontWeight: 600 }}>{Math.round(pct)}%</span>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
          {remaining}{unit} left
        </span>
      </div>
    </div>
  );
}
