import { useState } from 'react';

import { Modal } from '../components/Modal';
import { useListenEvent } from '../hooks/useListenEvent';
import { cx } from '../lib/cx';

interface ModalTab {
  name: string;
  disabled?: boolean;
  groups: {
    header: string;
    shortcuts: {
      label: string;
      keys: string[];
    }[];
  }[];
}

const MODAL_TABS: ModalTab[] = [
  {
    name: 'Essentials',
    groups: [
      {
        header: 'File',
        shortcuts: [
          makeShortcut('Save File', ['⌘', 'S']), //
          makeShortcut('New File', ['⌘', 'N']),
        ],
      },
      {
        header: 'Quick Panes',
        shortcuts: [
          makeShortcut('Quick Actions', ['⌘', 'K']), //
          makeShortcut('Quick Files', ['⌘', 'P']),
        ],
      },
      {
        header: 'AI Tools',
        shortcuts: [
          makeShortcut('AI Text Completion', ['⌘', 'J']), //
        ],
      },
    ],
  },
  {
    name: 'Editor',
    disabled: true,
    groups: [],
  },
  {
    name: 'AI Tools',
    disabled: true,
    groups: [],
  },
  {
    name: 'File',
    disabled: true,
    groups: [],
  },
  {
    name: 'References',
    disabled: true,
    groups: [],
  },
  {
    name: 'View',
    disabled: true,
    groups: [],
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
  const [selectedTab, setSelectedTab] = useState(MODAL_TABS[0]);

  useListenEvent('refstudio://menu/view/keyboard-shortcuts', () => setVisible(true));

  return (
    <Modal
      className="hx-[568px] max-h-full w-[730px] max-w-[630px] bg-white text-modal-txt-primary"
      open={isVisible}
      onClose={() => setVisible(false)}
    >
      <div className="flex w-full flex-col gap-1">
        <Tabs selectedTab={selectedTab} onClick={setSelectedTab} />
        <KeysTabPane selectedTab={selectedTab} />
      </div>
    </Modal>
  );
}

function Tabs({ selectedTab, onClick }: { selectedTab: ModalTab; onClick: (tab: ModalTab) => void }) {
  return (
    <div>
      <div className="relative flex w-full pl-3 pt-1">
        {MODAL_TABS.map((tab) => (
          <div
            className={cx('px-4 py-3', {
              'font-bold': selectedTab.name === tab.name,
              'z-[1] border border-b border-modal-border border-b-white': selectedTab.name === tab.name,
              'cursor-pointer hover:font-bold': selectedTab.name !== tab.name,
              'pointer-events-none opacity-50': tab.disabled,
            })}
            key={tab.name}
            onClick={() => onClick(tab)}
          >
            {tab.name}
          </div>
        ))}
      </div>
      <div className="relative -top-[1px] flex h-[1px] w-full bg-modal-border" />
    </div>
  );
}

function KeysTabPane({ selectedTab }: { selectedTab: ModalTab }) {
  return (
    <div className="p-8">
      <div className="flex flex-col gap-6">
        {selectedTab.groups.map((group) => (
          <div className="rounded border border-modal-border" key={group.header}>
            <div className="bg-modal-border  px-4 py-3 font-bold">{group.header}</div>
            <div className="flex flex-col">
              {group.shortcuts.map((shortcut) => (
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
                          'font-default text-base/4 font-medium',
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
        ))}
      </div>
    </div>
  );
}
