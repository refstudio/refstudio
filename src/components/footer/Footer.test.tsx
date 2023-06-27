import { ReferencesFooterItems } from '../../panels/references/ReferencesFooterItems';
import { render } from '../../utils/test-utils';
import { Footer } from './Footer';

describe('Footer component', () => {
  it('should render the footer with ReferencesFooterItems', () => {
    vi.mock('../../panels/references/ReferencesFooterItems', () => {
      const FakeReferencesFooterItems = vi.fn(() => null);
      return { ReferencesFooterItems: FakeReferencesFooterItems };
    });

    render(<Footer />);
    expect(ReferencesFooterItems).toHaveBeenCalled();
  });
});
