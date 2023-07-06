import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-alpine.css';
import './ReferenceView.css';

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import {
  ColDef,
  GetRowIdParams,
  ICellRendererParams,
  ModuleRegistry,
  NewValueParams,
  SelectionChangedEvent,
} from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react';
import { useAtomValue, useSetAtom } from 'jotai';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  VscDesktopDownload,
  VscFile,
  VscFilePdf,
  VscKebabVertical,
  VscNewFile,
  VscTable,
  VscTrash,
} from 'react-icons/vsc';

import { openReferenceAtom, openReferencePdfAtom } from '../../../atoms/editorActions';
import { getReferencesAtom } from '../../../atoms/referencesState';
import { emitEvent } from '../../../events';
import { autoFocusAndSelect } from '../../../lib/autoFocusAndSelect';
import { isNonNullish } from '../../../lib/isNonNullish';
import { ReferenceItem, ReferenceItemStatus } from '../../../types/ReferenceItem';
import { ReferencesItemStatusLabel } from '../components/ReferencesItemStatusLabel';
import { TopActionIcon } from '../components/TopActionIcon';
import { UploadTipInstructions } from '../components/UploadTipInstructions';
import { loadColumnsState, resetColumnsState, saveColumnsState } from './grid/columnsState';
import { authorsFormatter, firstAuthorFormatter } from './grid/formatters';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

export function ReferencesTableView({ defaultFilter = '' }: { defaultFilter?: string }) {
  const references = useAtomValue(getReferencesAtom);
  const [quickFilter, setQuickFilter] = useState(defaultFilter);

  useEffect(() => setQuickFilter(defaultFilter), [defaultFilter]);

  const [selectedReferences, setSelectedReferences] = useState<ReferenceItem[]>([]);

  const gridRef = useRef<AgGridReact<ReferenceItem>>(null);

  const handleTitleEdit = useCallback(({ oldValue, newValue }: NewValueParams<ReferenceItem, 'string'>) => {
    console.log('EDIT');
    console.log(`${oldValue} -> ${newValue}`);
  }, []);

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
      {
        field: 'publishedDate',
        headerName: 'Published',
        filter: true,
        sortable: true,
        initialWidth: 140,
        initialFlex: undefined,
      },
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
    [handleTitleEdit],
  );

  const handleOnBulkRemove = () =>
    emitEvent('refstudio://references/remove', {
      referenceIds: selectedReferences.map((r) => r.id),
    });

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
        rowData={references}
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

function ActionsCell({ data: reference }: ICellRendererParams<ReferenceItem, ReferenceItemStatus>) {
  const openReference = useSetAtom(openReferenceAtom);
  const openReferencePdf = useSetAtom(openReferencePdfAtom);

  if (!reference) {
    return null;
  }
  return (
    <div className="flex h-full w-full items-center justify-center gap-2">
      <VscFile
        className="shrink-0 cursor-pointer"
        size={20}
        title="Open Reference Details"
        onClick={() => openReference(reference.id)}
      />
      <VscFilePdf
        className="shrink-0 cursor-pointer"
        size={20}
        title="Open Reference PDF"
        onClick={() => openReferencePdf(reference.id)}
      />
    </div>
  );
}
