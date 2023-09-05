import { atom, createStore } from 'jotai';

import { setCurrentFileSystemProjectId } from '../../io/filesystem';
import { closeAllEditorsAtom } from '../editorActions';
import { refreshFileTreeAtom } from '../fileExplorerActions';
import { closeProjectAtom, isProjectOpenAtom, newProjectAtom, projectNameAtom } from '../projectState';
import { clearAllReferencesAtom, loadReferencesAtom } from '../referencesState';

vi.mock('../../io/filesystem');

vi.mock('../editorActions', () => {
  const fn = vi.fn();
  return {
    closeAllEditorsAtom: atom(
      () => fn,
      (_, __, ...args) => void fn(...args),
    ),
  };
});

vi.mock('../referencesState', () => {
  const loadReferencesAtomFn = vi.fn();
  const clearAllReferencesAtomFn = vi.fn();
  return {
    loadReferencesAtom: atom(
      () => loadReferencesAtomFn,
      (_, __, ...args) => void loadReferencesAtomFn(...args),
    ),
    clearAllReferencesAtom: atom(
      () => clearAllReferencesAtomFn,
      (_, __, ...args) => void clearAllReferencesAtomFn(...args),
    ),
  };
});

vi.mock('../fileExplorerActions', () => {
  const fn = vi.fn();
  return {
    refreshFileTreeAtom: atom(
      () => fn,
      (_, __, ...args) => void fn(...args),
    ),
  };
});

describe('projectState', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should start with project closed', () => {
    expect(store.get(isProjectOpenAtom)).toBeFalsy();
  });

  it('should set project id, load references and refresh files, when new project is created', async () => {
    await store.set(newProjectAtom, 'project-id', 'project-path', 'project-name');
    expect(store.get(isProjectOpenAtom)).toBeTruthy();
    expect(store.get(projectNameAtom)).toBe('project-name');
    expect(setCurrentFileSystemProjectId).toHaveBeenCalledWith('project-id');

    expect(store.get(loadReferencesAtom)).toHaveBeenCalledWith('project-id');
    expect(store.get(refreshFileTreeAtom)).toHaveBeenCalledWith();
  });

  it('should close open project', async () => {
    await store.set(newProjectAtom, 'project-id', 'project-path', 'project-name');
    expect(store.get(isProjectOpenAtom)).toBeTruthy();

    await store.set(closeProjectAtom);
    expect(store.get(isProjectOpenAtom)).toBeFalsy();
    expect(store.get(projectNameAtom)).toBe('');
    expect(setCurrentFileSystemProjectId).toHaveBeenCalledWith('');
  });

  it('should close all open editors and clear all references on close', async () => {
    await store.set(newProjectAtom, 'project-id', 'project-path', 'project-name');
    await store.set(closeProjectAtom);
    expect(store.get(closeAllEditorsAtom)).toHaveBeenCalled();
    expect(store.get(clearAllReferencesAtom)).toHaveBeenCalled();
    expect(store.get(refreshFileTreeAtom)).toHaveBeenCalled();
  });
});
