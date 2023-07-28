import { open } from '@tauri-apps/api/dialog';
import { useAtomValue, useSetAtom } from 'jotai';

import { openFilePathAtom } from '../../atoms/fileEntryActions';
import { fileExplorerAtom, refreshFileTreeAtom } from '../../atoms/fileExplorerActions';
import { useActiveEditorIdForPane } from '../../atoms/hooks/useActiveEditorIdForPane';
import { isProjectOpenAtom, openProjectAtom } from '../../atoms/projectState';
import { parseEditorId } from '../../atoms/types/EditorData';
import { InfoMessage } from '../../components/InfoMessage';
import { PanelSection } from '../../components/PanelSection';
import { PanelWrapper } from '../../components/PanelWrapper';
import { useAsyncEffect } from '../../hooks/useAsyncEffect';
import { getNewProjectsBaseDir } from '../../io/filesystem';
import { isNonNullish } from '../../lib/isNonNullish';
import { noop } from '../../lib/noop';
import { notifyInfo } from '../../notifications/notifications';
import { getCachedSetting, saveCachedSettings, setCachedSetting } from '../../settings/settingsManager';
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

  useAsyncEffect(refreshFileTree);

  const projectName = getCachedSetting('general.projectName');

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
  return <ProjectAction onClick={noop}>create new project</ProjectAction>;
}

function OpenExistingProjectAction() {
  const openProject = useSetAtom(openProjectAtom);

  const handleOpen = async () => {
    const selectedPath = await open({
      directory: true,
      multiple: false,
      defaultPath: await getNewProjectsBaseDir(),
      title: 'Open RefStudio project',
    });

    if (typeof selectedPath === 'string') {
      notifyInfo('Selected folder', selectedPath);
      setCachedSetting('general.projectDir', selectedPath);
      setCachedSetting('general.projectName', selectedPath.split('/').pop()!.toUpperCase());
      await saveCachedSettings();
      await openProject(selectedPath);
    }
  };

  return <ProjectAction onClick={() => void handleOpen()}>open an existing project</ProjectAction>;
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
