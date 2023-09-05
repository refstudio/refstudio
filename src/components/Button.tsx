import { MouseEventHandler } from 'react';

import { cx } from '../lib/cx';

interface ButtonProps {
  Action?: React.ReactElement;
  actionPosition?: 'left' | 'right';
  className?: string;
  disabled?: boolean;
  size?: 'S' | 'M';
  text: string;
  type?: 'primary' | 'secondary';
  submit?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}
export function Button({
  Action,
  actionPosition = 'left',
  className,
  disabled,
  size = 'S',
  text,
  type = 'primary',
  submit = false,
  onClick,
}: ButtonProps) {
  return (
    <button
      className={cx(
        'flex w-full items-center gap-2 rounded-default px-2 py-2',
        {
          'justify-center px-5 py-3': size === 'M',
        },
        {
          'pl-3': !!Action && actionPosition === 'left',
          'pr-3': !!Action && actionPosition === 'right',
        },
        {
          'bg-btn-bg-primary-default text-btn-txt-primary-default': type === 'primary',
          'bg-btn-bg-primary-disabled text-btn-txt-primary-disabled': disabled && type === 'primary',
        },
        {
          'bg-btn-bg-secondary-default text-btn-txt-secondary-default': type === 'secondary',
          'bg-btn-bg-secondary-disabled text-btn-txt-secondary-disabled': disabled && type === 'secondary',
        },
        className,
      )}
      disabled={disabled}
      type={submit ? 'submit' : 'button'}
      onClick={disabled ? undefined : onClick}
    >
      {actionPosition === 'left' && Action}
      {text}
      {actionPosition === 'right' && Action}
    </button>
  );
}
