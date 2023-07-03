import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './ReferenceView.css';

import { ColDef, GetRowIdParams, ICellRendererParams, NewValueParams, SelectionChangedEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react/lib/agGridReact';
import { useAtomValue } from 'jotai';
import { useCallback, useMemo, useState } from 'react';
import { IconType } from 'react-icons';
import { VscDesktopDownload, VscNewFile, VscTrash } from 'react-icons/vsc';

import { getReferencesAtom } from '../../../atoms/referencesState';
import { emitEvent } from '../../../events';
import { cx } from '../../../lib/cx';
import { ReferenceItem, ReferenceItemStatus } from '../../../types/ReferenceItem';
import { ReferencesItemStatusLabel } from '../components/ReferencesItemStatusLabel';
import { UploadTipInstructions } from '../components/UploadTipInstructions';

export function ReferencesTableView() {
  const references = useAtomValue(getReferencesAtom);
  const [quickFilter, setQuickFilter] = useState('');
  const [numberOfSelectedRows, setNumberOfSelectedRows] = useState(0);

  const handleTextEdit = useCallback(({ oldValue, newValue }: NewValueParams<ReferenceItem, 'string'>) => {
    console.log('EDIT');
    console.log(`${oldValue} -> ${newValue}`);
  }, []);

  const authorsFormatter = useCallback(
    ({ value }: { value: ReferenceItem['authors'] }) => value.map((a) => a.fullName.split(' ').pop()).join(', '),
    [],
  );

  const onSelectionChanged = useCallback((event: SelectionChangedEvent) => {
    const rowCount = event.api.getSelectedNodes().length;
    setNumberOfSelectedRows(rowCount);
  }, []);

  const defaultColDef = useMemo<ColDef>(
    () => ({
      minWidth: 50,
      resizable: true,
    }),
    [],
  );

  const columnDefs = useMemo<ColDef<ReferenceItem>[]>(
    () => [
      {
        field: 'citationKey',
        headerName: 'Cite Key',
        pinned: true,
        sortable: true,
        width: 160,
        flex: undefined,
        checkboxSelection: true,
        headerCheckboxSelection: true,
      },
      {
        field: 'authors',
        headerName: 'First Author',
        valueGetter: (param) => param.data?.authors[0],
        valueFormatter: ({ value }: { value?: ReferenceItem['authors'][0] }) => value?.fullName ?? '',
      },
      { field: 'title', filter: true, sortable: true, flex: 1, editable: true, onCellValueChanged: handleTextEdit },
      { field: 'abstract', flex: 2, filter: true },
      { field: 'publishedDate', filter: true, sortable: true, width: 140, flex: undefined },
      {
        field: 'authors',
        valueFormatter: authorsFormatter,
        filter: true,
      },
      {
        field: 'status',
        width: 120,
        sortable: true,
        filter: true,
        cellRenderer: StatusCell,
      },
    ],
    [handleTextEdit, authorsFormatter],
  );

  return (
    <div className="flex w-full flex-col overflow-y-auto p-6">
      {references.length === 0 && <UploadTipInstructions />}

      <div className="relative mb-4 flex items-center justify-between gap-10">
        <input
          className="grow border border-slate-400 bg-slate-50 px-4 py-1 outline-none"
          id="filter-text-box"
          placeholder="Search within references..."
          ref={autoFocusAndSelect}
          type="text"
          value={quickFilter}
          onInput={(e) => setQuickFilter(e.currentTarget.value)}
        />
        <div className="text-md flex gap-2">
          <TopActionItem
            action="Add"
            icon={VscNewFile}
            onClick={() => emitEvent('refstudio://menu/references/upload')}
          />
          <TopActionItem
            action="Remove"
            disabled={numberOfSelectedRows === 0}
            icon={VscTrash}
            selectedCount={numberOfSelectedRows}
          />
          <TopActionItem action="Export" disabled icon={VscDesktopDownload} />
        </div>
      </div>

      <AgGridReact
        animateRows
        className="ag-theme-alpine grow"
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        getRowId={(params: GetRowIdParams<ReferenceItem>) => params.data.id}
        quickFilterText={quickFilter}
        rowData={references}
        rowSelection="multiple"
        suppressRowClickSelection
        onSelectionChanged={onSelectionChanged}
      />
    </div>
  );
}

function StatusCell({ value }: ICellRendererParams<ReferenceItem, ReferenceItemStatus>) {
  if (!value) {
    return null;
  }
  return (
    <span className="text-xs">
      <ReferencesItemStatusLabel status={value} />
    </span>
  );
}

function autoFocusAndSelect(input: HTMLInputElement | null) {
  input?.focus();
  input?.select();
}

function TopActionItem({
  action,
  icon: Icon,
  selectedCount = 0,
  disabled,
  onClick,
}: {
  action: string;
  selectedCount?: number;
  disabled?: boolean;
  icon: IconType;
  onClick?: () => void;
}) {
  return (
    <span
      className={cx(
        'flex items-center gap-1 rounded-md px-2 py-1',
        'cursor-pointer',
        'border border-slate-400 hover:bg-slate-400 hover:text-white',
        {
          'pointer-events-none bg-slate-100 text-slate-400': disabled,
        },
      )}
      onClick={onClick}
    >
      <Icon />
      {action}
      {selectedCount > 0 && <span>({selectedCount})</span>}
    </span>
  );
}
