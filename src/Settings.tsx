import { register, unregister } from '@tauri-apps/api/globalShortcut';
import { useEffect, useState } from 'react';

const SETTINGS_SHORTCUT = 'CmdOrControl+,';

export function Settings({ onToggle }: { onToggle(open: boolean): void }) {
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    (async function runAsync() {
      try {
        await unregister(SETTINGS_SHORTCUT);
        await register(SETTINGS_SHORTCUT, () => {
          setShowSettings(!showSettings);
        });
      } catch (err) {
        console.error('Cannot register settings shortcut:', err);
      }
    })();
  }, [showSettings]);

  useEffect(() => {
    onToggle(showSettings);
  }, [showSettings, onToggle]);

  if (!showSettings) {
    return null;
  }

  return (
    <div className="absolute left-0 top-0 block h-full w-full p-40">
      <div className="debug-blue h-full bg-white">SETTINGS</div>
    </div>
  );
}
