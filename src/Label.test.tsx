import { Label } from './Label';
import { render, screen } from './utils/test-utils';

describe('Label component', () => {
  it('should display text', () => {
    render(<Label text="Hello" />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should NOT display OFF text', () => {
    const { container } = render(<Label off text="Hello" />);
    expect(container.innerText).toBe(undefined);
  });
});
