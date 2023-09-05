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
    if (!name) {
      return;
    }
    closeModal(name.trim());
  };

  if (!isVisible) {
    return <></>;
  }

  return (
    <Modal className="w-[1150px] max-w-[calc(30vw-100px)]" open={isVisible} onClose={() => dismissModal()}>
      <div className="flex w-full flex-col  bg-white">
        <div className="border-b-2 p-2 font-bold">Project Name</div>
        <div className="p-2">
          <p>What is the name you want to use for this project?</p>
          <form className="flex gap-2 p-2" onSubmit={handleFormSubmit}>
            <Input autoFocus type="text" value={name} onChange={(value) => setName(cleanupName(value))} />
            <Button className="w-auto" disabled={cleanupName(name).length === 0} submit text="Create" type="primary" />
          </form>
        </div>
      </div>
    </Modal>
  );
}
