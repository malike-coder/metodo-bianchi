import React from 'react';

interface SliderInputProps {
  id: string;
  label: string;
  description?: string;
  min?: number;
  max?: number;
  value: number;
  onChange: (value: number) => void;
}

export const SliderInput: React.FC<SliderInputProps> = ({
  id,
  label,
  description,
  min = 1,
  max = 5,
  value,
  onChange,
}) => {
  // Percentage for gradient fill
  const fillPercent = ((value - min) / (max - min)) * 100;

  return (
    <div className="bg-white/30 border border-[#D6D2CA] rounded-lg p-5 mb-5">
      {/* Header row: label + value badge */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <label
            htmlFor={id}
            className="block text-[#44403C] leading-snug cursor-pointer"
            style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem' }}
          >
            {label}
          </label>
          {description && (
            <p className="text-[#878179] text-sm mt-1 leading-relaxed">{description}</p>
          )}
        </div>
        {/* Value indicator */}
        <span
          className="shrink-0 min-w-[3rem] text-center bg-[#987557]/10 text-[#987557] border border-[#987557]/30 rounded-full px-3 py-1 text-sm font-medium font-sans"
          aria-label={`Valor: ${value} de ${max}`}
        >
          {value}/{max}
        </span>
      </div>

      {/* Range slider */}
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#987557]/40"
        style={{
          background: `linear-gradient(to right, #987557 ${fillPercent}%, #D6D2CA ${fillPercent}%)`,
          // Thumb styles via inline for cross-browser; Tailwind peer approach not available without plugin
          accentColor: '#987557',
        }}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={label}
      />

      {/* Min / Max labels */}
      <div className="flex justify-between mt-2">
        <span className="text-[0.7rem] text-[#878179] font-sans uppercase tracking-wider">{min}</span>
        <span className="text-[0.7rem] text-[#878179] font-sans uppercase tracking-wider">{max}</span>
      </div>
    </div>
  );
};

export default SliderInput;
