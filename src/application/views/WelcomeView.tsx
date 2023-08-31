import { useQuery } from '@tanstack/react-query';

import { ProjectInfo, readAllProjects } from '../../api/projectsAPI';
import { Button } from '../../components/Button';
import { OpenIcon, RefStudioEditorIcon } from '../../components/icons';
import { emitEvent } from '../../events';
import { cx } from '../../lib/cx';
import { noop } from '../../lib/noop';
import { AddIcon, SampleIcon } from '../components/icons';
import { ExternalIcon } from '../sidebar/icons';

export function WelcomeView() {
  return (
    <div
      className={cx(
        'h-full w-full p-10',
        'flex flex-row items-start gap-10',
        'bg-content-area-bg-primary',
        'cursor-default select-none',
      )}
    >
      <div className="flex w-56 flex-col items-stretch">
        <WelcomeActions />
      </div>
      <div className="w-[1px] self-stretch bg-welcome-border" />
      <div className="flex flex-1 flex-col gap-12 self-stretch">
        <WelcomeTips />
        <RecentProjectsList />
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
          text="Create Project"
          onClick={() => emitEvent('refstudio://menu/file/project/new')}
        />
        <Button
          Action={<OpenIcon />}
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
          <div>Access our repository or open a sample project to learn more.</div>
        </div>
      </div>
      <div className="flex flex-row items-start gap-2">
        <div className="shrink">
          <a className="no-underline" href="https://github.com/refstudio/refstudio" rel="noreferrer" target="_blank">
            <Button Action={<ExternalIcon />} text="Documentation" onClick={noop} />
          </a>
        </div>
        <div className="shrink">
          <Button
            Action={<SampleIcon />}
            text="Open Sample"
            onClick={() => emitEvent('refstudio://menu/file/project/new/sample')}
          />
        </div>
      </div>
    </div>
  );
}

function RecentProjectsList() {
  const { data: projects } = useQuery({ queryKey: ['recent-projects'], queryFn: readAllProjects });

  return (
    <div className="flex flex-col items-stretch gap-4 overflow-y-hidden">
      <h1>Recent Projects</h1>
      {projects && (
        <div className="flex flex-col items-stretch gap-2 overflow-y-scroll">
          {projects.map((project, index) => (
            <>
              {index > 0 && <div className="h-[1px] shrink-0 bg-welcome-border" key={index} />}
              <ProjectItem key={project.id} project={project} />
            </>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectItem({ project }: { project: ProjectInfo }) {
  return (
    <div
      className={cx(
        'flex cursor-pointer items-center gap-2 p-2 pr-3',
        'rounded-default hover:bg-btn-bg-side-bar-item-hover',
        'text-btn-txt-side-bar-item-primary',
      )}
      onClick={() => emitEvent('refstudio://projects/open', { projectId: project.id })}
    >
      <RefStudioEditorIcon />
      {project.name}
    </div>
  );
}
