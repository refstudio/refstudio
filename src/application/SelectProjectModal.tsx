import { useAtomValue, useSetAtom } from 'jotai';

import { allProjectsAtom, selectProjectModalAtoms } from '../atoms/projectState';
import { Modal } from '../components/Modal';
import { ProjectsList } from './components/ProjectsList';

export function SelectProjectModal() {
  const allProjects = useAtomValue(allProjectsAtom);

  const isVisible = useAtomValue(selectProjectModalAtoms.visibleAtom);
  const closeModal = useSetAtom(selectProjectModalAtoms.closeAtom);
  const dismissModal = useSetAtom(selectProjectModalAtoms.dismissAtom);

  return (
    <Modal className="max-h-[50vh] w-[1150px] max-w-[calc(40vw-100px)]" open={isVisible} onClose={dismissModal}>
      <div className="flex w-full flex-col bg-white">
        <h1 className="border-b-2 p-4">Select one project to open</h1>
        <div className="overflow-auto p-4">
          <ProjectsList projects={allProjects} onProjectClick={(p) => closeModal(p.id)} />
        </div>
        <p className="p-4 pt-2">
          <small>Note: This action will close any open project you already have.</small>
        </p>
      </div>
    </Modal>
  );
}
