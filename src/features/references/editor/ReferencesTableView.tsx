import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-alpine.css';
import './ReferencesTableView.css';

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

import { AddIcon } from '../../../application/components/icons';
import { projectIdAtom } from '../../../atoms/projectState';
import { getReferencesAtom, updateReferenceAtom } from '../../../atoms/referencesState';
import { Button } from '../../../components/Button';
import { SearchBar } from '../../../components/SearchBar';
import { emitEvent } from '../../../events';
import { isNonNullish } from '../../../lib/isNonNullish';
import { ReferenceItem } from '../../../types/ReferenceItem';
import { BinIcon, ExportIcon, ResetColIcon } from '../components/icons';
import { ActionsCell } from './grid/ActionsCell';
import { AuthorsEditor } from './grid/AuthorsEditor';
import { loadColumnsState, resetColumnsState, saveColumnsState } from './grid/columnsState';
import { authorsFormatter, firstAuthorFormatter } from './grid/formatters';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

export function ReferencesTableView({ defaultFilter = '' }: { defaultFilter?: string }) {
  const references = useAtomValue(getReferencesAtom);
  const projectId = useAtomValue(projectIdAtom);
  const updateReference = useSetAtom(updateReferenceAtom);
  const [quickFilter, setQuickFilter] = useState(defaultFilter);

  useEffect(() => setQuickFilter(defaultFilter), [defaultFilter]);

  const [selectedReferences, setSelectedReferences] = useState<ReferenceItem[]>([]);

  const gridRef = useRef<AgGridReact<ReferenceItem>>(null);

  const handleCellValueChanged = useCallback(
    (params: NewValueParams<ReferenceItem>) => void updateReference(projectId, params.data.id, params.data),
    [updateReference, projectId],
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
        headerName: 'Citation Key',
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
    <div className="flex flex-1 flex-col items-stretch gap-6 pb-10">
      <div className="flex items-center justify-center gap-4">
        <div className='flex-1'>
          <SearchBar
            fluid
            initialValue={quickFilter}
            placeholder="Filter author/title..."
            onChange={(newValue) => setQuickFilter(newValue)}
          />
        </div>
        <div className="h-8 w-px bg-content-area-border" />
        <Button
          Action={<AddIcon />}
          size="M"
          text="Add"
          type="secondary"
          onClick={() => emitEvent('refstudio://menu/references/upload')}
        />
        <div className="h-8 w-px bg-content-area-border" />
        <div className='flex justify-center gap-2 items-center'>
          <Button
            Action={<BinIcon />}
            disabled={selectedReferences.length === 0}
            size="M"
            text={selectedReferences.length > 0 ? `Remove (${selectedReferences.length})` : 'Remove'}
            type="secondary"
            onClick={handleOnBulkRemove}
          />
          <Button
            Action={<ExportIcon />}
            size="M"
            text="Export"
            type="secondary"
            onClick={() => emitEvent('refstudio://menu/references/export')}
          />
        </div>
        <div className="h-8 w-px bg-content-area-border" />
        <Button
          Action={<ResetColIcon />}
          size="M"
          text="Reset Col"
          type="secondary"
          onClick={() => resetColumnsState(() => gridRef.current!.columnApi.resetColumnState())}
        />
      </div>

      <div className='flex-1 rounded-default bg-card-bg-primary shadow-default overflow-hidden'>
        <AgGridReact
          animateRows
          className="ag-theme-alpine ag-theme-refstudio flex-1"
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
    </div>
  );
}

function suppressShiftEnter(params: SuppressKeyboardEventParams) {
  const KEY_ENTER = 'Enter';
  const { event } = params;
  const { key } = event;
  return key === KEY_ENTER && event.shiftKey;
}
