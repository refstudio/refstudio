import { Tooltip } from 'react-tooltip';

import { cx } from '../../lib/cx';
import { InfoIcon } from './icons';

export function CreativityInfoTooltip({ id }: { id: string }) {
  return (
    <div>
      <div className="text-btn-bg-info-pop-up" id={id}>
        <InfoIcon />
      </div>
      <Tooltip
        anchorSelect={`#${id}`}
        className={cx(
          'relative z-tooltip flex flex-col items-stretch rounded px-4 py-3',
          'max-w-[16rem] bg-pop-up-message-bg',
        )}
        classNameArrow="w-2 h-2 rotate-45"
        clickable
        delayShow={100}
        disableStyleInjection
        opacity={100}
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
