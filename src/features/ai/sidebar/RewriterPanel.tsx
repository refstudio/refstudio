import { useQuery } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import { useDebounce } from 'usehooks-ts';

import { askForRewrite } from '../../../api/rewrite';
import { RewriteOptions } from '../../../api/rewrite.config';
import { selectionAtom } from '../../../atoms/selectionState';
import { PanelWrapper } from '../../../components/PanelWrapper';
import { cx } from '../../../lib/cx';
import { getCachedSetting } from '../../../settings/settingsManager';
import { RewriteOptionsView } from '../../components/RewriteOptionsView';
import { RewriteSuggestionsView } from '../../components/RewriteSuggestionsView';

export function RewriterPanel({ debounceMs = 200 }: { debounceMs?: number }) {
  const selection = useAtomValue(selectionAtom);
  const debouncedSelection = useDebounce(selection, debounceMs);

  const openAiSettings = {
    manner: getCachedSetting('openai_manner'),
    temperature: getCachedSetting('openai_temperature'),
  };

  const [rewriteOptions, setRewriteOptions] = useState<Required<RewriteOptions>>({
    nChoices: 3,
    manner: openAiSettings.manner,
    temperature: openAiSettings.temperature,
  });
  const [step, setStep] = useState<'options' | 'suggestions'>('options');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    setRewriteOptions((state) => ({
      ...state,
      manner: openAiSettings.manner,
      temperature: openAiSettings.temperature,
    }));
  }, [openAiSettings.manner, openAiSettings.temperature]);

  const {
    data: rewrite,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: [debouncedSelection, rewriteOptions],
    enabled: false,
    queryFn: () => askForRewrite(debouncedSelection, rewriteOptions),
  });

  useEffect(() => {
    if (rewrite?.ok) {
      setStep('suggestions');
      setSuggestions(rewrite.choices);
    }
  }, [rewrite]);

  return (
    <PanelWrapper title="Rewriter">
      <div className="relative flex-1 self-stretch">
        <RewriteOptionsView
          className={cx('absolute transition-position duration-200 ease-in-out', {
            'left-0': step === 'options',
            '-left-full': step !== 'options',
          })}
          isFetching={isFetching}
          options={rewriteOptions}
          rewriteSelection={() => void refetch()}
          selection={debouncedSelection}
          onChange={setRewriteOptions}
        />
        <RewriteSuggestionsView
          className={cx('absolute transition-position duration-200 ease-in-out', {
            'left-0': step === 'suggestions',
            'left-full': step !== 'suggestions',
          })}
          suggestions={suggestions}
          onGoBack={() => setStep('options')}
        />
      </div>
    </PanelWrapper>
  );
}
