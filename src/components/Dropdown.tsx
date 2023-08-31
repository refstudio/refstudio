import { useCallback, useMemo, useState } from 'react';

import { cx } from '../lib/cx';
import { ChevronDownIcon, ChevronUpIcon } from './icons';

interface DropdownProps<T> {
  disabled?: boolean;
  options: T[] | { value: T; name: string }[];
  value?: T;
  onChange: (newValue: T) => void;
}
export function Dropdown<T extends string>({ disabled, options, value, onChange }: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const handleClick = useCallback(
    (option: T) => {
      setOpen(false);
      onChange(option);
    },
    [onChange],
  );
  const selectedOptionName = useMemo(() => {
    if (options.length > 0) {
      if (typeof options[0] === 'string') {
        return value;
      }
      const selectedOption = (options as { value: T; name: string }[]).find((option) => option.value === value);
      if (selectedOption) {
        return selectedOption.name;
      }
    }

    return 'Invalid value';
  }, [options, value]);

  return (
    <div className="flex w-full flex-col gap-1 items-stretch select-none">
      <div
        className={cx(
          'flex items-start justify-between rounded-default border border-solid p-3 pl-4',
          'cursor-pointer',
          {
            'bg-input-bg-default': !disabled,
            'bg-input-bg-disabled': disabled,
          },
          {
            'text-input-txt-primary': !disabled,
            'text-input-txt-disabled': disabled,
          },
          {
            'border-input-border': !open,
            'border-input-bg-action': !disabled && open,
          },
        )}
        onClick={() => !disabled && setOpen(!open)}
      >
        {selectedOptionName}
        <div className={cx({ 'text-input-ico-primary': !disabled, 'text-input-ico-placeholder': disabled })}>
          {open ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </div>
      </div>
      {!disabled && open && (
        <div className="relative">
          <div className={cx(
            'absolute w-full flex p-2 flex-col items-stretch gap-2 z-dropdown',
            'rounded-default border border-solid border-input-border bg-input-bg-default',
          )}>
            {options.map((option) => {
              const name = typeof option === 'string' ? option : option.name;
              const val = typeof option === 'string' ? option : option.value;
              return (
                <div
                  className={cx(
                    'cursor-pointer flex px-2 py-1 items-center gap-1',
                    'rounded-default hover:bg-btn-bg-side-bar-item-hover',
                  )}
                  key={val}
                  onClick={() => handleClick(val)}
                >
                  {name}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
