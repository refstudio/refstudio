import { FileEntry } from '@tauri-apps/api/fs';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { VscSplitHorizontal } from 'react-icons/vsc';

import {
  activateFileInPaneAtom,
  DEFAULT_PANE,
  leftPaneAtom,
  openFileInPaneAtom,
  rightPaneAtom,
  splitFileToPaneAtom,
} from '../atoms/openFilesState';
import { FileTree } from '../components/FileTree';
import { PanelSection } from '../components/PanelSection';
import { PanelWrapper } from '../components/PanelWrapper';
import { readAllProjectFiles } from '../filesystem';
import { isNonNullish } from '../lib/isNonNullish';

export function ExplorerPanel() {
  const left = useAtomValue(leftPaneAtom);
  const right = useAtomValue(rightPaneAtom);
  const activateFileInPane = useSetAtom(activateFileInPaneAtom);
  const openFileInPane = useSetAtom(openFileInPaneAtom);
  const splitFileToPane = useSetAtom(splitFileToPaneAtom);

  const [allFiles, setFiles] = useState<FileEntry[]>([]);
  useEffect(() => {
    (async function refreshProjectTree() {
      const newFiles = await readAllProjectFiles();
      setFiles(newFiles);
    })();
  }, []);

  const hasRightPanelFiles = right.files.length > 0;

  return (
    <PanelWrapper title="Explorer">
      <PanelSection title="Open Files">
        {hasRightPanelFiles && <div className="ml-4 text-xs font-bold">LEFT</div>}
        {left.files.length > 0 && (
          <FileTree
            files={left.files}
            rightAction={(file) => (
              <VscSplitHorizontal
                title="Move to RIGHT split pane"
                onClick={(evt) => {
                  evt.stopPropagation();
                  splitFileToPane({ file, fromPane: left.id, toPane: 'RIGHT' });
                }}
              />
            )}
            root
            selectedFiles={left.active ? [left.active] : []}
            onClick={(file) => activateFileInPane({ pane: left.id, path: file.path })}
          />
        )}
        {hasRightPanelFiles && <div className="ml-4 text-xs font-bold">RIGHT</div>}
        {hasRightPanelFiles && (
          <FileTree
            files={right.files}
            rightAction={(file) => (
              <VscSplitHorizontal
                title="Move to LEFT split pane"
                onClick={(evt) => {
                  evt.preventDefault();
                  evt.stopPropagation();
                  splitFileToPane({ file, fromPane: right.id, toPane: 'LEFT' });
                }}
              />
            )}
            root
            selectedFiles={right.active ? [right.active] : []}
            onClick={(file) => activateFileInPane({ pane: right.id, path: file.path })}
          />
        )}
      </PanelSection>
      <PanelSection grow title="Project X">
        <FileTree
          files={allFiles}
          root
          selectedFiles={[left.active, right.active].filter(isNonNullish)}
          onClick={(file) => openFileInPane({ pane: DEFAULT_PANE, file })}
        />
      </PanelSection>
    </PanelWrapper>
  );
}
