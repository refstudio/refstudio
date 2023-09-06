import { createStore } from 'jotai';

import { setCurrentFileSystemProjectId } from '../../io/filesystem';
import { DebugAtomModuleType } from '../debugAtom';
import { closeAllEditorsAtom } from '../editorActions';
import { refreshFileTreeAtom } from '../fileExplorerActions';
import { closeProjectAtom, isProjectOpenAtom, openProjectAtom, projectNameAtom } from '../projectState';
import { clearAllReferencesAtom, loadReferencesAtom } from '../referencesState';

vi.mock('../../io/filesystem');

vi.mock('../editorActions', async () => {
  const { debugAtom } = await vi.importActual<DebugAtomModuleType>('../debugAtom');
  return {
    closeAllEditorsAtom: debugAtom(),
  };
});

vi.mock('../referencesState', async () => {
  const { debugAtom } = await vi.importActual<DebugAtomModuleType>('../debugAtom');
  return {
    loadReferencesAtom: debugAtom(),
    clearAllReferencesAtom: debugAtom(),
  };
});

vi.mock('../fileExplorerActions', async () => {
  const { debugAtom } = await vi.importActual<DebugAtomModuleType>('../debugAtom');
  return {
    refreshFileTreeAtom: debugAtom(),
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

  it('should set project id, load references and refresh files, when new project is open', async () => {
    await store.set(openProjectAtom, 'project-id', 'project-path', 'project-name');
    expect(store.get(isProjectOpenAtom)).toBeTruthy();
    expect(store.get(projectNameAtom)).toBe('project-name');
    expect(setCurrentFileSystemProjectId).toHaveBeenCalledWith('project-id');

    expect(store.get(loadReferencesAtom)).toHaveBeenCalledWith('project-id');
    expect(store.get(refreshFileTreeAtom)).toHaveBeenCalledWith();
  });

  it('should close open project', async () => {
    await store.set(openProjectAtom, 'project-id', 'project-path', 'project-name');
    expect(store.get(isProjectOpenAtom)).toBeTruthy();

    await store.set(closeProjectAtom);
    expect(store.get(isProjectOpenAtom)).toBeFalsy();
    expect(store.get(projectNameAtom)).toBe('');
    expect(setCurrentFileSystemProjectId).toHaveBeenCalledWith('');
  });

  it('should close all open editors and clear all references on close', async () => {
    await store.set(openProjectAtom, 'project-id', 'project-path', 'project-name');
    await store.set(closeProjectAtom);
    expect(store.get(closeAllEditorsAtom)).toHaveBeenCalled();
    expect(store.get(clearAllReferencesAtom)).toHaveBeenCalled();
    expect(store.get(refreshFileTreeAtom)).toHaveBeenCalled();
  });
});
