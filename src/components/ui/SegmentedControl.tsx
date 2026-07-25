interface SegmentedControlProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  id?: string;
}

/**
 * Pill-shaped segmented toggle control.
 * Used for: Macros/Micronutrients toggle, Vitamins/Minerals tabs, Today/Weekly/Monthly.
 */
export default function SegmentedControl({ options, value, onChange, id }: SegmentedControlProps) {
  return (
    <div className="segmented-control" id={id} role="tablist">
      {options.map(option => (
        <button
          key={option}
          role="tab"
          aria-selected={value === option}
          className={`segmented-btn ${value === option ? 'active' : ''}`}
          onClick={() => onChange(option)}
          id={id ? `${id}-${option.toLowerCase().replace(/\s+/g, '-')}` : undefined}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
