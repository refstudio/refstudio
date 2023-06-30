import { render, screen, setup } from '../../../test/test-utils';
import { FooterItem } from '../FooterItem';

describe('FooterItem component', () => {
  it('should render with text and icon', () => {
    render(<FooterItem icon={<span>ICON</span>} text="Some text" />);
    expect(screen.getByText('ICON')).toBeInTheDocument();
    expect(screen.getByText('Some text')).toBeInTheDocument();
  });

  it('should trigger onClick when cliked', async () => {
    const fn = vi.fn();
    const { user } = setup(<FooterItem icon={<span>ICON</span>} text="Some text" onClick={fn} />);
    await user.click(screen.getByText('Some text'));
    expect(screen.getByRole('listitem')).toHaveClass('cursor-pointer');
    expect(fn).toHaveBeenCalled();
  });

  it('should not be clickable (no cursor-pointer or throw error) if onClick is undefined', () => {
    render(<FooterItem icon={<span>ICON</span>} text="Some text" onClick={undefined} />);
    expect(screen.getByRole('listitem')).not.toHaveClass('cursor-pointer');
  });
});
