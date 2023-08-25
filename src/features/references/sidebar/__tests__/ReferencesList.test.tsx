import { noop } from '../../../../lib/noop';
import { render, screen, setup, within } from '../../../../test/test-utils';
import { REFERENCES } from '../../__tests__/test-fixtures';
import { ReferencesList } from '../ReferencesList';

describe('ReferencesList', () => {
  it('should display empty list if for empty array', () => {
    render(<ReferencesList references={[]} onAuthorClicked={noop} onRefClicked={noop} />);
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

  it('should display one reference item with title', () => {
    render(<ReferencesList references={[REFERENCES[0]]} onAuthorClicked={noop} onRefClicked={noop} />);
    expect(screen.getByRole('listitem')).toBeInTheDocument();
    expect(screen.getByText(REFERENCES[0].title)).toBeInTheDocument();
  });

  it('should display multiple reference items with title', () => {
    render(<ReferencesList references={REFERENCES} onAuthorClicked={noop} onRefClicked={noop} />);
    expect(screen.queryAllByRole('listitem')).toHaveLength(REFERENCES.length);
    REFERENCES.forEach((reference) => {
      expect(screen.getByText(reference.title)).toBeInTheDocument();
    });
  });

  it('should display one reference item with author last name', () => {
    render(<ReferencesList references={[REFERENCES[0]]} onAuthorClicked={noop} onRefClicked={noop} />);
    expect(screen.getByRole('listitem')).toBeInTheDocument();
    expect(screen.getByText(REFERENCES[0].authors[0].lastName)).toBeInTheDocument();
  });

  it('should trigger onRefClicked (no PDF) on ref item click', async () => {
    const handler = vi.fn();
    const { user } = setup(
      <ReferencesList references={[REFERENCES[0]]} onAuthorClicked={noop} onRefClicked={handler} />,
    );

    await user.click(screen.getByRole('listitem'));
    expect(handler).toBeCalled();
    expect(handler).toBeCalledWith(REFERENCES[0], false);
  });

  it('should trigger onAuthorClicked on author name click', async () => {
    const handler = vi.fn();
    const { user } = setup(
      <ReferencesList references={[REFERENCES[0]]} onAuthorClicked={handler} onRefClicked={noop} />,
    );

    const [firstAuthor] = REFERENCES[0].authors;
    expect(firstAuthor).toBeDefined();
    await user.click(within(screen.getByRole('listitem')).getByText(firstAuthor.lastName));
    expect(handler).toBeCalled();
    expect(handler).toBeCalledWith(firstAuthor, REFERENCES[0]);
  });

  it('should trigger onRefClicked (no PDF) on click in "Open Reference" icon', async () => {
    const handler = vi.fn();
    const { user } = setup(
      <ReferencesList references={[REFERENCES[0]]} onAuthorClicked={noop} onRefClicked={handler} />,
    );

    await user.click(screen.getByRole('listitem'));
    expect(handler).toBeCalled();
    expect(handler).toBeCalledWith(REFERENCES[0], false);
  });
});
