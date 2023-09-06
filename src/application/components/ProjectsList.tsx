import { Fragment } from 'react';

import { ProjectInfo } from '../../api/projectsAPI';
import { cx } from '../../lib/cx';
import { RefStudioEditorIcon } from './icons';

interface ProjectsListProps {
  projects: ProjectInfo[];
  onProjectClick: (project: ProjectInfo) => void;
}
export function ProjectsList({ projects, onProjectClick }: ProjectsListProps) {
  return (
    <div className="flex flex-col items-stretch gap-4 overflow-y-hidden">
      <h1>Recent Projects</h1>
      <div className="flex flex-col items-stretch gap-2 overflow-y-scroll">
        {projects.map((project, index) => (
          <Fragment key={project.id}>
            {index > 0 && <div className="h-[1px] shrink-0 bg-welcome-border" />}
            <ProjectItem project={project} onClick={() => onProjectClick(project)} />
          </Fragment>
        ))}
      </div>
    </div>
  );
}
function ProjectItem({ project, onClick }: { project: ProjectInfo; onClick: () => void }) {
  return (
    <div
      className={cx(
        'flex cursor-pointer items-center gap-2 p-2 pr-3',
        'rounded-default hover:bg-btn-bg-side-bar-item-hover',
        'text-btn-txt-side-bar-item-primary',
      )}
      role="menuitem"
      onClick={onClick}
    >
      <div className="text-btn-ico-content">
        <RefStudioEditorIcon />
      </div>
      {project.name}
    </div>
  );
}
