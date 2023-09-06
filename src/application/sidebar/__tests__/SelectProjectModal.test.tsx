import { createStore } from 'jotai';

import { allProjectsAtom, selectProjectModalAtoms } from '../../../atoms/projectState';
import { screen, setupWithJotaiProvider, waitFor } from '../../../test/test-utils';
import { PROJECTS } from '../../components/__tests__/test-fixtures';
import { SelectProjectModal } from '../../SelectProjectModal';

describe('SelectProjectModal', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
  });

  afterEach(() => {
    vi.clearAllMocks();
    try {
      // dialog cleanup
      if (store.get(selectProjectModalAtoms.visibleAtom)) {
        store.set(selectProjectModalAtoms.dismissAtom);
      }
    } catch {
      // ignore
    }
  });

  it('should not render the modal when not open', () => {
    setupWithJotaiProvider(<SelectProjectModal />, store);
    expect(screen.queryByText('Select one project to open')).not.toBeInTheDocument();
  });

  it('should render the modal when open', async () => {
    setupWithJotaiProvider(<SelectProjectModal />, store);
    store.set(allProjectsAtom, PROJECTS);
    const dialogPromise = store.set(selectProjectModalAtoms.openAtom);
    expect(dialogPromise).toBeDefined();
    await waitFor(() => {
      expect(screen.getByText('Select one project to open')).toBeInTheDocument();
    });

    expect(screen.getAllByRole('menuitem')).toHaveLength(PROJECTS.length);
  });

  it('should return the typed project id when closed', async () => {
    const { user } = setupWithJotaiProvider(<SelectProjectModal />, store);
    store.set(allProjectsAtom, PROJECTS);
    const dialogPromise = store.set(selectProjectModalAtoms.openAtom);
    await waitFor(() => {
      expect(screen.getByText('Select one project to open')).toBeInTheDocument();
    });

    await user.click(screen.getByText(PROJECTS[0].name));

    await expect(dialogPromise).resolves.toEqual({
      status: 'closed',
      value: PROJECTS[0].id,
    });
  });
});
