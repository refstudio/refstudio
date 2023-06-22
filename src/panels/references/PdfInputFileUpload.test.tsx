import { noop } from '../../utils/noop';
import { render, screen, setup } from '../../utils/test-utils';
import { PdfInputFileUpload } from './PdfInputFileUpload';

describe('PdfInputFileUpload', () => {
  test('should display guidance TIP text for upload', () => {
    render(<PdfInputFileUpload onUpload={noop} />);
    expect(screen.getByText(/click.*here/i)).toBeInTheDocument();
    expect(screen.getByText(/drag.drop PDF files here for upload/i)).toBeInTheDocument();
  });

  test('should upload file on click', async () => {
    const handler = vi.fn();
    const { user } = setup(<PdfInputFileUpload onUpload={handler} />);
    const input = screen.getByRole<HTMLInputElement>('form');

    const file = new File(['hello'], 'file.pdf', { type: 'application/pdf' });
    await user.upload(input, file);

    expect(input.files).toBeDefined();
    expect(input.files!).toHaveLength(1);
    expect(input.files![0]).toBe(file);
    expect(input.files!.item(0)).toBe(file);
  });

  test('should upload multiple files on click', async () => {
    const handler = vi.fn();
    const { user } = setup(<PdfInputFileUpload onUpload={handler} />);
    const input = screen.getByRole<HTMLInputElement>('form');

    const files = [
      new File(['hello1'], 'file1.pdf', { type: 'application/pdf' }),
      new File(['hello2'], 'file2.pdf', { type: 'application/pdf' }),
    ];
    await user.upload(input, files);

    expect(input.files).toHaveLength(2);
    expect(input.files![0]).toBe(files[0]);
    expect(input.files![1]).toBe(files[1]);
  });

  test('should open file upload on click in HERE', async () => {
    const handler = vi.fn();
    const { user } = setup(<PdfInputFileUpload onUpload={handler} />);
    await user.click(screen.getByText('here'));
  });
});
