import { render, screen } from '../../../test/test-utils';
import { EmptyView } from '../EmptyView';

describe('WelcomeView', () => {
  it('should render with shortcuts', () => {
    render(<EmptyView />);
    expect(screen.getByText('New File')).toBeInTheDocument();
    expect(screen.getByText('Save File')).toBeInTheDocument();
    expect(screen.getByText('AI Text Completion')).toBeInTheDocument();
    // expect(screen.getByText('Repeat AI Rewriter')).toBeInTheDocument();
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByText('Quick Files')).toBeInTheDocument();
    expect(screen.getByText('Open References Table')).toBeInTheDocument();
    expect(screen.getByText('Open Notifications')).toBeInTheDocument();
  });
});
