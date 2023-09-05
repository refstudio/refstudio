import './Slider.css';

import { cx } from '../lib/cx';

interface SliderProps {
  fluid?: boolean;
  max: number;
  min: number;
  name: string;
  step: number;
  value: number;
  onChange: (newValue: number) => void;
}
export function Slider({ fluid, max, min, name, step, value, onChange, ...rest }: SliderProps) {
  return (
    <div className={cx('flex items-center py-2', { 'w-full': fluid })} {...rest}>
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
