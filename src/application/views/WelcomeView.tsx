import { useAtomValue } from 'jotai';

import { allProjectsAtom } from '../../atoms/projectState';
import { Button } from '../../components/Button';
import { OpenIcon } from '../../components/icons';
import { emitEvent } from '../../events';
import { cx } from '../../lib/cx';
import { AddIcon, EmptyStateIcon, SampleIcon } from '../components/icons';
import { ProjectsList } from '../components/ProjectsList';

export function WelcomeView() {
  const projects = useAtomValue(allProjectsAtom);

  return (
    <div
      className={cx(
        'h-full w-full p-10',
        'flex flex-row items-stretch gap-10',
        'bg-content-area-bg-primary',
        'cursor-default select-none',
      )}
    >
      <div className="flex w-56 flex-col items-stretch">
        <WelcomeActions />
      </div>
      <div className="w-[1px] bg-welcome-border" />
      {projects.length > 0 ? (
        <div className="flex flex-1 flex-col gap-12">
          <WelcomeTips />
          <ProjectsList
            projects={projects}
            onProjectClick={(project) => () => emitEvent('refstudio://projects/open', { projectId: project.id })}
          />
        </div>
      ) : (
        <EmptyWelcomeView />
      )}
    </div>
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
        <div className="text-side-bar-txt-secondary">Create new projects to see them here.</div>
      </div>
      <div className="flex w-64 flex-col items-center justify-center gap-2">
        <Button fluid size="M" text="Create Project" onClick={() => emitEvent('refstudio://menu/file/project/new')} />
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

function WelcomeTips() {
  return (
    <div
      className={cx(
        'flex flex-col items-stretch gap-6 p-6 pt-5',
        'rounded-default bg-card-bg-secondary',
        'border-t-8 border-t-card-bg-header',
      )}
    >
      <div className="flex flex-col items-start gap-4 text-card-txt-primary">
        <h1 className="flex-1 text-card-txt-primary">Tip & Tricks</h1>
        <div className="flex flex-col items-start gap-2">
          <div className="f text-2xl/6 font-semibold">Are you New to Refstudio?</div>
          <div>Learn more by playing with a sample project.</div>
        </div>
      </div>
      <div className="flex flex-row items-start gap-2">
        <Button
          Action={<SampleIcon />}
          text="Try Sample Project"
          onClick={() => emitEvent('refstudio://menu/file/project/new/sample')}
        />
      </div>
    </div>
  );
}
