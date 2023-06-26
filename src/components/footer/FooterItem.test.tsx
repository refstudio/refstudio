import { render, screen } from '../../utils/test-utils';
import { FooterItem } from './FooterItem';

describe('FooterItem component', () => {
  it('should render with text and icon', () => {
    render(<FooterItem icon={<span>ICON</span>} text="Some text" />);
    expect(screen.getByText('ICON')).toBeInTheDocument();
    expect(screen.getByText('Some text')).toBeInTheDocument();
  });
});
