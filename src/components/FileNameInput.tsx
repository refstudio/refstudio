import { ChangeEvent, KeyboardEvent, useCallback, useMemo, useState } from 'react';

import { cx } from '../lib/cx';


interface FileNameInputProps {
  fileName: string;
  onCancel: () => void;
  onSubmit: (newValue: string) => void;
}

export function FileNameInput({ fileName, onCancel, onSubmit }: FileNameInputProps) {
  const [value, setValue] = useState(fileName);

  const nameLength = useMemo(() => {
    const parts = fileName.split('.');
    const extensionLength = parts.length > 1 ? parts.pop()!.length + 1 : 0;

    return fileName.length - extensionLength;
  }, [fileName]);

  const focusAndSelect = useCallback((input: HTMLInputElement | null) => {
    input?.focus();
    input?.setSelectionRange(0, nameLength);
  }, [nameLength]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => setValue(e.target.value);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.code === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      if (value.length === 0) {
        return;
      } else if (value !== fileName) {
        onSubmit(value);
      } else {
        onCancel();
      }
    } else if (e.code === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      onCancel();
    }
  };

  return (
    <input
      className={cx('w-full !border-none', {
        'focus:border-red-600': value.length === 0,
      })}
      ref={focusAndSelect}
      value={value}
      onBlur={onCancel}
      onChange={handleChange}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={handleKeyDown}
    />
  );
}
