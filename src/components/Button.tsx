import { cx } from '../lib/cx';

interface ButtonProps {
  Action?: React.ReactElement;
  className?: string;
  disabled?: boolean;
  size?: 'M' | 'S';
  text: string;
  type?: 'primary' | 'secondary';
  onClick: () => void;
}
export function Button({ Action, className, disabled, size = 'S', text, type = 'primary', onClick }: ButtonProps) {
  return (
    <button
      className={cx(
        'flex w-full items-center gap-2 rounded-default p-2',
        {
          'justify-center p-3': size === 'M',
          'bg-btn-bg-primary-default text-btn-txt-primary-default': type === 'primary',
          'bg-btn-bg-secondary-default text-btn-txt-secondary-default': type === 'secondary',
          'bg-btn-bg-primary-disabled text-btn-txt-primary-disabled': disabled && type === 'primary',
          'bg-btn-bg-secondary-disabled text-btn-txt-secondary-disabled': disabled && type === 'secondary',
        },
        className,
      )}
      onClick={onClick}
    >
      {Action}
      {text}
    </button>
  );
}
