import { createStore } from 'jotai';

import { createModalAtoms } from '../createModalAtoms';

describe('createModalAtoms.string', () => {
  let store: ReturnType<typeof createStore>;
  let createProjectModalAtoms: ReturnType<typeof createModalAtoms<string>>;

  beforeEach(() => {
    store = createStore();
    createProjectModalAtoms = createModalAtoms<string>();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should show and hide a modal to create new project', async () => {
    const valuePromise = store.set(createProjectModalAtoms.openAtom);
    expect(store.get(createProjectModalAtoms.visibleAtom)).toBeTruthy();

    store.set(createProjectModalAtoms.closeAtom, 'project name');
    await expect(valuePromise).resolves.toEqual({ status: 'closed', value: 'project name' });
    expect(store.get(createProjectModalAtoms.visibleAtom)).toBeFalsy();
  });

  it('should be able to dismiss modal', async () => {
    const valuePromise = store.set(createProjectModalAtoms.openAtom);
    store.set(createProjectModalAtoms.dismissAtom);
    await expect(valuePromise).resolves.toEqual({ status: 'dismissed' });
  });

  it('should throw error in show is called twice', async () => {
    const valuePromise = store.set(createProjectModalAtoms.openAtom);
    expect(valuePromise).toBeDefined();
    await expect(store.set(createProjectModalAtoms.openAtom)).rejects.toThrow();
  });

  it('should throw error in dismiss is called twice', () => {
    const valuePromise = store.set(createProjectModalAtoms.openAtom);
    expect(valuePromise).toBeDefined();
    store.set(createProjectModalAtoms.dismissAtom);
    expect(() => store.set(createProjectModalAtoms.dismissAtom)).toThrow();
  });

  it('should throw error in close is called twice', () => {
    const valuePromise = store.set(createProjectModalAtoms.openAtom);
    expect(valuePromise).toBeDefined();
    store.set(createProjectModalAtoms.closeAtom, 'value');
    expect(() => store.set(createProjectModalAtoms.closeAtom, 'value')).toThrow();
  });
});
