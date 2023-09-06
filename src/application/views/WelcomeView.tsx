import { useAtomValue } from 'jotai';

import { allProjectsAtom } from '../../atoms/projectState';
import { Button } from '../../components/Button';
import { OpenIcon } from '../../components/icons';
import { TabPane } from '../../components/TabPane';
import { emitEvent } from '../../events';
import { AddIcon, EmptyStateIcon, WelcomeIcon } from '../components/icons';
import { ProjectsList } from '../components/ProjectsList';

export function WelcomeView() {
  const projects = useAtomValue(allProjectsAtom);

  return (
    <div className="flex h-full w-full flex-1 flex-col items-stretch">
      <div>
        <TabPane
          items={[
            {
              text: 'Welcome',
              value: 'welcome',
              Icon: <WelcomeIcon />,
            },
          ]}
          value="welcome"
        />
      </div>
      <div className="flex flex-1 gap-10 bg-content-area-bg-primary p-10">
        {projects.length > 0 ? (
          <>
            <div className="flex w-56 flex-col items-stretch">
              <WelcomeActions />
            </div>
            <div className="w-[1px] bg-welcome-border" />
            <div className="flex flex-1 flex-col gap-12">
              <ProjectsList
                header="Recent Projects"
                projects={projects}
                onProjectClick={(project) => emitEvent('refstudio://projects/open', { projectId: project.id })}
              />
            </div>
          </>
        ) : (
          <EmptyWelcomeView />
        )}
      </div>
    </div >
  );
}

function EmptyWelcomeView() {
  return (
    <div className="flex flex-1 cursor-default select-none flex-col items-center justify-center gap-6">
      <div className="text-empty-state-ico-empty">
        <EmptyStateIcon />
      </div>
      <div className="flex flex-col items-center justify-center gap-2 self-stretch">
        <div className="text-xl/6 font-semibold text-side-bar-txt-primary">Get Started</div>
        <div className="text-side-bar-txt-secondary">Create a new project or try a sample one.</div>
      </div>
      <div className="flex w-64 flex-col items-center justify-center gap-2">
        <Button
          fluid
          size="M"
          text="Create First Project"
          onClick={() => emitEvent('refstudio://menu/file/project/new')}
        />
        <Button
          fluid
          size="M"
          text="Try Sample Project"
          type="secondary"
          onClick={() => emitEvent('refstudio://menu/file/project/new/sample')}
        />
      </div>
    </div>
  );
}

function WelcomeActions() {
  return (
    <div className="flex flex-col items-start gap-4">
      <h1 className="text-card-txt-primary">Welcome to refstudio</h1>
      <div className="flex flex-col items-center gap-2 self-stretch">
        <Button
          Action={<AddIcon />}
          fluid
          text="Create Project"
          onClick={() => emitEvent('refstudio://menu/file/project/new')}
        />
        <Button
          Action={<OpenIcon />}
          fluid
          text="Open Project"
          type="secondary"
          onClick={() => emitEvent('refstudio://menu/file/project/open')}
        />
      </div>
    </div>
  );
}
