import { useState } from 'react';

import { Modal } from '../components/Modal';
import { useListenEvent } from '../hooks/useListenEvent';
import { cx } from '../lib/cx';

interface ShortcutSection {
  header: string;
  shortcuts: {
    label: string;
    keys: string[];
  }[];
}

const SHORTCUT_SECTIONS: ShortcutSection[] = [
  {
    header: 'File',
    shortcuts: [
      makeShortcut('Save File', ['⌘', 'S']), //
      makeShortcut('New File', ['⌘', 'N']),
      makeShortcut('Close Editor', ['⌘', 'W']),
    ],
  },
  {
    header: 'Application',
    shortcuts: [
      makeShortcut('Quick Actions', ['⌘', 'K']), //
      makeShortcut('Quick Files', ['⌘', 'P']),
      makeShortcut('Open References', ['⌘', 'R']),
      makeShortcut('Settings', ['⌘', ',']),
    ],
  },
  {
    header: 'View',
    shortcuts: [
      makeShortcut('Toggle Explorer Pane', ['⌘', '1']), //
      makeShortcut('Toggle References Pane', ['⌘', '2']),
      makeShortcut('Toggle Rewriter Pane', ['⌘', '9']),
      makeShortcut('Toggle Chatbot Pane', ['⌘', '0']),
    ],
  },
  {
    header: 'AI Tools',
    shortcuts: [
      makeShortcut('AI Text Completion', ['⌘', 'J']), //
    ],
  },
  {
    header: 'Editor',
    shortcuts: [
      makeShortcut('Standard text edit shortcuts (bold, italic, ...)', []), //
      makeShortcut('Standard markdown shortcuts', []), //
      makeShortcut('References citation interaction', ['[']),
      makeShortcut('Select aditional reference (inside citation)', ['@']),
      makeShortcut('Creates a collapsible section', ['>', '␣']),
      makeShortcut('Indent editor block', ['TAB']),
      makeShortcut('Toggle block navigation', ['ESC']),
    ],
  },
];

function makeShortcut(label: string, keys: string[]) {
  return {
    label,
    keys,
  };
}

export function KeyboardShortcutsModal() {
  const [isVisible, setVisible] = useState(false);
  useListenEvent('refstudio://menu/view/keyboard-shortcuts', () => setVisible(true));

  return (
    <Modal
      className="max-h-full w-[1000px] bg-white text-modal-txt-primary"
      open={isVisible}
      onClose={() => setVisible(false)}
    >
      <div className="flex w-full flex-col gap-1">
        <h1 className="border-b-2 p-4">Keyboard Shortcuts</h1>
        <div className="flex max-h-[700px] flex-col flex-wrap gap-6 p-4">
          {SHORTCUT_SECTIONS.map((section) => (
            <SectionPane key={section.header} section={section} />
          ))}
        </div>
      </div>
    </Modal>
  );
}

function SectionPane({ section }: { section: ShortcutSection }) {
  return (
    <div className="min-w-[250px] rounded border border-modal-border" key={section.header}>
      <div className="bg-modal-border px-4 py-3 font-bold">{section.header}</div>
      <div className="flex flex-col">
        {section.shortcuts.map((shortcut) => (
          <div
            className="flex items-center justify-between gap-2 border-t border-modal-border px-4 py-3"
            key={shortcut.label}
          >
            <div className="">{shortcut.label}</div>
            <div className="flex gap-1">
              {shortcut.keys.map((key) => (
                <kbd
                  className={cx(
                    'flex h-8 w-8 items-center justify-center rounded-default bg-modal-border',
                    'font-default text-xs font-medium',
                  )}
                  key={key}
                >
                  {key}
                </kbd>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
