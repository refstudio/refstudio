import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useMemo, useState } from 'react';

import {
  fileExplorerAtom,
  fileExplorerEntryPathBeingRenamed,
  refreshFileTreeAtom,
} from '../../atoms/fileExplorerActions';
import { useActiveEditorIdForPane } from '../../atoms/hooks/useActiveEditorIdForPane';
import { parseEditorId } from '../../atoms/types/EditorData';
import { FileExplorerEntry, FileExplorerFileEntry, FileExplorerFolderEntry } from '../../atoms/types/FileExplorerEntry';
import { FileNameInput } from '../../components/FileNameInput';
import { emitEvent } from '../../events';
import { useAsyncEffect } from '../../hooks/useAsyncEffect';
import { cx } from '../../lib/cx';
import { isNonNullish } from '../../lib/isNonNullish';
import { FILE_EXPLORER_FILE_MENU_ID } from './fileExplorerContextMenu/FileExplorerFileContextMenu';
import { useFileExplorerContextMenu } from './fileExplorerContextMenu/useFileExplorerContextMenu';
import { ExplorerArrowDownIcon } from './icons';

export function FileExplorer({ projectName }: { projectName: string }) {
  const [collapsed, setCollapsed] = useState(false);

  const rootFileExplorerEntry = useAtomValue(fileExplorerAtom);
  const projectFileEntries = useAtomValue(rootFileExplorerEntry.childrenAtom);
  const refreshFileTree = useSetAtom(refreshFileTreeAtom);

  useAsyncEffect(refreshFileTree);

  return (
    <>
      <div className="flex select-none flex-col items-start gap-1 self-stretch overflow-y-auto overflow-x-hidden">
        <ProjectExplorerHeader
          collapsed={collapsed}
          projectName={projectName}
          onClick={() => setCollapsed(!collapsed)}
        />
        <ProjectExplorerEntries collapsed={collapsed} projectFileEntries={projectFileEntries} />
      </div>
    </>
  );
}

function ProjectExplorerHeader({
  projectName,
  collapsed,
  onClick,
}: {
  projectName: string;
  collapsed: boolean;
  onClick: () => void;
}) {
  return (
    <div className="flex w-full cursor-pointer items-center" onClick={onClick}>
      <div
        className={cx('text-btn-ico-side-bar-item transition duration-100 ease-in-out', {
          '-rotate-90': collapsed,
        })}
      >
        <ExplorerArrowDownIcon />
      </div>
      <span className="font-semibold">{projectName}</span>
    </div>
  );
}

function ProjectExplorerEntries({
  collapsed,
  projectFileEntries,
}: {
  collapsed: boolean;
  projectFileEntries: FileExplorerEntry[];
}) {
  if (collapsed) {
    return null;
  }

  return (
    <div className="flex flex-col items-start gap-1 self-stretch pl-6">
      {projectFileEntries.map((fileEntry) =>
        fileEntry.isFolder ? (
          <FolderNode folder={fileEntry} key={fileEntry.path} />
        ) : (
          <FileNode
            existingFileNames={projectFileEntries.map((file) => file.name)}
            file={fileEntry}
            key={fileEntry.path}
          />
        ),
      )}
    </div>
  );
}

interface FolderNodeProps {
  folder: FileExplorerFolderEntry;
}
export function FolderNode({ folder }: FolderNodeProps) {
  const childrenEntries = useAtomValue(folder.childrenAtom);
  const [collapsed, setCollapsed] = useAtom(folder.collapsedAtom);

  return (
    <div className="flex flex-col items-start gap-1 self-stretch">
      {/* FOLDER NAME + CHEVRON */}
      <div
        className={cx('flex cursor-pointer select-none items-center gap-1 self-stretch')}
        onClick={() => setCollapsed((currentState) => !currentState)}
      >
        <div
          className={cx('text-btn-ico-side-bar-item transition duration-100 ease-in-out', { '-rotate-90': collapsed })}
        >
          <ExplorerArrowDownIcon />
        </div>
        <h2 className="overflow-hidden overflow-ellipsis whitespace-nowrap">{folder.name}</h2>
      </div>
      {/* CHILDREN NODES */}
      <ProjectExplorerEntries collapsed={collapsed} projectFileEntries={childrenEntries} />
    </div>
  );
}

interface FileNodeProps {
  file: FileExplorerFileEntry;
  existingFileNames: string[];
}
export function FileNode({ file, existingFileNames }: FileNodeProps) {
  const [pathBeingRenamed, setPathBeingRenamed] = useAtom(fileExplorerEntryPathBeingRenamed);

  const leftPaneActiveEditorId = useActiveEditorIdForPane('LEFT');
  const rightPaneActiveEditorId = useActiveEditorIdForPane('RIGHT');
  const isFileActive = useMemo(
    () =>
      [leftPaneActiveEditorId, rightPaneActiveEditorId]
        .filter(isNonNullish)
        .map((editorId) => parseEditorId(editorId).id)
        .includes(file.path),
    [leftPaneActiveEditorId, rightPaneActiveEditorId, file.path],
  );

  const show = useFileExplorerContextMenu(FILE_EXPLORER_FILE_MENU_ID, { id: file.path });

  const isNameValid = useCallback(
    (name: string) => {
      if (name.startsWith('.')) {
        return false;
      }
      if (name.includes('/')) {
        return false;
      }

      return !existingFileNames.includes(name);
    },
    [existingFileNames],
  );

  return pathBeingRenamed === file.path ? (
    <FileNameInput
      fileName={file.name}
      isNameValid={isNameValid}
      onCancel={() => setPathBeingRenamed(null)}
      onSubmit={(newName: string) => emitEvent('refstudio://explorer/rename', { path: file.path, newName })}
    />
  ) : (
    <div
      className={cx(
        'flex shrink-0 items-center gap-1 self-stretch px-2 py-1',
        'text-btn-txt-side-bar-item-primary',
        'rounded-default hover:bg-btn-bg-side-bar-item-hover',
        'cursor-pointer select-none',
        {
          'bg-btn-bg-side-bar-item-default': !isFileActive,
          'bg-btn-bg-side-bar-item-active': isFileActive,
        },
      )}
      onClick={() => emitEvent('refstudio://explorer/open', { path: file.path })}
      onContextMenu={show}
    >
      <div className="overflow-hidden overflow-ellipsis whitespace-nowrap">{file.name}</div>
    </div>
  );
}
