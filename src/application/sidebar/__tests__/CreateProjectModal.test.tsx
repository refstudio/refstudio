import { createStore } from 'jotai';

import { createProjectModalAtoms } from '../../../atoms/projectState';
import { screen, setupWithJotaiProvider, waitFor } from '../../../test/test-utils';
import { CreateProjectModal } from '../../CreateProjectModal';

describe('CreateProjectModal', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
  });

  afterEach(() => {
    vi.clearAllMocks();
    try {
      // dialog cleanup
      if (store.get(createProjectModalAtoms.visibleAtom)) {
        store.set(createProjectModalAtoms.dismissAtom);
      }
    } catch {
      // ignore
    }
  });

  it('should not render the modal when not open', () => {
    setupWithJotaiProvider(<CreateProjectModal />, store);
    expect(screen.queryByText('Project Name')).not.toBeInTheDocument();
  });

  it('should render the modal when open', async () => {
    setupWithJotaiProvider(<CreateProjectModal />, store);
    const dialogPromise = store.set(createProjectModalAtoms.openAtom);
    expect(dialogPromise).toBeDefined();
    await waitFor(() => {
      expect(screen.getByText('Project Name')).toBeInTheDocument();
    });
  });

  it('should return the typed project name when closed', async () => {
    const { user } = setupWithJotaiProvider(<CreateProjectModal />, store);
    const dialogPromise = store.set(createProjectModalAtoms.openAtom);
    await waitFor(() => {
      expect(screen.getByText('Project Name')).toBeInTheDocument();
    });

    await user.type(screen.getByTestId('project-name-input'), 'My Project');
    await user.click(screen.getByText('Create'));

    await expect(dialogPromise).resolves.toEqual({
      status: 'closed',
      value: 'My Project',
    });
  });
});
