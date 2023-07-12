import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-alpine.css';
import './ReferenceView.css';

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import {
  ColDef,
  GetRowIdParams,
  ModuleRegistry,
  NewValueParams,
  SelectionChangedEvent,
  SuppressKeyboardEventParams,
} from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react';
import { useAtomValue, useSetAtom } from 'jotai';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { VscDesktopDownload, VscKebabVertical, VscNewFile, VscTable, VscTrash } from 'react-icons/vsc';

import { getReferencesAtom, updateReferenceAtom } from '../../../atoms/referencesState';
import { emitEvent } from '../../../events';
import { autoFocusAndSelect } from '../../../lib/autoFocusAndSelect';
import { isNonNullish } from '../../../lib/isNonNullish';
import { ReferenceItem } from '../../../types/ReferenceItem';
import { TopActionIcon } from '../components/TopActionIcon';
import { UploadTipInstructions } from '../components/UploadTipInstructions';
import { ActionsCell } from './grid/ActionsCell';
import { AuthorsEditor } from './grid/AuthorsEditor';
import { loadColumnsState, resetColumnsState, saveColumnsState } from './grid/columnsState';
import { authorsFormatter, firstAuthorFormatter } from './grid/formatters';
import { StatusCell } from './grid/StatusCell';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

export function ReferencesTableView({ defaultFilter = '' }: { defaultFilter?: string }) {
  const references = useAtomValue(getReferencesAtom);
  const updateReference = useSetAtom(updateReferenceAtom);
  const [quickFilter, setQuickFilter] = useState(defaultFilter);

  useEffect(() => setQuickFilter(defaultFilter), [defaultFilter]);

  const [selectedReferences, setSelectedReferences] = useState<ReferenceItem[]>([]);

  const gridRef = useRef<AgGridReact<ReferenceItem>>(null);

  const handleCellValueChanged = useCallback(
    (params: NewValueParams<ReferenceItem>) => void updateReference(params.data.id, params.data),
    [updateReference],
  );

  const onSelectionChanged = useCallback((event: SelectionChangedEvent<ReferenceItem>) => {
    const rows = event.api.getSelectedNodes();
    setSelectedReferences(rows.map((row) => row.data).filter(isNonNullish));
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
        editable: true,
        checkboxSelection: true,
        headerCheckboxSelection: true,
        onCellValueChanged: handleCellValueChanged,
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
        onCellValueChanged: handleCellValueChanged,
      },
      { field: 'abstract', flex: 2, filter: true, sortable: true },
      {
        field: 'publishedDate',
        headerName: 'Published',
        filter: true,
        sortable: true,
        editable: true,
        initialWidth: 140,
        initialFlex: undefined,
        cellEditor: 'agDateStringCellEditor',
        onCellValueChanged: handleCellValueChanged,
      },
      {
        field: 'authors',
        valueFormatter: authorsFormatter,
        editable: true,
        suppressKeyboardEvent: (params) => params.editing && suppressShiftEnter(params),
        cellEditor: memo(AuthorsEditor),
        cellEditorPopupPosition: 'under',
        cellEditorPopup: true,
        filter: true,
        onCellValueChanged: handleCellValueChanged,
      },
      {
        field: 'status',
        initialWidth: 120,
        sortable: true,
        filter: true,
        cellRenderer: memo(StatusCell),
      },
      {
        field: 'id',
        colId: 'actions',
        headerName: '',
        sortable: false,
        filter: false,
        width: 80,
        cellRenderer: memo(ActionsCell),
      },
    ],
    [handleCellValueChanged],
  );

  const handleOnBulkRemove = () =>
    emitEvent('refstudio://references/remove', {
      referenceIds: selectedReferences.map((r) => r.id),
    });

  const rowData = useMemo(() => references.map((r) => ({ ...r })), [references]);

  return (
    <div className="flex w-full flex-col overflow-y-auto p-6">
      {references.length === 0 && <UploadTipInstructions />}

      <div className="relative mb-4 flex items-center justify-between gap-10">
        <input
          className="grow border border-slate-400 bg-slate-50 px-4 py-1 outline-none"
          data-testid="filter-text-box"
          id="filter-text-box"
          placeholder="Search within references..."
          ref={autoFocusAndSelect}
          type="text"
          value={quickFilter}
          onInput={(e) => setQuickFilter(e.currentTarget.value)}
        />
        <div className="text-md flex items-center gap-2" data-testid="actions-menu">
          <TopActionIcon
            action="Add"
            icon={VscNewFile}
            onClick={() => emitEvent('refstudio://menu/references/upload')}
          />
          <VscKebabVertical />
          <TopActionIcon
            action="Remove"
            disabled={selectedReferences.length === 0}
            icon={VscTrash}
            selectedCount={selectedReferences.length}
            onClick={handleOnBulkRemove}
          />
          <TopActionIcon action="Export" disabled icon={VscDesktopDownload} />
          <VscKebabVertical />
          <TopActionIcon
            action="Reset Cols"
            icon={VscTable}
            onClick={() => resetColumnsState(() => gridRef.current!.columnApi.resetColumnState())}
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
        rowData={rowData}
        rowSelection="multiple"
        suppressRowClickSelection
        onColumnMoved={(params) => saveColumnsState(() => params.columnApi.getColumnState(), !params.finished)}
        onColumnResized={(params) => saveColumnsState(() => params.columnApi.getColumnState(), !params.finished)}
        onColumnValueChanged={(params) => saveColumnsState(() => params.columnApi.getColumnState())}
        onGridReady={(params) =>
          loadColumnsState((cols) => params.columnApi.applyColumnState({ state: cols, applyOrder: true }))
        }
        onSelectionChanged={onSelectionChanged}
        onSortChanged={(params) => saveColumnsState(() => params.columnApi.getColumnState())}
      />
    </div>
  );
}

function suppressShiftEnter(params: SuppressKeyboardEventParams) {
  const KEY_ENTER = 'Enter';
  const { event } = params;
  const { key } = event;
  return key === KEY_ENTER && event.shiftKey;
}
