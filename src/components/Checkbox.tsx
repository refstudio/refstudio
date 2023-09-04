import { SelectedRadioIcon, UnselectedRadioIcon } from './icons';

interface RadioProps {
  checked: boolean;
  onChange: (newValue: boolean) => void;
}
export function Checkbox({ checked, onChange, ...rest }: RadioProps) {
  return (
    <div className="cursor-pointer" onClick={() => onChange(!checked)} {...rest}>
      <input checked={checked} className="hidden" role="checkbox" type="checkbox" />
      {checked ? (
        <div className="text-radio-active">
          <SelectedRadioIcon />
        </div>
      ) : (
        <UnselectedRadioIcon />
      )}
    </div>
  );
}
