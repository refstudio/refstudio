import { render, screen } from '../../../test/test-utils';
import { Spinner } from '..';

describe('Spinner component', () => {
  it('should render a spinner', () => {
    render(<Spinner />);
    expect(screen.getByRole('presentation')).toBeInTheDocument();
    expect(screen.getByRole('presentation')).toHaveClass('lds-dual-ring');
  });
});
