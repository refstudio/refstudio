import { atom } from 'jotai';

type CreateModalResult<T> = { status: 'closed'; value: T } | { status: 'dismissed' };
/**
 * Utility to create atoms to control the visibility of a modal that is typesafe in the modal result type.
 *
 * @returns atoms to control the modal
 */
export const createModalAtoms = <ModalResult>() => {
  const visible = atom(false);
  let resolveFn: null | ((result: CreateModalResult<ModalResult>) => void) = null;

  const open = atom(
    null,
    async (_, set) =>
      new Promise<CreateModalResult<ModalResult>>((resolve) => {
        if (resolveFn) {
          throw new Error('resolveFn already set. Make sure you call closeAtom before showAtom');
        }
        set(visible, true);
        resolveFn = resolve;
      }),
  );

  const close = atom(null, (_, set, result: ModalResult) => {
    set(visible, false);
    if (!resolveFn) {
      throw new Error('resolveFn not set. Make sure you call showAtom before closeAtom');
    }
    resolveFn({ status: 'closed', value: result });
    resolveFn = null;
  });

  const dismiss = atom(null, (_, set) => {
    set(visible, false);
    if (!resolveFn) {
      throw new Error('resolveFn not set. Make sure you call showAtom before dismissAtom');
    }
    resolveFn({ status: 'dismissed' });
    resolveFn = null;
  });

  return {
    /** Indicates if the modal is visible or not */
    visibleAtom: visible,
    /** Displays the modal and only resolve when the user close the modal (via closeAtom) */
    openAtom: open,
    /** Close the modal with the provided value. */
    closeAtom: close,
    /** Dismiss the modal, without a value (returning null). */
    dismissAtom: dismiss,
  };
};
