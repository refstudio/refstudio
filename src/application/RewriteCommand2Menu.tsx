import { useAtomValue } from 'jotai';
import { CommandMenu, useCommands, useKmenu } from 'kmenu';
import { useCallback, useEffect, useState } from 'react';
import { VscFlame, VscMegaphone, VscRunAll, VscSettings, VscWarning } from 'react-icons/vsc';

import { askForRewrite } from '../api/rewrite';
import { selectionAtom } from '../atoms/selectionState';
import { emitEvent } from '../events';
import { getCachedSetting, getMannerOptions, OpenAiManner } from '../settings/settingsManager';

export function RewriteCommand2Menu({ index }: { index: number }) {
  const selection = useAtomValue(selectionAtom);
  const [commands] = useCommands([
    {
      category: 'Rewrite',
      commands: [],
    },
  ]);

  if (!selection) {
    return (
      <CommandMenu
        commands={commands}
        crumbs={['Rewrite']}
        index={index}
        loadingPlaceholder={
          <div className="flex items-center gap-2 bg-yellow-100/50 p-6">
            <VscWarning /> You need to <strong>select some text</strong> to use this command.
          </div>
        }
        loadingState
      />
    );
  }

  return <RewriteCommandMenuWithSelection index={index} selection={selection} />;
}

export function RewriteCommandMenuWithSelection({ index, selection }: { index: number; selection: string }) {
  const { setOpen } = useKmenu();
  const openAiSettings = getCachedSetting('openAI');
  const mannerOptions = getMannerOptions();
  const [mannerIndex, setMannerIndex] = useState(mannerOptions.indexOf(openAiSettings.manner));
  const [temperature, setTemperature] = useState(openAiSettings.temperature);

  const [choices, setChoices] = useState<string[]>([]);

  const handleMannerClick = useCallback(() => {
    setMannerIndex((idx) => (idx + 1) % getMannerOptions().length);
  }, []);

  const handleTemperatureClick = useCallback((temp: number) => {
    const nextTemp = temp + 0.05;
    setTemperature(nextTemp > 0.9 ? 0.7 : nextTemp);
  }, []);

  const handleAskForRewrite = useCallback(
    (_selection: string, _manner: OpenAiManner, _temperature: number) => {
      void askForRewrite(_selection, {
        manner: _manner,
        temperature: _temperature,
      }).then((_choices) => {
        setChoices(_choices);
        setTimeout(() => setOpen(0, true), 10);
        setTimeout(() => setOpen(index, true), 15);
      });
      setChoices(['...', '...', '...']);
      setTimeout(() => setOpen(0, true), 10);
      setTimeout(() => setOpen(index, true), 15);
    },
    [index, setOpen],
  );

  const handleSelectChoice = useCallback((text: string) => {
    emitEvent('refstudio://ai/suggestion/insert', { text });
  }, []);

  return (
    <RewriteCommandMenuWithValues
      choices={choices}
      index={index}
      manner={mannerOptions[mannerIndex]}
      selection={selection}
      temperature={temperature}
      onAskForRewrite={handleAskForRewrite}
      onMannerClick={handleMannerClick}
      onSelectChoice={handleSelectChoice}
      onTemperatureClick={handleTemperatureClick}
    />
  );
}

export function RewriteCommandMenuWithValues({
  index,
  selection,
  manner,
  temperature,
  onMannerClick,
  onTemperatureClick,
  onAskForRewrite,
  choices,
  onSelectChoice,
}: {
  index: number;
  selection: string;
  manner: OpenAiManner;
  temperature: number;
  onMannerClick: (manner: OpenAiManner) => void;
  onTemperatureClick: (temperature: number) => void;
  onAskForRewrite: (selection: string, manner: OpenAiManner, temperature: number) => void;
  choices: string[];
  onSelectChoice: (choice: string) => void;
}) {
  const { open, setOpen } = useKmenu();
  console.log('RENDER: RewriteCommandMenuWithValues', open, index, manner, temperature);

  const [commands, setCommands] = useCommands([
    {
      category: 'Rewrite',
      commands: [],
    },
  ]);

  useEffect(() => {
    if (choices.length === 0) {
      return setCommands([
        {
          category: 'Rewrite',
          commands: [
            {
              text: 'Ask for rewrite',
              icon: <VscRunAll />,
              perform: () => {
                onAskForRewrite(selection, manner, temperature);
                setTimeout(() => setOpen(index, true), 11);
              },
            },
          ],
        },
        {
          category: 'Options',
          commands: [
            {
              text: `Manner: ${manner}`,
              icon: <VscMegaphone />,
              perform: () => {
                onMannerClick(manner);
                setTimeout(() => setOpen(index, true), 11);
              },
              closeOnComplete: false,
            },
            {
              text: `Creativity: ${temperature}`,
              icon: <VscFlame />,
              perform: () => {
                onTemperatureClick(temperature);
                setTimeout(() => setOpen(index, true), 11);
              },
              closeOnComplete: false,
            },
          ],
        },
      ]);
    }

    // Render choices
    return setCommands([
      {
        category: 'Choices',
        commands: choices.map((choice) => ({
          text: choice,
          icon: <VscSettings />,
          perform: () => onSelectChoice(choice),
        })),
      },
    ]);

    // NOTE: We can't add setCommands to the deps list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    index,
    setOpen,
    choices,
    onSelectChoice,
    onAskForRewrite,
    manner,
    temperature,
    onMannerClick,
    onTemperatureClick,
  ]);

  if (open !== index) {
    return null;
  }

  return <CommandMenu commands={commands} crumbs={['Rewrite']} index={index} />;
}

// const handleUpdateManner = useCallback(() => {
//   const mannerOptions = getMannerOptions();
//   const mIdx = mannerOptions.indexOf(manner);
//   const nextIdx = (mIdx + 1) % mannerOptions.length;
//   const nextManner = mannerOptions[nextIdx];
//   setCachedSetting('openAI.manner', nextManner);
//   setCommands(buildCommands(handleUpdateManner));
//   setOpen(index);
//   setManner(nextManner);
// }, [index, manner, setCommands]);
