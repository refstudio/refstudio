import { Tooltip } from 'react-tooltip';

import { InfoIcon } from './icons';

export function CreativityInfoTooltip({ maxWidth, id }: { maxWidth?: number; id: string }) {
  return (
    <div className="text-btn-ico-tool-active">
      <div id={id}>
        <InfoIcon />
      </div>
      <Tooltip anchorSelect={`#${id}`} clickable>
        <div style={maxWidth ? { maxWidth } : {}}>
          Adjust the Creativity slider to control how closely the rewritten text sticks to the original—lower for more
          accuracy, higher for more variation.
        </div>
      </Tooltip>
    </div>
  );
}
