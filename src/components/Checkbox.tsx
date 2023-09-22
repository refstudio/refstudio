import { cx } from '../lib/cx';
import { SelectedRadioIcon, UnselectedRadioIcon } from './icons';

interface RadioProps {
  checked: boolean;
  disabled?: boolean;
  onChange: (newValue: boolean) => void;
}
export function Checkbox({ checked, disabled, onChange, ...rest }: RadioProps) {
  return (
    <div
      className={cx('cursor-pointer', {
        'pointer-events-none': disabled,
      })}
      onClick={() => onChange(!checked)}
      {...rest}
    >
      <input checked={checked} className="hidden" disabled={disabled} readOnly role="checkbox" type="checkbox" />
      {checked ? (
        <div
          className={cx({
            'text-radio-active': !disabled,
            'text-txt-muted': disabled,
          })}
        >
          <SelectedRadioIcon />
        </div>
      ) : (
        <UnselectedRadioIcon />
      )}
    </div>
  );
}
