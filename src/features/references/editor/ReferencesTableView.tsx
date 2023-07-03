import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './ReferenceView.css';

import { ColDef, NewValueParams } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react/lib/agGridReact';
import { useAtomValue } from 'jotai';
import { useCallback, useMemo } from 'react';

import { getReferencesAtom } from '../../../atoms/referencesState';
import { ReferenceItem } from '../../../types/ReferenceItem';
import { UploadTipInstructions } from '../components/UploadTipInstructions';

export function ReferencesTableView() {
  const references = useAtomValue(getReferencesAtom);

  const handleTextEdit = useCallback(({ oldValue, newValue }: NewValueParams<ReferenceItem, 'string'>) => {
    console.log('EDIT');
    console.log(`${oldValue} -> ${newValue}`);
  }, []);

  const authorsFormatter = useCallback(
    ({ value }: { value: ReferenceItem['authors'] }) => value.map((a) => a.fullName.split(' ').pop()).join(', '),
    [],
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      minWidth: 50,
    }),
    [],
  );

  const columnDefs = useMemo<ColDef<ReferenceItem>[]>(
    () => [
      {
        field: 'citationKey',

        sortable: true,
        width: 160,
        flex: undefined,
        checkboxSelection: true,
        headerCheckboxSelection: true,
      },
      { field: 'title', sortable: true, flex: 1, editable: true, onCellValueChanged: handleTextEdit },
      { field: 'abstract', flex: 2 },
      { field: 'publishedDate', sortable: true, width: 140, flex: undefined },
      {
        field: 'authors',
        valueFormatter: authorsFormatter,
      },
    ],
    [handleTextEdit, authorsFormatter],
  );

  return (
    <div className="flex w-full flex-col overflow-y-auto p-6">
      {references.length === 0 && <UploadTipInstructions />}
      <AgGridReact
        className="ag-theme-alpine grow"
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        rowData={references}
        rowSelection="multiple"
      />
    </div>
  );
}
