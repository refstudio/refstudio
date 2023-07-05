import { ColumnState } from '@ag-grid-community/core';

export const COLUMNS_STATE_STORAGE_KEY = 'referencesTableView.cols';

export function loadColumnsState(applyColumnState: (cols: ColumnState[]) => void) {
  const cols = localStorage.getItem(COLUMNS_STATE_STORAGE_KEY);
  if (cols) {
    const state = JSON.parse(cols) as ColumnState[];
    applyColumnState(state);
  }
}
export function saveColumnsState(getColumnState: () => ColumnState[], ignoreSave = false) {
  if (!ignoreSave) {
    const cols = getColumnState();
    localStorage.setItem(COLUMNS_STATE_STORAGE_KEY, JSON.stringify(cols));
  }
}
export function resetColumnsState(resetCols: () => void) {
  localStorage.removeItem(COLUMNS_STATE_STORAGE_KEY);
  resetCols();
}
