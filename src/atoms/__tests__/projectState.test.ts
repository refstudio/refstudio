import { atom, createStore } from 'jotai';

import { setCurrentFileSystemProjectId } from '../../io/filesystem';
import { closeProjectAtom, isProjectOpenAtom, newProjectAtom, projectNameAtom } from '../projectState';
import { loadReferencesAtom } from '../referencesState';

vi.mock('../../io/filesystem');

// vi.mock('../editorActions', () => ({
//   closeAllEditorsAtom: makeDebugAtom('closeAllEditorsAtom'),
// }));

// vi.mock('../referencesState', () => ({
//   loadReferencesAtom: makeDebugAtom('loadReferencesAtom'),
//   // clearAllReferencesAtom: makeDebugAtom('clearAllReferencesAtom'),
// }));

vi.mock('../referencesState', () => {
  const fn = vi.fn();
  return {
    loadReferencesAtom: atom(
      () => fn,
      (_, __, ...args) => {
        fn(...args);
      },
    ),
  };
});
//   // clearAllReferencesAtom: makeDebugAtom('clearAllReferencesAtom'),

// vi.mock('../fileExplorerActions', () => ({
//   refreshFileTreeAtom: makeDebugAtom('refreshFileTreeAtom'),
// }));

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

  it.only('should set project id, load references and refresh files, when new project is created', async () => {
    await store.set(newProjectAtom, 'project-id', 'project-path', 'project-name');
    expect(store.get(isProjectOpenAtom)).toBeTruthy();
    expect(store.get(projectNameAtom)).toBe('project-name');
    expect(setCurrentFileSystemProjectId).toHaveBeenCalledWith('project-id');
    expect(store.get(loadReferencesAtom)).toHaveBeenCalledWith('project-id');
    // expect(getDebugAtomSpy('loadReferencesAtom')).toHaveBeenCalledWith('project-id', 10);
    // expect(loadReferencesAtom).toBe(1);
    // expect(getDebugAtomSpy('refreshFileTreeAtom')).toHaveBeenCalled();
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
    expect(getDebugAtomParams('closeAllEditorsAtom')).toHaveBeenCalled();
    expect(getDebugAtomParams('clearAllReferencesAtom')).toHaveBeenCalled();
    expect(getDebugAtomParams('refreshFileTreeAtom')).toHaveBeenCalled();
  });
});
