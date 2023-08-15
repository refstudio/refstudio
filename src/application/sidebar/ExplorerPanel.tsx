import { useAtomValue, useSetAtom } from 'jotai';
import { VscClose, VscEmptyWindow } from 'react-icons/vsc';

import { openFilePathAtom } from '../../atoms/fileEntryActions';
import { fileExplorerAtom, refreshFileTreeAtom } from '../../atoms/fileExplorerActions';
import { useActiveEditorIdForPane } from '../../atoms/hooks/useActiveEditorIdForPane';
import { isProjectOpenAtom, projectNameAtom } from '../../atoms/projectState';
import { parseEditorId } from '../../atoms/types/EditorData';
import { PanelSection } from '../../components/PanelSection';
import { PanelWrapper } from '../../components/PanelWrapper';
import { emitEvent } from '../../events';
import { useAsyncEffect } from '../../hooks/useAsyncEffect';
import { isNonNullish } from '../../lib/isNonNullish';
import { FileExplorer } from './FileExplorer';

export function ExplorerPanel() {
  const isProjectOpen = useAtomValue(isProjectOpenAtom);

  return (
    <PanelWrapper title="Explorer">
      {isProjectOpen && <ProjectSection />}

      {!isProjectOpen && (
        <div className="p-4">
          <ul className="flex list-inside list-disc flex-col gap-2">
            <CreateNewProjectAction />
            <OpenExistingProjectAction />
            <TrySampleProjectAction />
          </ul>
        </div>
      )}
    </PanelWrapper>
  );
}

export function ProjectSection() {
  const leftPaneActiveEditorId = useActiveEditorIdForPane('LEFT');
  const rightPaneActiveEditorId = useActiveEditorIdForPane('RIGHT');
  const rootFileExplorerEntry = useAtomValue(fileExplorerAtom);
  const openFile = useSetAtom(openFilePathAtom);
  const refreshFileTree = useSetAtom(refreshFileTreeAtom);
  const projectName = useAtomValue(projectNameAtom);

  useAsyncEffect(refreshFileTree);

  const openProject = () => emitEvent('refstudio://menu/file/project/open');
  const closeProject = () => emitEvent('refstudio://menu/file/project/close');

  return (
    <PanelSection
      grow
      rightIcons={[
        { key: 'open', Icon: VscEmptyWindow, title: 'Open Project', onClick: openProject },
        { key: 'close', Icon: VscClose, title: 'Close Project', onClick: closeProject },
      ]}
      title={projectName}
    >
      <FileExplorer
        fileExplorerEntry={rootFileExplorerEntry}
        paddingLeft="1.25rem"
        selectedFiles={[leftPaneActiveEditorId, rightPaneActiveEditorId]
          .filter(isNonNullish)
          .map((editorId) => parseEditorId(editorId).id)}
        onFileClick={openFile}
      />
    </PanelSection>
  );
}

function CreateNewProjectAction() {
  const handleClick = () => emitEvent('refstudio://menu/file/project/new');
  return <ProjectAction onClick={handleClick}>Create New Project</ProjectAction>;
}

function OpenExistingProjectAction() {
  const handleClick = () => emitEvent('refstudio://menu/file/project/open');

  return <ProjectAction onClick={handleClick}>Open Existing Project</ProjectAction>;
}

function TrySampleProjectAction() {
  const handleClick = () => emitEvent('refstudio://menu/file/project/new/sample');
  return <ProjectAction onClick={handleClick}>Try Sample Project</ProjectAction>;
}

function ProjectAction({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <div
      className="inline-flex cursor-pointer items-center justify-center gap-2 rounded bg-emerald-500 px-5 py-3 hover:bg-emerald-600"
      onClick={onClick}
    >
      <div className="text-base font-semibold leading-normal text-white">{children}</div>
    </div>
  );
  // return (
  //   <li className="cursor-pointer underline hover:no-underline" onClick={onClick}>
  //     {children}
  //   </li>
  // );
}
