
import { cx } from '../../lib/cx';
import { Logo } from './Logo';

export function EmptyView() {
  return (
    <div
      className={cx(
        'h-full w-full p-10',
        'flex flex-row items-stretch gap-10',
        'bg-content-area-bg-primary',
        'cursor-default select-none',
      )}
    >
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
