import { useEffect, useRef } from 'react';

interface ProgressBarProps {
  /** 0–100 completion % */
  value: number;
  /** Fill color */
  color?: string;
  /** Track height in px */
  height?: number;
  /** Optional animation delay ms */
  delay?: number;
}

/**
 * Animated horizontal progress bar.
 * Used across macro cards, micronutrient rows, and health system rows.
 */
export default function ProgressBar({ value, color = 'var(--primary)', height = 6, delay = 0 }: ProgressBarProps) {
  const fillRef = useRef<HTMLDivElement>(null);
  const clampedValue = Math.min(Math.max(value, 0), 100);

  useEffect(() => {
    if (!fillRef.current) return;
    fillRef.current.style.width = '0%';

    const timer = setTimeout(() => {
      if (fillRef.current) {
        fillRef.current.style.transition = `width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms`;
        fillRef.current.style.width = `${clampedValue}%`;
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [clampedValue, delay]);

  return (
    <div
      className="progress-track"
      style={{ height }}
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        ref={fillRef}
        className="progress-fill"
        style={{ backgroundColor: color, width: 0 }}
      />
    </div>
  );
}
