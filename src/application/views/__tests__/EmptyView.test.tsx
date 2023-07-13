import { render, screen } from '../../../test/test-utils';
import { EmptyView } from '../EmptyView';

describe('EmptyView', () => {
  it('should render with shortcuts', () => {
    render(<EmptyView />);
    expect(screen.getByText('Show Commands')).toBeInTheDocument();
    expect(screen.getByText('Show References')).toBeInTheDocument();
    expect(screen.getByText('New File')).toBeInTheDocument();
    expect(screen.getByText('Show Settings')).toBeInTheDocument();
  });
});
