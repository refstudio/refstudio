import { useQuery } from '@tanstack/react-query';
import { useAtomValue, useSetAtom } from 'jotai';
import { Fragment } from 'react';

import { ProjectInfo, readAllProjects } from '../api/projectsAPI';
import { selectProjectModalAtoms } from '../atoms/projectState';
import { Modal } from '../components/Modal';
import { cx } from '../lib/cx';
import { RefStudioEditorIcon } from './components/icons';

export function SelectProjectModal() {
  const isVisible = useAtomValue(selectProjectModalAtoms.visibleAtom);
  const closeModal = useSetAtom(selectProjectModalAtoms.closeAtom);
  const dismissModal = useSetAtom(selectProjectModalAtoms.dismissAtom);

  return (
    <Modal className="max-h-[50vh] w-[1150px] max-w-[calc(40vw-100px)]" open={isVisible} onClose={() => dismissModal()}>
      <div className="flex w-full flex-col bg-white">
        <div className="border-b-2 p-2 font-bold">Select one project to open</div>
        <div className="overflow-auto p-2">
          <RecentProjectsList onSelected={(id) => closeModal(id)} />
        </div>
      </div>
    </Modal>
  );
}

function RecentProjectsList({ onSelected }: { onSelected: (projectId: string) => void }) {
  const { data: projects } = useQuery({ queryKey: ['recent-projects'], queryFn: readAllProjects });

  return (
    <div className="flex flex-col items-stretch gap-4 overflow-y-hidden">
      {projects && (
        <div className="flex flex-col items-stretch gap-2 overflow-y-scroll">
          {projects.map((project, index) => (
            <Fragment key={project.id}>
              {index > 0 && <div className="h-[1px] shrink-0 bg-welcome-border" />}
              <ProjectItem project={project} onClick={onSelected} />
            </Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectItem({ project, onClick }: { project: ProjectInfo; onClick: (projectId: string) => void }) {
  return (
    <div
      className={cx(
        'flex cursor-pointer items-center gap-2 p-2 pr-3',
        'rounded-default hover:bg-btn-bg-side-bar-item-hover',
        'text-btn-txt-side-bar-item-primary',
      )}
      onClick={() => onClick(project.id)}
    >
      <div className="text-btn-ico-content">
        <RefStudioEditorIcon />
      </div>
      {project.name}
    </div>
  );
}
