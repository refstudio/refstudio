import { ICellRendererParams } from '@ag-grid-community/core';
import { useSetAtom } from 'jotai';
import { VscFile, VscFilePdf } from 'react-icons/vsc';

import { openReferenceAtom, openReferencePdfAtom } from '../../../../atoms/editorActions';
import { ReferenceItem, ReferenceItemStatus } from '../../../../types/ReferenceItem';

export function ActionsCell({ data: reference }: ICellRendererParams<ReferenceItem, ReferenceItemStatus>) {
  const openReference = useSetAtom(openReferenceAtom);
  const openReferencePdf = useSetAtom(openReferencePdfAtom);

  /* c8 ignore next 3 */
  if (!reference) {
    return null;
  }
  return (
    <div className="justify-left flex h-full w-full items-center gap-2">
      <VscFile
        className="shrink-0 cursor-pointer"
        size={20}
        title="Open Reference Details"
        onClick={() => openReference(reference.id)}
      />
      {reference.filepath && (
        <VscFilePdf
          className="shrink-0 cursor-pointer"
          size={20}
          title="Open Reference PDF"
          onClick={() => openReferencePdf(reference.id)}
        />
      )}
    </div>
  );
}
