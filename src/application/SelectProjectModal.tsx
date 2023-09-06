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
    <Modal className="max-h-[50vh] w-[1150px] max-w-[calc(40vw-100px)]" open={isVisible} onClose={() => dismissModal()}>
      <div className="flex w-full flex-col bg-white">
        <div className="border-b-2 p-2 font-bold">Select one project to open</div>
        <div className="overflow-auto p-2">
          <ProjectsList projects={allProjects} onProjectClick={(p) => closeModal(p.id)} />
        </div>
      </div>
    </Modal>
  );
}
