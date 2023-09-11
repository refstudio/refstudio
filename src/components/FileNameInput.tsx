import { ChangeEvent, KeyboardEvent, useMemo, useState } from 'react';

import { autoFocusAndSelectWithSelectionRange } from '../lib/autoFocusAndSelect';
import { cx } from '../lib/cx';

interface FileNameInputProps {
  fileName: string;
  onCancel: () => void;
  onSubmit: (newValue: string) => void;
  isNameValid: (name: string) => boolean;
  className?: string;
}

export function FileNameInput({ className, fileName, isNameValid, onCancel, onSubmit }: FileNameInputProps) {
  const [value, setValue] = useState(fileName);
  const isValueValid = useMemo(() => value === fileName || isNameValid(value), [isNameValid, fileName, value]);

  const nameLength = useMemo(() => {
    const parts = fileName.split('.');
    const extensionLength = parts.length > 1 ? parts.pop()!.length + 1 : 0;

    return fileName.length - extensionLength;
  }, [fileName]);

  const focusAndSelect = useMemo(() => autoFocusAndSelectWithSelectionRange(0, nameLength), [nameLength]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => setValue(e.target.value);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.code === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      if (!isValueValid) {
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
      className={cx(
        'w-full border border-blue-400 outline-none',
        {
          'border-red-600': !isValueValid,
        },
        className,
      )}
      ref={focusAndSelect}
      role="textbox"
      value={value}
      onBlur={onCancel}
      onChange={handleChange}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={handleKeyDown}
    />
  );
}
