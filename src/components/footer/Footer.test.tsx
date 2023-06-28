import { ReferencesFooterItems } from '../../features/references/footer/ReferencesFooterItems';
import { render } from '../../test/test-utils';
import { Footer } from './Footer';

describe('Footer component', () => {
  it('should render the footer with ReferencesFooterItems', () => {
    vi.mock('../../features/references/footer/ReferencesFooterItems', () => {
      const FakeReferencesFooterItems = vi.fn(() => null);
      return { ReferencesFooterItems: FakeReferencesFooterItems };
    });

    render(<Footer />);
    expect(ReferencesFooterItems).toHaveBeenCalled();
  });
});
