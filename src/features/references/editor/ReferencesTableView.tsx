import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './ReferenceView.css';

import { AgGridReact } from 'ag-grid-react';
import { useAtomValue } from 'jotai';

import { getReferencesAtom } from '../../../atoms/referencesState';
import { ReferenceItem } from '../../../types/ReferenceItem';
import { UploadTipInstructions } from '../components/UploadTipInstructions';

export function ReferencesTableView() {
  const references = useAtomValue(getReferencesAtom);

  return (
    <div className="flex w-full flex-col overflow-y-auto p-6">
      {references.length === 0 && <UploadTipInstructions />}
      <AgGridReact
        className="ag-theme-alpine grow"
        columnDefs={[
          { field: 'citationKey', sortable: true, width: 140 },
          { field: 'title', sortable: true, editable: true },
          { field: 'abstract' },
          { field: 'publishedDate' },
          {
            field: 'authors',
            valueFormatter: ({ value }: { value: ReferenceItem['authors'] }) =>
              value.map((a) => a.fullName.split(' ').pop()).join(', '),
          },
        ]}
        rowData={references}
        onCellValueChanged={({ oldValue, newValue }) => console.log(`${oldValue} -> ${newValue}`)}
      />
    </div>
  );
}
