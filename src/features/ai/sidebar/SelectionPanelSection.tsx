import { useQuery } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import { VscChevronLeft, VscChevronRight } from 'react-icons/vsc';
import { useDebounce } from 'usehooks-ts';

import { askForRewrite, REWRITE_MANNER, RewriteOptions } from '../../../api/rewrite';
import { selectionAtom } from '../../../atoms/selectionState';
import { PanelSection } from '../../../components/PanelSection';
import { emitEvent } from '../../../events';
import { getCachedSetting } from '../../../settings/settingsManager';

export function SelectionPanelSection() {
  const selection = useAtomValue(selectionAtom);
  const debouncedSelection = useDebounce(selection, 200);

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
    queryKey: [debouncedSelection, rewriteOptions], // clear rewrite when the selection changes
    enabled: false,
    queryFn: () => askForRewrite(debouncedSelection, rewriteOptions),
  });

  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState('');

  useEffect(() => {
    if (rewrite && selectedChoiceIndex >= 0 && selectedChoiceIndex < rewrite.length) {
      setSelectedChoice(rewrite[selectedChoiceIndex]);
    }
  }, [rewrite, selectedChoiceIndex]);

  return (
    <PanelSection title="Selection">
      {!selection && <p className="mb-1 mt-4 px-4 italic">Select some text in the editor to see it here.</p>}

      {selection && (
        <div className="mb-6 flex flex-col gap-4 px-4">
          <div className="flex flex-col">
            <div className="border border-b-0 border-primary bg-slate-50 p-4">{debouncedSelection}</div>
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
                  onChange={(e) =>
                    setRewriteOptions({ ...rewriteOptions, temperature: parseFloat(e.currentTarget.value) })
                  }
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
            {/* <pre>{JSON.stringify(rewriteOptions, null, 2)}</pre> */}
          </div>
          {!!error && <span className="bg-red-50">{String(error)}</span>}
          {isFetching && <span>Processing...</span>}
          {rewrite && (
            <div className="flex flex-col rounded-xl rounded-t-none border-primary bg-primary/50">
              <div className="m-1 flex items-center justify-between p-2">
                <div>
                  <strong>Rewrite Choices</strong>
                  <small className="block text-muted">
                    Showing rewrite option {selectedChoiceIndex + 1} of {rewrite.length}.
                  </small>
                </div>
                <div className="flex items-center gap-1 text-primary-hover">
                  <VscChevronLeft
                    className="cursor-pointer border border-primary hover:bg-primary-hover hover:text-primary"
                    size={20}
                    onClick={() => setSelectedChoiceIndex((selectedChoiceIndex + rewrite.length - 1) % rewrite.length)}
                  />
                  <VscChevronRight
                    className="cursor-pointer border border-primary hover:bg-primary-hover hover:text-primary"
                    size={20}
                    onClick={() => setSelectedChoiceIndex((selectedChoiceIndex + 1) % rewrite.length)}
                  />
                </div>
              </div>
              <div className="border border-green-100 bg-green-50 p-2">{selectedChoice}</div>
              <button
                className="btn-primary rounded-t-none"
                onClick={() => emitEvent('refstudio://ai/suggestion/insert', { text: selectedChoice })}
              >
                REPLACE
              </button>
            </div>
          )}
        </div>
      )}
    </PanelSection>
  );
}
