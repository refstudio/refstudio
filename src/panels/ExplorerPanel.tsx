import { FileEntry } from '@tauri-apps/api/fs';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { VscFile, VscFolder, VscSplitHorizontal } from 'react-icons/vsc';

import {
  activateFileInPaneAtom,
  DEFAULT_PANE,
  leftPaneAtom,
  openFileInPaneAtom,
  rightPaneAtom,
  splitFileToPaneAtom,
} from '../atoms/openFilesState';
import { PanelSection } from '../components/PanelSection';
import { PanelWrapper } from '../components/PanelWrapper';
import { cx } from '../cx';
import { readAllProjectFiles } from '../filesystem';

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
  }, [setFiles]);

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
      <PanelSection title="Project X">
        <FileTree
          files={allFiles}
          root
          selectedFiles={[left.active, right.active].filter((file) => file).map((file) => file!)}
          onClick={(file) => openFileInPane({ pane: DEFAULT_PANE, file })}
        />
      </PanelSection>
    </PanelWrapper>
  );
}

interface FileTreeBaseProps {
  root?: boolean;
  files: FileEntry[];
  file?: FileEntry;
  selectedFiles: FileEntry[];
  onClick: (file: FileEntry) => void;
  rightAction?: (file: FileEntry) => React.ReactNode;
}

const FileTree = ({ files, root, ...props }: FileTreeBaseProps) => (
  <div className="overflow-scroll">
    <ul
      className={cx('', {
        'ml-4': root,
        'ml-6': !root,
      })}
    >
      {files.map((file) => (
        <FileTreeNode file={file} files={files} key={file.path} {...props} />
      ))}
    </ul>
  </div>
);

const FileTreeNode = ({ file, onClick, rightAction, selectedFiles }: FileTreeBaseProps) => {
  if (!file) {
    return null;
  }
  const isFolder = Array.isArray(file.children);

  // Hide DOT_FILES
  if (file.name?.startsWith('.')) {
    return null;
  }

  return (
    <li>
      <div
        className={cx(
          'mb-1 py-1',
          'flex flex-row items-center gap-1', //
          'group',
          {
            'bg-slate-100': selectedFiles.some((f) => f.path === file.path),
            'cursor-pointer hover:bg-slate-100': !isFolder,
          },
        )}
        title={file.name}
        onClick={() => !isFolder && onClick(file)}
      >
        {isFolder ? <VscFolder className="shrink-0" /> : <VscFile className="shrink-0" />}
        <span
          className={cx('flex-1 truncate', {
            'font-bold': isFolder,
          })}
        >
          {file.name}
        </span>
        {rightAction && (
          <div className="mr-2 hidden p-0.5 hover:bg-gray-200 group-hover:block">{rightAction(file)}</div>
        )}
      </div>

      {isFolder && Array.isArray(file.children) && (
        <FileTree files={file.children} rightAction={rightAction} selectedFiles={selectedFiles} onClick={onClick} />
      )}
    </li>
  );
};
