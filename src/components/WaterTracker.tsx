

interface WaterTrackerProps {
  targetMl: number;
  consumed: number;
  onAdd: () => void;
}

const GLASS_ML = 250;

/**
 * Water intake tracker widget.
 * PRD Section 6.1 — shows target ml, logged ml, glass count (250ml/glass).
 */
export default function WaterTracker({ targetMl, consumed, onAdd }: WaterTrackerProps) {
  const totalGlasses = Math.ceil(targetMl / GLASS_ML);
  const filledGlasses = Math.floor(consumed / GLASS_ML);
  const pct = targetMl > 0 ? Math.min((consumed / targetMl) * 100, 100) : 0;

  return (
    <div className="premium-card" style={{ marginBottom: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <p className="section-label" style={{ marginBottom: 2 }}>💧 Water</p>
          <p className="tabular-nums" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#3B82F6' }}>
            {consumed} <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 400 }}>/ {targetMl} ml</span>
          </p>
        </div>
        <button
          id="water-add-btn"
          onClick={onAdd}
          aria-label="Add one glass of water"
          style={{
            width: 40, height: 40,
            borderRadius: '50%',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            backgroundColor: 'rgba(59, 130, 246, 0.12)',
            color: '#3B82F6',
            fontSize: '1.25rem',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background-color 0.15s ease',
          }}
        >
          +
        </button>
      </div>

      {/* Progress track */}
      <div className="progress-track" style={{ marginBottom: 10 }}>
        <div
          className="progress-fill"
          style={{
            width: `${pct}%`,
            backgroundColor: '#3B82F6',
            boxShadow: '0 0 8px rgba(59, 130, 246, 0.5)',
          }}
        />
      </div>

      {/* Glass icons */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {Array.from({ length: totalGlasses }).map((_, i) => (
          <span
            key={i}
            role="img"
            aria-label={i < filledGlasses ? 'Filled glass' : 'Empty glass'}
            style={{
              fontSize: '1rem',
              opacity: i < filledGlasses ? 1 : 0.25,
              transition: 'opacity 0.3s ease',
              filter: i < filledGlasses ? 'drop-shadow(0 0 4px #3B82F680)' : 'none',
            }}
          >
            🥛
          </span>
        ))}
      </div>

      <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: 8 }}>
        {filledGlasses} of {totalGlasses} glasses · {GLASS_ML}ml each
      </p>
    </div>
  );
}
