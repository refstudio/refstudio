import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { VscCloseAll, VscSplitHorizontal } from 'react-icons/vsc';

import {
  closeAllFilesAtom,
  leftPaneAtom,
  openFileAtom,
  rightPaneAtom,
  selectFileInPaneAtom,
  splitFileToPaneAtom,
} from '../atoms/fileActions';
import { FileEntry } from '../atoms/types/FileEntry';
import { FileTree } from '../components/FileTree';
import { PanelSection } from '../components/PanelSection';
import { PanelWrapper } from '../components/PanelWrapper';
import { readAllProjectFiles } from '../filesystem';
import { isNonNullish } from '../lib/isNonNullish';

export function ExplorerPanel() {
  const left = useAtomValue(leftPaneAtom);
  const right = useAtomValue(rightPaneAtom);
  const selectFileInPane = useSetAtom(selectFileInPaneAtom);
  const openFile = useSetAtom(openFileAtom);
  const splitFileToPane = useSetAtom(splitFileToPaneAtom);
  const closeAllFiles = useSetAtom(closeAllFilesAtom);

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
      <PanelSection
        rightIcons={[{ key: 'closeAll', Icon: VscCloseAll, title: 'Close All Open Files', onClick: closeAllFiles }]}
        title="Open Files"
      >
        {hasRightPanelFiles && <div className="ml-4 text-xs font-bold">LEFT</div>}
        {left.files.length > 0 && (
          <FileTree
            files={left.files}
            rightAction={(file) => (
              <VscSplitHorizontal
                title="Move to RIGHT split pane"
                onClick={(evt) => {
                  evt.stopPropagation();
                  splitFileToPane({ fileId: file.path, fromPaneId: left.id, toPaneId: right.id });
                }}
              />
            )}
            root
            selectedFiles={left.activeFile ? [left.activeFile] : []}
            onClick={(file) => selectFileInPane({ paneId: left.id, fileId: file.path })}
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
                  splitFileToPane({ fileId: file.path, fromPaneId: right.id, toPaneId: left.id });
                }}
              />
            )}
            root
            selectedFiles={right.activeFile ? [right.activeFile] : []}
            onClick={(file) => selectFileInPane({ paneId: right.id, fileId: file.path })}
          />
        )}
      </PanelSection>
      <PanelSection grow title="Project X">
        <FileTree
          files={allFiles}
          root
          selectedFiles={[left.activeFile, right.activeFile].filter(isNonNullish)}
          onClick={(file) => openFile(file)}
        />
      </PanelSection>
    </PanelWrapper>
  );
}
