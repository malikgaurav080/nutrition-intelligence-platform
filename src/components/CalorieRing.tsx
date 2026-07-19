

interface CalorieRingProps {
  target: number;
  consumed: number;
  size?: number;
}

/**
 * Animated SVG circular progress ring for calories.
 * PRD Section 6.1 — Calorie Ring widget.
 */
export default function CalorieRing({ target, consumed, size = 180 }: CalorieRingProps) {
  const radius = 70;
  const stroke = 10;
  const circumference = 2 * Math.PI * radius;
  const clampedPct = target > 0 ? Math.min(consumed / target, 1) : 0;
  const offset = circumference * (1 - clampedPct);
  const remaining = Math.max(target - consumed, 0);

  // Score colour logic simplified: emerald unless over budget
  const ringColour = consumed > target ? '#EF4444' : '#10B981';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label="Calorie ring">
          {/* Track */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth={stroke}
          />
          {/* Fill — animated */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke={ringColour}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{
              transition: 'stroke-dashoffset 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
              filter: `drop-shadow(0 0 8px ${ringColour}60)`,
            }}
          />
        </svg>
        {/* Centre label */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 2,
        }}>
          <span className="tabular-nums" style={{ fontSize: '1.6rem', fontWeight: 700, color: ringColour }}>
            {consumed.toLocaleString()}
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>kcal eaten</span>
        </div>
      </div>

      {/* Sub-labels */}
      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <p className="tabular-nums" style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {target.toLocaleString()}
          </p>
          <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Target</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p className="tabular-nums" style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            {remaining.toLocaleString()}
          </p>
          <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Remaining</p>
        </div>
      </div>
    </div>
  );
}
