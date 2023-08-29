import { useAtomValue } from 'jotai';

import { isProjectOpenAtom } from '../../atoms/projectState';
import { CloseIcon, OpenIcon } from '../../components/icons';
import { PanelWrapper } from '../../components/PanelWrapper';
import { emitEvent } from '../../events';
import { FileExplorer } from './FileExplorer';

export function ExplorerPanel() {
  const isProjectOpen = useAtomValue(isProjectOpenAtom);

  const openProject = () => emitEvent('refstudio://menu/file/project/open');
  const closeProject = () => emitEvent('refstudio://menu/file/project/close');

  return (
    <PanelWrapper
      actions={[
        { key: 'open', Icon: <OpenIcon />, title: 'Open Project', onClick: openProject },
        { key: 'close', disabled: !isProjectOpen, Icon: <CloseIcon />, title: 'Close Project', onClick: closeProject },
      ]}
      title="Project"
    >
      {isProjectOpen && (
        <div className="flex flex-1 flex-col items-start gap-2 self-stretch p-4 pt-2">
          <FileExplorer />
        </div>
      )}

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
}
