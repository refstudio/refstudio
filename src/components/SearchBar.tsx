import { useState } from 'react';

import { useDebouncedCallback } from '../hooks/useDebouncedCallback';
import { SearchIcon } from './icons';

interface SearchBarProps {
  placeholder: string;
  onChange: (value: string) => void;
}
export function SearchBar({ placeholder, onChange }: SearchBarProps) {
  const [value, setValue] = useState('');
  const debouncedOnChange = useDebouncedCallback(onChange, 200);

  return (
    <div className="flex items-start gap-2 self-stretch rounded-default border border-solid border-input-border p-3">
      <div className="text-input-ico-placeholder">
        <SearchIcon />
      </div>
      <input
        className="text-input-txt-primary outline-none placeholder:text-input-txt-placeholder"
        placeholder={placeholder}
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
