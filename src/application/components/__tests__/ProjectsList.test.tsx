import { noop } from '../../../lib/noop';
import { render, screen, setup } from '../../../test/test-utils';
import { ProjectsList } from '../ProjectsList';
import { PROJECTS } from './test-fixtures';

describe('ProjectsList', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the list of projects', () => {
    render(<ProjectsList projects={PROJECTS} onProjectClick={noop} />);

    expect(screen.getAllByRole('menuitem')).toHaveLength(PROJECTS.length);
    PROJECTS.forEach((project) => {
      expect(screen.getByText(project.name)).toBeInTheDocument();
    });
  });

  it('should render an empty list of projects', () => {
    render(<ProjectsList projects={[]} onProjectClick={noop} />);
    expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
  });

  it('should call handler with the project clicked on', async () => {
    const fn = vi.fn();
    const { user } = setup(<ProjectsList projects={PROJECTS} onProjectClick={fn} />);

    await user.click(screen.getByText(PROJECTS[1].name));

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(PROJECTS[1]);
  });

  it('should render the configured header', () => {
    render(<ProjectsList header="Recent Projects" projects={[]} onProjectClick={noop} />);
    expect(screen.getByText('Recent Projects')).toBeInTheDocument();
  });
});
