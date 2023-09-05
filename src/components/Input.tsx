import { useRef, useState } from 'react';

import { cx } from '../lib/cx';
import { NotVisibleIcon, VisibleIcon } from './icons';

interface InputProps {
  disabled?: boolean;
  type?: 'text' | 'password';
  value: string;
  onChange: (newValue: string) => void;
}
export function Input({ disabled, type = 'text', value, onChange, ...rest }: InputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [hidden, setHidden] = useState(type === 'password');
  const [active, setActive] = useState(false);

  return (
    <div
      className={cx(
        'cursor-text',
        'box-border flex h-full w-full items-start justify-between p-3 pl-4',
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
      {...rest}
    >
      <input
        aria-disabled={disabled}
        className={cx('h-full w-full bg-transparent outline-none', {
          'text-input-txt-primary': !disabled,
          'text-input-txt-disabled': disabled,
        })}
        disabled={disabled}
        ref={inputRef}
        role="input"
        type={hidden ? 'password' : 'text'}
        value={value}
        onBlur={() => setActive(false)}
        onChange={(evt) => onChange(evt.target.value)}
        onFocus={() => setActive(true)}
      />
      {!disabled && type === 'password' && (
        <div className="cursor-pointer text-input-ico-placeholder" onClick={() => setHidden(!hidden)}>
          {hidden ? <NotVisibleIcon /> : <VisibleIcon />}
        </div>
      )}
    </div>
  );
}
