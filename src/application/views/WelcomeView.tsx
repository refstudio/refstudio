import { cx } from '../../lib/cx';
import { Logo } from './Logo';

export function WelcomeView() {
  return (
    <div className={cx('h-full w-full',
      'flex flex-col items-center justify-center gap-28',
      'py-6 pb-16 pt-0',
      'bg-grayscale-10',
      'select-none cursor-default',
    )}>
      <Logo />
      <div className="flex flex-row gap-20">
        <div className='flex flex-col gap-10 w-[16.5rem]'>
          <div className='flex flex-col gap-4 items-end'>
            <WelcomeViewShortcut keys={['⌘', 'N']} text="New File" />
            <WelcomeViewShortcut keys={['⌘', 'S']} text="Save File" />
          </div>
          <div className='flex flex-col gap-4 items-end'>
            <WelcomeViewShortcut keys={['⌘', 'J']} text="AI Text Completion" />
            {/* <WelcomeViewShortcut keys={['⌘', '?']} text="Repeat AI Rewriter" /> */}
          </div>
        </div>
        <div className="h-full w-[1px] bg-grayscale-20" />
        <div className='flex flex-col gap-10 w-[16.5rem]'>
          <div className='flex flex-col gap-4 items-end'>
            <WelcomeViewShortcut keys={['⌘', 'K']} text="Quick Actions" />
            <WelcomeViewShortcut keys={['⌘', 'P']} text="Quick Files" />
          </div>
          <div className='flex flex-col gap-4 items-end'>
            <WelcomeViewShortcut keys={['⌘', 'R']} text="Open References Table" />
            <WelcomeViewShortcut keys={['⌘', 'L']} text="Open Notifications" />
          </div>
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
function WelcomeViewShortcut({ text, keys }: Shortcut) {
  const keysWithSeparators = keys.reduce<(Key | Separator)[]>((prev, curr, index) => [...prev, ...(index > 0 ? [{ type: 'separator' as const }] : []), { type: 'key', value: curr }], []);
  return (
    <div className="flex flex-row justify-center items-center gap-4">
      <div>{text}</div>
      <div className="flex flex-row justify-center items-center gap-1 line-height" style={{ lineHeight: '150%' }}>
        {keysWithSeparators
          .map((key, index) => {
            if (key.type === 'separator') {
              return <div key={index}>+</div>;
            }
            return (
              <kbd className="flex justify-center items-center w-8 h-8 bg-grayscale-30 rounded text-base" key={key.value}>
                {key.value}
              </kbd>
            );
          })}
      </div>
    </div>
  );
}