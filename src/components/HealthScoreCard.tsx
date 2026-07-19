
import { scoreColour, HEALTH_SYSTEM_META } from '../engine/healthScore';
import type { HealthSystem } from '../engine/healthScore';

interface HealthScoreCardProps {
  system: HealthSystem;
  score: number;
  /** Optional: delay for staggered entrance animation (ms) */
  delay?: number;
}

/**
 * Compact animated ring card for a single health system score.
 * PRD Section 6.2 / 6.3.
 * Colour thresholds: Green ≥80%, Indigo 60–79%, Amber 40–59%, Red <40%
 */
export default function HealthScoreCard({ system, score, delay = 0 }: HealthScoreCardProps) {
  const meta = HEALTH_SYSTEM_META[system];
  const colourClass = scoreColour(score);
  const colours: Record<string, string> = {
    'score-green':  '#10B981',
    'score-indigo': '#6366F1',
    'score-amber':  '#F59E0B',
    'score-red':    '#EF4444',
  };
  const colour = colours[colourClass];

  const radius = 28;
  const strokeW = 4;
  const circ = 2 * Math.PI * radius;
  const offset = circ * (1 - score / 100);

  return (
    <div
      className={`premium-card animate-fade-up ${colourClass.replace('score-', 'score-') + '-bg'}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 16px',
        animationDelay: `${delay}ms`,
      }}
    >
      {/* Mini ring */}
      <svg
        width={68} height={68}
        viewBox="0 0 68 68"
        aria-label={`${meta.label} score ${score}%`}
        style={{ flexShrink: 0 }}
      >
        <circle cx={34} cy={34} r={radius} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={strokeW} />
        <circle
          cx={34} cy={34} r={radius}
          fill="none"
          stroke={colour}
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 34 34)"
          style={{
            transition: 'stroke-dashoffset 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
            filter: `drop-shadow(0 0 5px ${colour}70)`,
          }}
        />
        <text
          x="50%" y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fill={colour}
          fontSize="11"
          fontWeight="700"
          fontFamily="Inter, sans-serif"
        >
          {score}%
        </text>
      </svg>

      {/* Label */}
      <div>
        <p style={{ fontSize: '1rem', marginBottom: 2 }}>{meta.emoji}</p>
        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
          {meta.label}
        </p>
        <p style={{ fontSize: '0.7rem', color: colour, fontWeight: 500, marginTop: 2 }}>
          {score >= 80 ? 'Optimal' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Needs attention'}
        </p>
      </div>

      {/* Score — right side */}
      <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
        <p className="tabular-nums" style={{ fontSize: '1.5rem', fontWeight: 700, color: colour, lineHeight: 1 }}>
          {score}
        </p>
        <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>/ 100</p>
      </div>
    </div>
  );
}
