import { noop } from '../../../lib/noop';
import { render, screen, setup } from '../../../test/test-utils';
import { ProjectsList } from '../ProjectsList';
import { PROJECTS } from './test-fixtures';

describe('ProjectsList', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the list of projects', () => {
    render(<ProjectsList header="Recent Projects" projects={PROJECTS} onProjectClick={noop} />);

    expect(screen.getAllByRole('menuitem')).toHaveLength(PROJECTS.length);
    PROJECTS.forEach((project) => {
      expect(screen.getByText(project.name)).toBeInTheDocument();
    });
  });

  it('should call handler with the project clicked on', async () => {
    const fn = vi.fn();
    const { user } = setup(<ProjectsList header="Recent Projects" projects={PROJECTS} onProjectClick={fn} />);

    await user.click(screen.getByText(PROJECTS[1].name));

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(PROJECTS[1]);
  });
});
