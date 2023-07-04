import { ColumnApi, ColumnState } from 'ag-grid-community';

const COLUMNS_STATE_STORAGE_KEY = 'referencesTableView.cols';
export function loadColumnsState(columnApi: ColumnApi) {
  const cols = localStorage.getItem(COLUMNS_STATE_STORAGE_KEY);
  if (cols) {
    const state = JSON.parse(cols) as ColumnState[];
    columnApi.applyColumnState({ state, applyOrder: true });
  }
}
export function saveColumnsState(columnApi: ColumnApi, ignoreSave = false) {
  if (!ignoreSave) {
    const cols = columnApi.getColumnState();
    localStorage.setItem(COLUMNS_STATE_STORAGE_KEY, JSON.stringify(cols));
  }
}
export function resetColumnsState(columnApi: ColumnApi) {
  columnApi.resetColumnState();
  localStorage.removeItem(COLUMNS_STATE_STORAGE_KEY);
}
