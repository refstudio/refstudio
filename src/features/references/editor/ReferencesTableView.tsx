import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './ReferenceView.css';

import { ColDef, GetRowIdParams, ICellRendererParams, NewValueParams, SelectionChangedEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react/lib/agGridReact';
import { useAtomValue } from 'jotai';
import { useCallback, useMemo, useRef, useState } from 'react';
import { VscDesktopDownload, VscKebabVertical, VscNewFile, VscTable, VscTrash } from 'react-icons/vsc';

import { getReferencesAtom } from '../../../atoms/referencesState';
import { emitEvent } from '../../../events';
import { autoFocusAndSelect } from '../../../lib/autoFocusAndSelect';
import { ReferenceItem, ReferenceItemStatus } from '../../../types/ReferenceItem';
import { ReferencesItemStatusLabel } from '../components/ReferencesItemStatusLabel';
import { TopActionIcon } from '../components/TopActionIcon';
import { UploadTipInstructions } from '../components/UploadTipInstructions';
import { loadColumnsState, resetColumnsState, saveColumnsState } from './columnsState';
import { authorsFormatter, firstAuthorFormatter } from './formatters';

export function ReferencesTableView({ defaultFilter = '' }: { defaultFilter?: string }) {
  const references = useAtomValue(getReferencesAtom);
  const [quickFilter, setQuickFilter] = useState(defaultFilter);
  const [numberOfSelectedRows, setNumberOfSelectedRows] = useState(0);

  const gridRef = useRef<AgGridReact<ReferenceItem>>(null);

  const handleTitleEdit = useCallback(({ oldValue, newValue }: NewValueParams<ReferenceItem, 'string'>) => {
    console.log('EDIT');
    console.log(`${oldValue} -> ${newValue}`);
  }, []);

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
        initialPinned: 'left',
        initialWidth: 160,
        sortable: true,
        flex: undefined,
        checkboxSelection: true,
        headerCheckboxSelection: true,
      },
      {
        field: 'authors',
        colId: 'first_author',
        headerName: 'First Author',
        valueFormatter: firstAuthorFormatter,
      },
      {
        field: 'title',
        filter: true,
        sortable: true,
        initialSort: 'asc',
        initialFlex: 1,
        editable: true,
        onCellValueChanged: handleTitleEdit,
      },
      { field: 'abstract', flex: 2, filter: true, sortable: true },
      { field: 'publishedDate', filter: true, sortable: true, initialWidth: 140, initialFlex: undefined },
      {
        field: 'authors',
        valueFormatter: authorsFormatter,
        filter: true,
      },
      {
        field: 'status',
        initialWidth: 120,
        sortable: true,
        filter: true,
        cellRenderer: StatusCell,
      },
    ],
    [handleTitleEdit],
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
        <div className="text-md flex items-center gap-2">
          <TopActionIcon
            action="Add"
            icon={VscNewFile}
            onClick={() => emitEvent('refstudio://menu/references/upload')}
          />
          <VscKebabVertical />
          <TopActionIcon
            action="Remove"
            disabled={numberOfSelectedRows === 0}
            icon={VscTrash}
            selectedCount={numberOfSelectedRows}
          />
          <TopActionIcon action="Export" disabled icon={VscDesktopDownload} />
          <VscKebabVertical />
          <TopActionIcon
            action="Reset Cols"
            icon={VscTable}
            onClick={() => resetColumnsState(gridRef.current!.columnApi)}
          />
        </div>
      </div>

      <AgGridReact
        animateRows
        className="ag-theme-alpine grow"
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        getRowId={(params: GetRowIdParams<ReferenceItem>) => params.data.id}
        quickFilterText={quickFilter}
        ref={gridRef}
        rowData={references}
        rowSelection="multiple"
        suppressRowClickSelection
        onColumnMoved={(params) => saveColumnsState(params.columnApi, !params.finished)}
        onColumnResized={(params) => saveColumnsState(params.columnApi, !params.finished)}
        onColumnValueChanged={(params) => saveColumnsState(params.columnApi)}
        onGridReady={(params) => loadColumnsState(params.columnApi)}
        onSelectionChanged={onSelectionChanged}
        onSortChanged={(params) => saveColumnsState(params.columnApi)}
      />
    </div>
  );
}

function StatusCell({ value }: ICellRendererParams<ReferenceItem, ReferenceItemStatus>) {
  if (!value) {
    return null;
  }
  return (
    <span className="text-[10px]">
      <ReferencesItemStatusLabel status={value} />
    </span>
  );
}
