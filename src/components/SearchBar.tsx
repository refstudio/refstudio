import { useRef, useState } from 'react';

import { useDebouncedCallback } from '../hooks/useDebouncedCallback';
import { cx } from '../lib/cx';
import { SearchIcon } from './icons';

interface SearchBarProps {
  initialValue?: string;
  fluid?: boolean;
  placeholder: string;
  onChange: (value: string) => void;
}
export function SearchBar({ initialValue, fluid, placeholder, onChange }: SearchBarProps) {
  const [value, setValue] = useState(initialValue);
  const debouncedOnChange = useDebouncedCallback(onChange, 200);
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div
      className={cx(
        'flex items-start gap-2 self-stretch rounded-default',
        'cursor-text border border-solid border-input-border-default p-3',
        {
          'w-full': fluid,
        },
      )}
      onClick={() => {
        inputRef.current?.focus();
      }}
    >
      <div className="text-input-ico-placeholder">
        <SearchIcon />
      </div>
      <input
        className="bg-transparent text-input-txt-primary outline-none placeholder:text-input-txt-placeholder"
        placeholder={placeholder}
        ref={inputRef}
        type="text"
        value={value}
        onChange={(evt) => {
          setValue(evt.target.value);
          debouncedOnChange(evt.target.value);
        }}
      />
    </div>
  );
}
