import { useState } from 'react';

import { ArrowLeftIcon, ArrowRightIcon } from '../../application/sidebar/icons';
import { Button } from '../../components/Button';
import { emitEvent } from '../../events';
import { cx } from '../../lib/cx';

interface RewriteSuggestionsViewProps {
  className?: string;
  suggestions: string[];
  onGoBack: () => void;
}
export function RewriteSuggestionsView({ className, suggestions, onGoBack }: RewriteSuggestionsViewProps) {
  const [index, setIndex] = useState(0);

  return (
    <div className={cx('flex h-full w-full flex-col items-stretch gap-6 p-4 pt-2', className)}>
      <div className="flex flex-1 flex-col items-stretch gap-2 overflow-scroll">
        <div className="flex select-none items-start gap-1 text-btn-ico-side-bar-icon-hover">
          <h2 className="flex-1 text-side-bar-txt">Pick Variation</h2>
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
        <div className="flex items-start justify-between rounded-default bg-input-bg-disabled p-4">
          {suggestions[index]}
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