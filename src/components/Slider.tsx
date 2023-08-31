import './Slider.css';

import { cx } from '../lib/cx';

interface SliderProps {
  className?: string;
  max: number;
  min: number;
  name: string;
  step: number;
  value: number;
  onChange: (newValue: number) => void;
}
export function Slider({ className, max, min, name, step, value, onChange }: SliderProps) {
  return (
    <div className={cx('flex items-center py-2', className)}>
      <input
        aria-label={name}
        aria-valuemax={max}
        aria-valuemin={min}
        aria-valuenow={value}
        className="slider"
        max={max}
        min={min}
        name={name}
        role="slider"
        step={step}
        style={{
          backgroundSize: `${((value - min) * 100) / (max - min)}% 100%`,
        }}
        type="range"
        value={value}
        onChange={(e) => onChange(parseFloat(e.currentTarget.value))}
      />
    </div>
  );
}
