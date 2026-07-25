import { useEffect, useRef } from 'react';

interface ProgressRingProps {
  /** 0–100 */
  value: number;
  /** SVG ring size in px */
  size?: number;
  /** Ring stroke width */
  strokeWidth?: number;
  /** Ring color */
  color?: string;
  /** Track color */
  trackColor?: string;
  /** Content to render in the center */
  children?: React.ReactNode;
}

/**
 * SVG circular progress ring.
 * Used in Hero Score Card (Screen 1) and Overall Health Score (Screen 3).
 */
export default function ProgressRing({
  value,
  size = 120,
  strokeWidth = 10,
  color = 'var(--primary)',
  trackColor = 'rgba(255,255,255,0.2)',
  children,
}: ProgressRingProps) {
  const circleRef = useRef<SVGCircleElement>(null);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedValue = Math.min(Math.max(value, 0), 100);
  const offset = circumference - (clampedValue / 100) * circumference;

  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.style.strokeDashoffset = String(circumference);
      // Trigger reflow then animate
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (circleRef.current) {
            circleRef.current.style.transition = 'stroke-dashoffset 1s cubic-bezier(0.34, 1.56, 0.64, 1)';
            circleRef.current.style.strokeDashoffset = String(offset);
          }
        });
      });
    }
  }, [circumference, offset]);

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
        />
      </svg>
      {/* Center content */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {children}
      </div>
    </div>
  );
}
