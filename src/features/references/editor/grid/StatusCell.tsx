import { ICellRendererParams } from '@ag-grid-community/core';

import { ReferenceItem, ReferenceItemStatus } from '../../../../types/ReferenceItem';
import { ReferencesItemStatusLabel } from '../../components/ReferencesItemStatusLabel';

export function StatusCell({ value }: ICellRendererParams<ReferenceItem, ReferenceItemStatus>) {
  /* c8 ignore next 3 */
  if (!value) {
    return null;
  }
  return (
    <span className="text-[10px]">
      <ReferencesItemStatusLabel status={value} />
    </span>
  );
}
