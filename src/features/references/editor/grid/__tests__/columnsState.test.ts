import { ColumnState } from 'ag-grid-community';

import { mockLocalStorage } from '../../../../../test/mockLocalStorage';
import { COLUMNS_STATE_STORAGE_KEY, loadColumnsState, resetColumnsState, saveColumnsState } from '../columnsState';

vi.mock('ag-grid-community');

const { getItemMock, setItemMock, removeItemMock } = mockLocalStorage();
const SAMPLE_COLUMN_STATE: ColumnState[] = [
  {
    colId: 'title',
    flex: 1,
    sort: 'asc',
  },
  {
    colId: 'authors',
    hide: false,
    flex: 2,
  },
];

describe('columnsState', () => {
  it('should save empty column state to localStorage', () => {
    saveColumnsState(() => []);
    expect(setItemMock).toHaveBeenCalledWith(COLUMNS_STATE_STORAGE_KEY, JSON.stringify([]));
  });

  it('should save column state to localStorage', () => {
    saveColumnsState(() => SAMPLE_COLUMN_STATE);
    expect(setItemMock).toHaveBeenCalledWith(COLUMNS_STATE_STORAGE_KEY, JSON.stringify(SAMPLE_COLUMN_STATE));
  });

  it('should ignore call to save', () => {
    saveColumnsState(() => [], true);
    expect(setItemMock).not.toHaveBeenCalled();
  });

  it('should load state from localstorage', () => {
    getItemMock.mockReturnValue(JSON.stringify(SAMPLE_COLUMN_STATE));
    const fn = vi.fn();
    loadColumnsState(fn);
    expect(fn).toHaveBeenCalledWith(SAMPLE_COLUMN_STATE);
  });

  it('should clear localstorage on reset', () => {
    const fn = vi.fn();
    resetColumnsState(fn);
    expect(fn).toHaveBeenCalled();
    expect(removeItemMock).toHaveBeenCalledWith(COLUMNS_STATE_STORAGE_KEY);
  });
});
