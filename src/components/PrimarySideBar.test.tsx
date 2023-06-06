import { render, screen } from '../utils/test-utils';
import { PrimarySideBar } from './PrimarySideBar';

describe('PrimarySideBar', () => {
  it('should display Explorer and References icons', () => {
    render(<PrimarySideBar activePane="Explorer" onClick={() => 0} />);
    expect(screen.getByRole('menubar')).toBeDefined();
    expect(screen.getByRole('menuitem', { name: 'Explorer' })).toBeDefined();
    expect(screen.getByRole('menuitem', { name: 'References' })).toBeDefined();
  });

  it('should display active icon with 100% opacity ', () => {
    render(<PrimarySideBar activePane="References" onClick={() => 0} />);
    expect(screen.getByRole('menubar')).toBeDefined();
    expect(screen.getByRole('menuitem', { name: 'References' })).toHaveClass('opacity-100');
  });

  it('should display inactive icon with 50% opacity ', () => {
    render(<PrimarySideBar activePane="References" onClick={() => 0} />);
    expect(screen.getByRole('menubar')).toBeDefined();
    expect(screen.getByRole('menuitem', { name: 'Explorer' })).toHaveClass('opacity-50');
  });
});
