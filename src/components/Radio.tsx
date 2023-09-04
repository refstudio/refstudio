import { SelectedRadioIcon, UnselectedRadioIcon } from './icons';

interface RadioProps {
  checked: boolean;
  onChange: (newValue: boolean) => void;
}
export function Radio({ checked: value, onChange }: RadioProps) {
  return <div className='cursor-pointer' onClick={() => onChange(!value)}>
    {value ? <div className="text-radio-active"><SelectedRadioIcon /></div> : <UnselectedRadioIcon />}
  </div>;
}