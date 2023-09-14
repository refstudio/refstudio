import { useAtomValue, useSetAtom } from 'jotai';
import { FormEventHandler, useState } from 'react';

import { createProjectModalAtoms } from '../atoms/projectState';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';

export function CreateProjectModal() {
  const [name, setName] = useState('');

  const isVisible = useAtomValue(createProjectModalAtoms.visibleAtom);
  const closeModal = useSetAtom(createProjectModalAtoms.closeAtom);
  const dismissModal = useSetAtom(createProjectModalAtoms.dismissAtom);

  const cleanupName = (_name: string) => _name.replace(/[^a-zA-Z0-9-_ ]/g, '');

  const handleFormSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    if (name) {
      closeModal(name.trim());
    }
  };

  if (!isVisible) {
    return <></>;
  }

  return (
    <Modal className="w-[1150px] max-w-[calc(40vw-100px)]" open={isVisible} onClose={dismissModal}>
      <div className="flex w-full flex-col bg-white">
        <h1 className="border-b-2 p-4">Project Name</h1>
        <div className="p-4">
          <p>What is the name you want to use for this project?</p>
          <form className="flex gap-2 py-2" onSubmit={handleFormSubmit}>
            <Input
              autoFocus
              data-testid="project-name-input"
              type="text"
              value={name}
              onChange={(value) => setName(cleanupName(value))}
            />
            <Button className="w-auto" disabled={cleanupName(name).length === 0} submit text="Create" type="primary" />
          </form>
          <p>
            <small>Note: This action will close any open project you already have.</small>
          </p>
        </div>
      </div>
    </Modal>
  );
}
