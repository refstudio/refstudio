import { MouseEventHandler } from 'react';

import { cx } from '../lib/cx';

interface ButtonProps {
  Action?: React.ReactElement;
  actionPosition?: 'left' | 'right';
  alignment?: 'left' | 'center';
  className?: string;
  disabled?: boolean;
  fluid?: boolean;
  size?: 'S' | 'M';
  text: string;
  type?: 'primary' | 'secondary';
  inheritColor?: boolean;
  submit?: boolean;
  title?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}
export function Button({
  Action,
  actionPosition = 'left',
  alignment = 'center',
  className,
  disabled,
  fluid,
  size = 'S',
  text,
  type = 'primary',
  inheritColor = false,
  submit = false,
  title,
  onClick,
  ...rest
}: ButtonProps) {
  return (
    <button
      aria-disabled={disabled}
      className={cx(
        'flex items-center rounded-default px-2 py-2',
        {
          'w-full': fluid,
        },
        {
          'justify-start': alignment === 'left',
          'justify-center': alignment === 'center',
        },
        {
          'gap-2 px-5 py-3': size === 'M',
          'gap-1 px-2 py-1': size === 'S',
        },
        {
          'pl-3': !!Action && actionPosition === 'left',
          'pr-3': !!Action && actionPosition === 'right',
          'pl-1': !!Action && actionPosition === 'left' && size === 'S',
          'pr-1 ': !!Action && actionPosition === 'right' && size === 'S',
        },
        {
          'bg-btn-bg-primary-default text-btn-txt-primary-default': !inheritColor && type === 'primary',
          'bg-btn-bg-primary-disabled text-btn-txt-primary-disabled': !inheritColor && disabled && type === 'primary',
          'bg-btn-bg-primary-default': inheritColor && type === 'primary',
        },
        {
          'bg-btn-bg-secondary-default text-btn-txt-secondary-default': !inheritColor && type === 'secondary',
          'bg-btn-bg-secondary-disabled text-btn-txt-secondary-disabled':
            !inheritColor && disabled && type === 'secondary',
          'bg-btn-bg-secondary-default': inheritColor && type === 'secondary',
        },
        className,
      )}
      role="button"
      title={title}
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
