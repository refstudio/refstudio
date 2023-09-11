import { useState } from 'react';
import { Tooltip } from 'react-tooltip';

import { ArrowLeftIcon, ArrowRightIcon } from '../../application/sidebar/icons';
import { Button } from '../../components/Button';
import { emitEvent } from '../../events';
import { cx } from '../../lib/cx';
import { CopyIcon } from './icons';

interface RewriteSuggestionsViewProps {
  className?: string;
  suggestions: string[];
  onGoBack: () => void;
}
export function RewriteSuggestionsView({ className, suggestions, onGoBack }: RewriteSuggestionsViewProps) {
  const [index, setIndex] = useState(0);
  const [isTooltipOpen, setTooltipOpen] = useState(false);

  return (
    <div className={cx('flex h-full w-full flex-col items-stretch gap-6 p-4 pt-2', className)}>
      <div className="flex flex-1 flex-col items-stretch gap-2 overflow-hidden">
        <div className="flex select-none items-start gap-1 text-side-bar-txt-secondary">
          <h2 className="text-side-bar-txt flex-1">Pick Variation</h2>
          <div
            className="cursor-pointer"
            onClick={() => setIndex((suggestions.length + index - 1) % suggestions.length)}
          >
            <ArrowLeftIcon />
          </div>
          {index + 1}/{suggestions.length}
          <div className="cursor-pointer" onClick={() => setIndex((index + 1) % suggestions.length)}>
            <ArrowRightIcon />
          </div>
        </div>
        <div className="flex flex-col items-end justify-end gap-4 rounded bg-input-bg-disabled p-4">
          <div className="overflow-y-auto">{suggestions[index]}</div>
          <button
            className="text-side-bar-ico-default"
            id="copy-button"
            onClick={() => {
              void navigator.clipboard.writeText(suggestions[index]).then(() => {
                setTooltipOpen(true);
                setTimeout(() => {
                  setTooltipOpen(false);
                }, 2000);
              });
            }}
          >
            <CopyIcon />
          </button>
          <Tooltip
            anchorSelect="#copy-button"
            className={cx('z-tooltip flex flex-col items-stretch rounded bg-pop-up-message-bg px-2 py-1', {
              '!visible !opacity-100 !transition-all !duration-0': isTooltipOpen,
              '!invisible !opacity-0 !transition-tooltip !duration-200 !ease-linear': !isTooltipOpen,
            })}
            classNameArrow="w-2 h-2 rotate-45"
            delayHide={200}
            disableStyleInjection
            isOpen={true}
            opacity={100}
            place="bottom"
          >
            <div className="text-pop-up-message-txt">Variant copied</div>
          </Tooltip>
        </div>
      </div>
      <div className="flex flex-col items-stretch gap-2">
        <Button
          size="M"
          text="Insert"
          onClick={() => emitEvent('refstudio://ai/suggestion/insert', { text: suggestions[index] })}
        />
        <Button size="M" text="Back" type="secondary" onClick={onGoBack} />
      </div>
    </div>
  );
}
