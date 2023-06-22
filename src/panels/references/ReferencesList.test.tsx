import { noop } from '../../utils/noop';
import { render, screen, setup } from '../../utils/test-utils';
import { ReferencesList } from './ReferencesList';

describe('ReferencesList', () => {
  test('should display empty list if for empty array', () => {
    render(<ReferencesList references={[]} onRefClicked={noop} />);
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

  test('should display one reference item with title', () => {
    render(
      <ReferencesList
        references={[
          {
            id: 'ref.id',
            citationKey: 'citationKey',
            title: 'title',
            abstract: '',
            authors: [],
            filename: 'title.pdf',
            publishedDate: '2023-06-22',
          },
        ]}
        onRefClicked={noop}
      />,
    );
    expect(screen.getByRole('listitem')).toBeInTheDocument();
    expect(screen.getByText('title')).toBeInTheDocument();
  });

  test('should display multiple reference items with title', () => {
    render(
      <ReferencesList
        references={[
          {
            id: 'ref.id-1',
            citationKey: 'citationKey-1',
            title: 'title-1',
            abstract: '',
            authors: [],
            filename: 'title-1.pdf',
            publishedDate: '2023-06-22',
          },

          {
            id: 'ref.id-2',
            citationKey: 'citationKey-2',
            title: 'title-2',
            abstract: '-',
            authors: [],
            filename: 'title-2.pdf',
            publishedDate: '2023-06-22',
          },
        ]}
        onRefClicked={noop}
      />,
    );
    expect(screen.queryAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('title-1')).toBeInTheDocument();
    expect(screen.getByText('title-2')).toBeInTheDocument();
  });

  test('should display one reference item with authors', () => {
    render(
      <ReferencesList
        references={[
          {
            id: 'ref.id',
            citationKey: 'citationKey',
            title: 'title',
            abstract: '',
            authors: [{ fullName: 'Joe Doe' }, { fullName: 'Maria Ana' }],
            filename: 'title.pdf',
            publishedDate: '2023-06-22',
          },
        ]}
        onRefClicked={noop}
      />,
    );
    expect(screen.getByRole('listitem')).toBeInTheDocument();
    expect(screen.getByText(/Joe Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/Maria Ana/i)).toBeInTheDocument();
  });

  test('should trigger onRefClicked on ref item click', async () => {
    const handler = vi.fn();
    const { user } = setup(
      <ReferencesList
        references={[
          {
            id: 'ref.id',
            citationKey: 'citationKey',
            title: 'title',
            abstract: '',
            authors: [],
            filename: 'title.pdf',
            publishedDate: '2023-06-22',
          },
        ]}
        onRefClicked={handler}
      />,
    );

    await user.click(screen.getByRole('listitem'));
    expect(handler).toBeCalled();
  });
});
