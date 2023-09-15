import { useAtomValue } from 'jotai';

import { projectNameAtom } from '../../atoms/projectState';
import { OpenIcon } from '../../components/icons';
import { PanelWrapper } from '../../components/PanelWrapper';
import { emitEvent } from '../../events';
import { AddIcon } from '../components/icons';
import { ProjectFileExplorer } from './ProjectFileExplorer';

export function ExplorerPanel() {
  const openProject = () => emitEvent('refstudio://menu/file/project/open');
  const newProject = () => emitEvent('refstudio://menu/file/project/new');

  const projectName = useAtomValue(projectNameAtom);

  return (
    <PanelWrapper
      actions={[
        { key: 'open', Icon: <OpenIcon />, title: 'Open Project', onClick: openProject },
        { key: 'add', Icon: <AddIcon />, title: 'New Project', onClick: newProject },
      ]}
      title="PROJECTS"
    >
      <div className="flex flex-1 flex-col items-start gap-2 self-stretch overflow-y-auto overflow-x-hidden p-4 pt-2">
        <ProjectFileExplorer projectName={projectName} />
      </div>
    </PanelWrapper>
  );
}
