import { atom } from 'jotai';

/**
 * Utility to create atoms to control the visibility of a modal that is typesafe in the modal result type.
 *
 * @returns atoms to control the modal
 */
export const createModalAtoms = <ModalResult>() => {
  const visible = atom(false);
  let resolveFn: null | ((result: ModalResult | null) => void) = null;

  const show = atom(
    null,
    async (_, set) =>
      new Promise<ModalResult | null>((resolve) => {
        if (resolveFn) {
          throw new Error('resolveFn already set. Make sure you call closeAtom before showAtom');
        }
        set(visible, true);
        resolveFn = resolve;
      }),
  );

  const close = atom(null, (_, set, result: ModalResult | null) => {
    set(visible, false);
    if (!resolveFn) {
      throw new Error('resolveFn not set. Make sure you call showAtom before closeAtom');
    }
    resolveFn(result);
    resolveFn = null;
  });

  return {
    /** Indicates if the modal is visible or not */
    visibleAtom: visible,
    /** Displays the modal and only resolve when the user close the modal (via, closeAtom) */
    showAtom: show,
    /** Close the modal with the provided result. A null parameter type means the user canceled/closed the modal. */
    closeAtom: close,
  };
};
