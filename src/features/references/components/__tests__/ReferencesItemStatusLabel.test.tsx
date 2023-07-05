import { render, screen } from '../../../../test/test-utils';
import { ReferencesItemStatusLabel } from '../ReferencesItemStatusLabel';

describe('ReferencesItemStatusLabel', () => {
  it('should display status text for completed', () => {
    render(<ReferencesItemStatusLabel status="complete" />);
    expect(screen.getByText(/complete/i)).toBeInTheDocument();
  });

  it('should display status text for failure', () => {
    render(<ReferencesItemStatusLabel status="failure" />);
    expect(screen.getByText(/failure/i)).toBeInTheDocument();
  });

  it('should display status text for processing', () => {
    render(<ReferencesItemStatusLabel status="processing" />);
    expect(screen.getByText(/processing/i)).toBeInTheDocument();
  });
});
