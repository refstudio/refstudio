import { useAtomValue, useSetAtom } from 'jotai';
import { FormEventHandler, MouseEventHandler, useState } from 'react';

import { createProjectModalAtoms } from '../atoms/projectState';
import { Button } from '../components/Button';
import { autoFocus } from '../lib/autoFocusAndSelect';
import { cx } from '../lib/cx';

export function CreateProjectModal() {
  const [name, setName] = useState('');

  const isVisible = useAtomValue(createProjectModalAtoms.visibleAtom);
  const closeModal = useSetAtom(createProjectModalAtoms.closeAtom);

  const cleanupName = (_name: string) => _name.replace(/[^a-zA-Z0-9-_ ]/g, '');

  const handleFormSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!name) {
      return;
    }
    closeModal(name.trim());
  };
  const handleOnCancel: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeModal(null);
  };

  if (!isVisible) {
    return <></>;
  }

  return (
    <div className="fixed left-0 top-0 z-modals flex h-screen w-screen items-center justify-center">
      <div className="pointer-events-none absolute left-0 top-0 h-full w-full bg-slate-400/60" />
      <div
        className={cx(
          'relative w-[1150px] max-w-[calc(30vw-100px)] overflow-hidden',
          'rounded-xl border-none border-slate-500 bg-white shadow-xl shadow-slate-500',
          '',
        )}
      >
        <div className="border-b-2 p-2 font-bold">Project Name</div>
        <div className="p-2">
          <p>What is the name you want to use for this project?</p>
          <form className="flex gap-2 p-2" onSubmit={handleFormSubmit}>
            <input
              className="w-full border border-solid border-black p-2"
              ref={autoFocus}
              type="text"
              value={name}
              onChange={(e) => setName(cleanupName(e.target.value))}
            />
            <div className="flex items-center justify-end gap-2">
              <Button disabled={cleanupName(name).length === 0} submit text="Create" type="primary" />
              <Button text="Cancel" type="secondary" onClick={handleOnCancel} />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
