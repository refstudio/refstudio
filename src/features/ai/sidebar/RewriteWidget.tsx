import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { VscChevronLeft, VscChevronRight } from 'react-icons/vsc';

import { askForRewrite, REWRITE_MANNER, RewriteOptions } from '../../../api/rewrite';
import { emitEvent } from '../../../events';
import { cx } from '../../../lib/cx';
import { getCachedSetting } from '../../../settings/settingsManager';

export function RewriteWidget({
  selection,
  className,
  onChoiceSelected,
}: {
  selection: string;
  className?: string;
  onChoiceSelected?: (choice: string) => void;
}) {
  const openAiSettings = getCachedSetting('openAI');

  const [rewriteOptions, setRewriteOptions] = useState<RewriteOptions>({
    nChoices: 3,
    manner: openAiSettings.manner,
    temperature: openAiSettings.temperature,
  });

  useEffect(() => {
    setRewriteOptions((state) => ({
      ...state,
      manner: openAiSettings.manner,
      temperature: openAiSettings.temperature,
    }));
  }, [openAiSettings.manner, openAiSettings.temperature]);

  const {
    error,
    data: rewrite,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: [selection, rewriteOptions],
    enabled: false,
    queryFn: () => askForRewrite(selection, rewriteOptions),
  });

  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState(0);

  const handleSelectChoice = useCallback(
    (choice: string) => {
      emitEvent('refstudio://ai/suggestion/insert', { text: choice });
      onChoiceSelected?.(choice);
    },
    [onChoiceSelected],
  );

  return (
    <div className={cx('flex flex-col gap-4 px-4', className)}>
      <div className="flex flex-col">
        <div className="border border-b-0 border-primary bg-slate-50 p-4">{selection}</div>
        <div className="flex w-full flex-wrap items-center justify-between gap-2 rounded-b-xl border border-t border-primary bg-primary/50 ">
          <div className="flex items-center gap-1 whitespace-nowrap">
            <select
              className="m-1 rounded-none"
              value={rewriteOptions.manner}
              onChange={(e) =>
                setRewriteOptions({ ...rewriteOptions, manner: e.currentTarget.value as RewriteOptions['manner'] })
              }
            >
              {REWRITE_MANNER.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <span>Creativity:</span>
            <input
              max={0.9}
              min={0.7}
              step={0.05}
              type="range"
              value={rewriteOptions.temperature}
              onChange={(e) => setRewriteOptions({ ...rewriteOptions, temperature: parseFloat(e.currentTarget.value) })}
            />
          </div>
          <button
            className="btn-primary grow rounded-l-none rounded-t-none"
            disabled={isFetching}
            onClick={() => void refetch()}
          >
            REWRITE
          </button>
        </div>
      </div>
      {isFetching && <span>Processing...</span>}
      {!isFetching && !!error && <span className="bg-red-50 p-4">{String(error)}</span>}
      {!isFetching && rewrite?.ok === false && <span className="bg-red-50 p-4">{rewrite.message}</span>}
      {rewrite?.ok && (
        <div className="flex flex-col rounded-xl rounded-t-none border-primary bg-primary/50">
          <div className="m-1 flex items-center justify-between p-2">
            <div>
              <strong>Rewrite Choices</strong>
              <small className="block text-muted">
                Showing rewrite option {selectedChoiceIndex + 1} of {rewrite.choices.length}.
              </small>
            </div>
            <div className="flex items-center gap-1 text-primary-hover">
              <VscChevronLeft
                className="cursor-pointer border border-primary hover:bg-primary-hover hover:text-primary"
                size={20}
                onClick={() => setSelectedChoiceIndex(decRotate(selectedChoiceIndex, rewrite.choices))}
              />
              <VscChevronRight
                className="cursor-pointer border border-primary hover:bg-primary-hover hover:text-primary"
                size={20}
                onClick={() => setSelectedChoiceIndex(incRotate(selectedChoiceIndex, rewrite.choices))}
              />
            </div>
          </div>
          <div className="border border-green-100 bg-green-50 p-2">{rewrite.choices[selectedChoiceIndex]}</div>
          <button
            className="btn-primary rounded-t-none"
            onClick={() => handleSelectChoice(rewrite.choices[selectedChoiceIndex])}
          >
            REPLACE
          </button>
        </div>
      )}
    </div>
  );
}

function decRotate(index: number, data: unknown[]) {
  return (index + data.length - 1) % data.length;
}

function incRotate(index: number, data: unknown[]) {
  return (index + 1) % data.length;
}
