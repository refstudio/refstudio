import { OpenIcon } from '../../components/icons';
import { PanelWrapper } from '../../components/PanelWrapper';
import { emitEvent } from '../../events';
import { FileExplorer } from './FileExplorer';

export function ExplorerPanel() {
  const openProject = () => emitEvent('refstudio://menu/file/project/open');

  return (
    <PanelWrapper
      actions={[{ key: 'open', Icon: <OpenIcon />, title: 'Open Project', onClick: openProject }]}
      title="PROJECTS"
    >
      <div className="flex flex-1 flex-col items-start gap-2 self-stretch overflow-y-auto overflow-x-hidden p-4 pt-2">
        <FileExplorer />
      </div>
    </PanelWrapper>
  );
}
