import { useAtomValue, useSetAtom } from 'jotai';

import { openFilePathAtom } from '../../atoms/fileEntryActions';
import { fileExplorerAtom, refreshFileTreeAtom } from '../../atoms/fileExplorerActions';
import { useActiveEditorIdForPane } from '../../atoms/hooks/useActiveEditorIdForPane';
import { isProjectOpenAtom, projectNameAtom } from '../../atoms/projectState';
import { parseEditorId } from '../../atoms/types/EditorData';
import { InfoMessage } from '../../components/InfoMessage';
import { PanelSection } from '../../components/PanelSection';
import { PanelWrapper } from '../../components/PanelWrapper';
import { emitEvent } from '../../events';
import { useAsyncEffect } from '../../hooks/useAsyncEffect';
import { isNonNullish } from '../../lib/isNonNullish';
import { noop } from '../../lib/noop';
import { FileExplorer } from './FileExplorer';

export function ExplorerPanel() {
  const isProjectOpen = useAtomValue(isProjectOpenAtom);

  return (
    <PanelWrapper title="Explorer">
      {isProjectOpen && <ProjectSection />}

      {!isProjectOpen && (
        <div className="p-4">
          <InfoMessage className="mb-4 text-base leading-loose">Your project is empty!</InfoMessage>
          <ul className="list-inside list-disc">
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

  return (
    <PanelSection grow title={projectName}>
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
  return <ProjectAction onClick={handleClick}>create new project</ProjectAction>;
}

function OpenExistingProjectAction() {
  const handleClick = () => emitEvent('refstudio://menu/file/project/open');

  return <ProjectAction onClick={handleClick}>open an existing project</ProjectAction>;
}

function TrySampleProjectAction() {
  return <ProjectAction onClick={noop}>try a sample project</ProjectAction>;
}

function ProjectAction({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <li className="cursor-pointer underline hover:no-underline" onClick={onClick}>
      {children}
    </li>
  );
}
