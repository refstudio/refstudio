import { noop } from '../../../../lib/noop';
import { render, screen, setup, within } from '../../../../test/test-utils';
import { REFERENCES } from '../../__tests__/test-fixtures';
import { ReferencesList } from '../ReferencesList';

describe('ReferencesList', () => {
  it('should display empty list if for empty array', () => {
    render(<ReferencesList references={[]} onRefClicked={noop} />);
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

  it('should display one reference item with title', () => {
    render(<ReferencesList references={[REFERENCES[0]]} onRefClicked={noop} />);
    expect(screen.getByRole('listitem')).toBeInTheDocument();
    expect(screen.getByText(REFERENCES[0].title)).toBeInTheDocument();
  });

  it('should display multiple reference items with title', () => {
    render(<ReferencesList references={REFERENCES} onRefClicked={noop} />);
    expect(screen.queryAllByRole('listitem')).toHaveLength(REFERENCES.length);
    REFERENCES.forEach((reference) => {
      expect(screen.getByText(reference.title)).toBeInTheDocument();
    });
  });

  it('should display one reference item with author last name', () => {
    render(<ReferencesList references={[REFERENCES[0]]} onRefClicked={noop} />);
    expect(screen.getByRole('listitem')).toBeInTheDocument();
    expect(screen.getByText(REFERENCES[0].authors[0].lastName)).toBeInTheDocument();
  });

  it('should trigger onRefClicked (no PDF) on ref item click', async () => {
    const handler = vi.fn();
    const { user } = setup(<ReferencesList references={[REFERENCES[0]]} onRefClicked={handler} />);

    await user.click(screen.getByRole('listitem'));
    expect(handler).toBeCalled();
    expect(handler).toBeCalledWith(REFERENCES[0], false);
  });

  it('should trigger onRefClicked (no PDF) on click in "Open Reference" icon', async () => {
    const handler = vi.fn();
    const { user } = setup(<ReferencesList references={[REFERENCES[0]]} onRefClicked={handler} />);

    const refElement = screen.getByRole('listitem');
    await user.click(within(refElement).getByTitle('Open Reference'));
    expect(handler).toBeCalled();
    expect(handler).toBeCalledWith(REFERENCES[0], false);
  });

  it('should trigger onRefClicked (for PDF) on click in "Open PDF" icon', async () => {
    const handler = vi.fn();
    const { user } = setup(<ReferencesList references={[REFERENCES[0]]} onRefClicked={handler} />);

    const refElement = screen.getByRole('listitem');
    await user.click(within(refElement).getByTitle('Open PDF'));
    expect(handler).toBeCalled();
    expect(handler).toBeCalledWith(REFERENCES[0], true);
  });
});
