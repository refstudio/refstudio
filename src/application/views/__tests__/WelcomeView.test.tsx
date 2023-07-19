import { render, screen } from '../../../test/test-utils';
import { WelcomeView } from '../WelcomeView';

describe('WelcomeView', () => {
  it('should render with shortcuts', () => {
    render(<WelcomeView />);
    expect(screen.getByText('Show Commands')).toBeInTheDocument();
    expect(screen.getByText('Show References')).toBeInTheDocument();
    expect(screen.getByText('New File')).toBeInTheDocument();
    expect(screen.getByText('Show Settings')).toBeInTheDocument();
  });

  it('should render without shortcuts', () => {
    render(<WelcomeView hideShortcuts />);
    expect(screen.getByText('R')).toBeInTheDocument();
    expect(screen.getByText('S')).toBeInTheDocument();
    expect(screen.queryByText('Show Commands')).not.toBeInTheDocument();
    expect(screen.queryByText('Show References')).not.toBeInTheDocument();
    expect(screen.queryByText('New File')).not.toBeInTheDocument();
    expect(screen.queryByText('Show Settings')).not.toBeInTheDocument();
  });
});
