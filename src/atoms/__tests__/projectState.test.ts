import { createStore } from 'jotai';

import { setCurrentFileSystemProjectId } from '../../io/filesystem';
import { closeProjectAtom, isProjectOpenAtom, newProjectAtom, projectNameAtom } from '../projectState';
import { getDebugAtomSpy, makeDebugAtom } from './debugAtom';

vi.mock('../../io/filesystem');

vi.mock('../editorActions', () => ({
  closeAllEditorsAtom: makeDebugAtom('closeAllEditorsAtom'),
}));

vi.mock('../referencesState', () => ({
  loadReferencesAtom: makeDebugAtom('loadReferencesAtom'),
  clearAllReferencesAtom: makeDebugAtom('clearAllReferencesAtom'),
}));

vi.mock('../fileExplorerActions', () => ({
  refreshFileTreeAtom: makeDebugAtom('refreshFileTreeAtom'),
}));

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
    expect(getDebugAtomSpy('loadReferencesAtom')).toHaveBeenCalledWith('project-id', 10);
    expect(getDebugAtomSpy('refreshFileTreeAtom')).toHaveBeenCalled();
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
    expect(getDebugAtomSpy('closeAllEditorsAtom')).toHaveBeenCalled();
    expect(getDebugAtomSpy('clearAllReferencesAtom')).toHaveBeenCalled();
    expect(getDebugAtomSpy('refreshFileTreeAtom')).toHaveBeenCalled();
  });
});
