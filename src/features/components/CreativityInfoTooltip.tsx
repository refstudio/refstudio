import { Tooltip } from 'react-tooltip';

import { cx } from '../../lib/cx';
import { InfoIcon } from './icons';

export function CreativityInfoTooltip({ id }: { id: string }) {
  return (
    <div>
      <div className="text-btn-ico-tool-active" id={id}>
        <InfoIcon />
      </div>
      <Tooltip
        anchorSelect={`#${id}`}
        className={cx(
          'rounded flex flex-col items-stretch px-4 py-3 relative z-tooltip',
          'max-w-[16rem] bg-pop-up-message-bg -translate-x-6',
        )}
        classNameArrow='translate-x-6 w-2 h-2 rotate-45'
        clickable
        disableStyleInjection
        opacity={100}
        openOnClick
        positionStrategy="fixed"
      >
        <div className="text-pop-up-message-txt">
          Control how closely the rewritten text is to the original — lower for more accuracy, higher for more
          variation.
        </div>
      </Tooltip>
    </div>
  );
}
