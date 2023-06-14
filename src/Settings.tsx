import { register, unregister } from '@tauri-apps/api/globalShortcut';
import { useEffect, useState } from 'react';
import { VscClose } from 'react-icons/vsc';

import { cx } from './cx';

// Tauri HOTKEYS
// https://github.com/tauri-apps/global-hotkey/blob/0b91f4beb998526103447d890ed8eeddc0397b7d/src/hotkey.rs#L164
const SETTINGS_SHORTCUT_TOGGLE = 'Cmd+,';
const SETTINGS_SHORTCUT_CLOSE = 'Esc';

export function Settings({ open = false, onToggle }: { open?: boolean; onToggle(open: boolean): void }) {
  const [pane, selectPane] = useState('user-account');

  useEffect(() => {
    (async function runAsync() {
      try {
        await unregister(SETTINGS_SHORTCUT_TOGGLE);
        await unregister(SETTINGS_SHORTCUT_CLOSE);
        await register(SETTINGS_SHORTCUT_TOGGLE, () => onToggle(!open));
        await register(SETTINGS_SHORTCUT_CLOSE, () => onToggle(false));
      } catch (err) {
        console.error('Cannot register settings shortcut:', err);
      }
    })();
  }, [onToggle, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed left-0 top-0 flex h-screen w-screen items-center justify-center">
      <div className="pointer-events-none absolute left-0 top-0 h-full w-full bg-slate-400/60" />
      <div
        className={cx(
          'relative h-[calc(100vh-300px)] w-[1150px] max-w-[calc(100vw-100px)] overflow-hidden',
          'rounded-xl border-none border-slate-500 bg-white shadow-xl shadow-slate-500',
          '',
        )}
      >
        <div className="flex h-full flex-row">
          <div className="w-52 bg-slate-100 p-6">
            <div className="mb-10 space-y-1">
              <strong>USER</strong>
              <SettingsMenuItem activePane={pane} pane="user-account" text="My account" onClick={selectPane} />
            </div>
            <div className="space-y-1">
              <strong>PROJECT</strong>
              <SettingsMenuItem activePane={pane} pane="project-general" text="General" onClick={selectPane} />
              <SettingsMenuItem activePane={pane} pane="project-openai" text="Open AI" onClick={selectPane} />
            </div>
          </div>
          <div className="relative h-full w-full overflow-auto p-6">
            <VscClose
              className="absolute right-2 top-2 cursor-pointer rounded-lg p-1 hover:bg-slate-200"
              size={30}
              onClick={() => onToggle(false)}
            />
            {pane === 'user-account' && (
              <ToDoSettings header="Account" message="The user account settings will be configured here." />
            )}
            {pane === 'project-general' && (
              <ToDoSettings header="General" message="The project general settings will be configured here." />
            )}
            {pane === 'project-openai' && <OpenAiSettings />}
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsMenuItem({
  onClick,
  activePane,
  pane,
  text,
}: {
  pane: string;
  activePane: string;
  onClick(pane: string): void;
  text: string;
}) {
  const active = pane === activePane;
  return (
    <div
      className={cx('-mx-6 cursor-pointer px-6 py-1 hover:font-semibold', {
        'bg-slate-200 font-semibold': active, //
      })}
      onClick={() => onClick(pane)}
    >
      {text}
    </div>
  );
}

function SettingsPane({ header, children }: { header: string; children: React.ReactNode }) {
  return (
    <div className="">
      <strong className="mb-6 block border-b-2 border-b-slate-200 pb-1 text-2xl">{header}</strong>
      {children}
    </div>
  );
}

function ToDoSettings({ header, message }: { header: string; message: string }) {
  return (
    <SettingsPane header={header}>
      <em>{message}</em>
    </SettingsPane>
  );
}

function OpenAiSettings() {
  return (
    <SettingsPane header="Open AI">
      <form>
        <fieldset className="space-y-2">
          <label>API Key</label>
          <input className="w-full border px-2 py-0.5" />
          <p className="text-sm text-slate-500">
            You need to configure the API to use the <em>rewrite</em> and <em>chat</em> operations.
          </p>
        </fieldset>
      </form>
    </SettingsPane>
  );
}
