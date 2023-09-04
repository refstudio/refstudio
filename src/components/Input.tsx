import { useRef, useState } from 'react';

import { cx } from '../lib/cx';
import { NotVisibleIcon, VisibleIcon } from './icons';

interface InputProps {
  disabled?: boolean;
  type?: 'text' | 'password';
  value: string;
  onChange: (newValue: string) => void;
}
export function Input({ disabled, type = 'text', value, onChange }: InputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [hidden, setHidden] = useState(type === 'password');
  const [active, setActive] = useState(false);

  return <div
    className={cx(
      'cursor-text',
      'flex w-full h-full p-3 pl-4 justify-between items-start box-border',
      'rounded-default border border-solid',
      {
        'bg-input-bg-default': !disabled,
        'border-input-border-disabled bg-input-bg-disabled': disabled,
        'border-input-border-default': !active && !disabled,
        'border-input-border-active': active,
      },
    )}
    onClick={() => inputRef.current?.focus()}
    onFocus={() => inputRef.current?.focus()}
  >
    <input
      aria-disabled={disabled}
      className={cx(
        'w-full h-full outline-none bg-transparent',
        {
          'text-input-txt-primary': !disabled,
          'text-input-txt-disabled': disabled,
        },
      )}
      disabled={disabled}
      ref={inputRef}
      type={hidden ? 'password' : 'text'}
      value={value}
      onBlur={() => setActive(false)}
      onChange={(evt) => onChange(evt.target.value)}
      onFocus={() => setActive(true)}
    />
    {!disabled && type === 'password' && <div className='text-input-ico-placeholder cursor-pointer' onClick={() => setHidden(!hidden)}>
      {hidden ? <NotVisibleIcon /> : <VisibleIcon />}
    </div>}
  </div>;
}