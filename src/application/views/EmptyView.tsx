import { useAtom, useAtomValue } from 'jotai';

import { isProjectOpenAtom } from '../../atoms/projectState';
import { welcomeTipDismissedAtom } from '../../atoms/welcomeViewState';
import { Button } from '../../components/Button';
import { CloseIcon, OpenIcon } from '../../components/icons';
import { emitEvent } from '../../events';
import { cx } from '../../lib/cx';
import { AddIcon, SampleIcon } from '../components/icons';
import { Logo } from './Logo';

export function EmptyView() {
  const isProjectOpen = useAtomValue(isProjectOpenAtom);

  return (
    <div
      className={cx(
        'h-full w-full p-10',
        'flex flex-row items-stretch gap-10',
        'bg-content-area-bg-primary',
        'cursor-default select-none',
      )}
    >
      {isProjectOpen ? <div className="w-72" /> : <WelcomeActions />}
      <div className={cx('flex flex-col items-center justify-center gap-[4.5rem]', 'flex-1 px-6 pb-16 pt-0')}>
        <Logo />
        <div className="flex flex-col items-end gap-4">
          <EmptyViewShortcut keys={['⌘', 'N']} text="New File" />
          <EmptyViewShortcut keys={['⌘', 'S']} text="Save File" />
          <EmptyViewShortcut keys={['⌘', 'J']} text="AI Text Completion" />
          {/* <WelcomeViewShortcut keys={['⌘', '?']} text="Repeat AI Rewriter" /> */}
          <EmptyViewShortcut keys={['⌘', 'K']} text="Quick Actions" />
          <EmptyViewShortcut keys={['⌘', 'P']} text="Quick Files" />
        </div>
      </div>
      <div className="w-72" />
    </div>
  );
}

interface Key {
  type: 'key';
  value: string;
}
interface Separator {
  type: 'separator';
}

interface Shortcut {
  keys: string[];
  text: string;
}
function EmptyViewShortcut({ text, keys }: Shortcut) {
  const keysWithSeparators = keys.reduce<(Key | Separator)[]>(
    (prev, curr, index) => [
      ...prev,
      ...(index > 0 ? [{ type: 'separator' as const }] : []),
      { type: 'key', value: curr },
    ],
    [],
  );
  return (
    <div className="flex flex-row items-center justify-center gap-4">
      <div>{text}</div>
      <div className="line-height flex flex-row items-center justify-center gap-1" style={{ lineHeight: '150%' }}>
        {keysWithSeparators.map((key, index) => {
          if (key.type === 'separator') {
            return <div key={index}>+</div>;
          }
          return (
            <kbd
              className={cx(
                'flex h-8 w-8 items-center justify-center rounded-default bg-content-area-bg-secondary',
                'font-default text-base/4 font-medium text-content-area-txt',
              )}
              key={key.value}
            >
              {key.value}
            </kbd>
          );
        })}
      </div>
    </div>
  );
}

function WelcomeActions() {
  const [welcomeTipDismissed, setWelcomeTipDismissed] = useAtom(welcomeTipDismissedAtom);

  return (
    <div className="flex w-72 flex-col items-stretch gap-10">
      <div className="flex flex-col items-start gap-4">
        <h1 className="text-card-txt-primary">Welcome to refstudio</h1>
        <div className="flex flex-col items-center gap-2 self-stretch">
          <Button
            Action={<AddIcon />}
            text="Create Project"
            onClick={() => emitEvent('refstudio://menu/file/project/new')}
          />
          <Button
            Action={<OpenIcon />}
            text="Open Project"
            type="secondary"
            onClick={() => emitEvent('refstudio://menu/file/project/open')}
          />
        </div>
      </div>
      {!welcomeTipDismissed && (
        <div
          className={cx(
            'flex flex-col items-stretch gap-6 p-4',
            'rounded-default bg-card-bg-secondary',
            'border-t-[0.25rem] border-t-card-bg-header',
          )}
        >
          <div className="flex items-start gap-2">
            <h1 className="flex-1 text-card-txt-primary">Tip & Tricks</h1>
            <div className="text cursor-pointer text-card-ico-primary" onClick={() => setWelcomeTipDismissed(true)}>
              <CloseIcon />
            </div>
          </div>
          <div className="flex flex-col items-stretch gap-1">
            <div className="text-xl/6 font-bold text-card-txt-primary">Are you new to RefStudio?</div>
            <div className="text-card-txt-primary">Learn more by playing with a sample project.</div>
          </div>
          <Button
            Action={<SampleIcon />}
            text="Open Sample"
            onClick={() => emitEvent('refstudio://menu/file/project/new/sample')}
          />
        </div>
      )}
    </div>
  );
}
