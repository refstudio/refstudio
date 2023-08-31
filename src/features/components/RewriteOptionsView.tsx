import { Tooltip } from 'react-tooltip';

import { REWRITE_MANNER, RewriteOptions } from '../../api/rewrite.config';
import { Button } from '../../components/Button';
import { Dropdown } from '../../components/Dropdown';
import { Slider } from '../../components/Slider';
import { cx } from '../../lib/cx';
import { InfoIcon, SpinnerIcon } from './icons';

interface RewriteOptionsViewProps {
  className?: string;
  isFetching: boolean;
  options: Required<RewriteOptions>;
  selection: string;
  onChange: (updatedOptions: Required<RewriteOptions>) => void;
  rewriteSelection: () => void;
}
export function RewriteOptionsView({
  className,
  isFetching,
  options,
  selection,
  onChange,
  rewriteSelection,
}: RewriteOptionsViewProps) {
  return (
    <div className={cx('h-full w-full flex flex-col items-start p-4 pt-2', className)}>
      <div className="flex flex-1 flex-col items-start gap-6 self-stretch text-side-bar-txt overflow-scroll">
        <div className="flex flex-col items-start gap-2 self-stretch">
          <h2 className='select-none cursor-default'>Text Selection</h2>
          <div
            className={cx(
              'flex h-[9.5rem] items-center justify-center gap-2 p-4',
              'self-stretch rounded-default bg-input-bg-disabled',
            )}
          >
            {selection.length > 0 ? (
              <div className="line-clamp-5">{selection}</div>
            ) : (
              <div className="line-clamp-5 text-center">Select some text in the editor to see it here.</div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-start gap-2 self-stretch select-none cursor-default">
          <h2>Speech Type</h2>
          <Dropdown
            aria-label="manner"
            options={REWRITE_MANNER.map(manner => ({
              name: manner.charAt(0).toUpperCase() + manner.slice(1),
              value: manner,
            }))}
            value={options.manner}
            onChange={(manner: (typeof REWRITE_MANNER)[number]) => onChange({ ...options, manner })}
          />
        </div>
        <div className="flex flex-col items-start gap-2 self-stretch select-none cursor-default">
          <div className='flex items-start gap-1 self-stretch'>
            <h2>Creativity Level</h2>
            <InfoTooltip />
          </div>
          <Slider
            className='w-full'
            max={0.9}
            min={0.7}
            name="creativity"
            step={0.05}
            value={options.temperature}
            onChange={(temperature) => onChange({ ...options, temperature })}
          />
        </div>
      </div>
      <Button
        Action={isFetching ? <SpinnerIcon /> : undefined}
        actionPosition='right'
        disabled={selection.length === 0}
        size='M'
        text="Rewrite"
        onClick={() => !isFetching && rewriteSelection()}
      />
    </div>
  );
}

function InfoTooltip() {
  return <div className='text-btn-ico-tool-active'>
    <div id="info-icon"><InfoIcon /></div>
    {/* TODO: Get copy for tooltip */}
    <Tooltip anchorSelect='#info-icon' content="Temperature" />
  </div>;
}
