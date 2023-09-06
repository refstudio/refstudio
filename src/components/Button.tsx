import { MouseEventHandler } from 'react';

import { cx } from '../lib/cx';

interface ButtonProps {
  Action?: React.ReactElement;
  actionPosition?: 'left' | 'right';
  className?: string;
  disabled?: boolean;
  fluid?: boolean;
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
  fluid,
  size = 'S',
  text,
  type = 'primary',
  submit = false,
  onClick,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cx(
        'flex items-center gap-2 rounded-default px-2 py-2',
        {
          'w-full': fluid,
        },
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
      role="button"
      type={submit ? 'submit' : 'button'}
      onClick={disabled ? undefined : onClick}
      {...rest}
    >
      {actionPosition === 'left' && Action}
      {text}
      {actionPosition === 'right' && Action}
    </button>
  );
}
