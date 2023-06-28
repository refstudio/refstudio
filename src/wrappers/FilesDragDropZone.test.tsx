import { noop } from '../lib/noop';
import { fireEvent, render, screen } from '../test/test-utils';
import { FilesDragDropZone } from './FilesDragDropZone';

const onFileDropStarted = vi.fn();
const onFileDropCanceled = vi.fn();
const onFileDrop = vi.fn();

describe('FilesDragDropZone', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should render with children', () => {
    render(<FilesDragDropZone onFileDrop={noop}>APP</FilesDragDropZone>);
    expect(screen.getByText('APP')).toBeInTheDocument();
  });

  it('should call onFileDropStarted on drag enter', () => {
    render(
      <FilesDragDropZone onFileDrop={onFileDrop} onFileDropStarted={onFileDropStarted}>
        APP
      </FilesDragDropZone>,
    );

    const target = screen.getByText('APP');
    fireEvent.dragEnter(target, {
      dataTransfer: {
        types: ['Files'],
      },
    });

    expect(onFileDropStarted).toHaveBeenCalled();
  });

  it('should NOT call onFileDropStarted on drag enter for invalid file types', () => {
    render(
      <FilesDragDropZone onFileDrop={onFileDrop} onFileDropStarted={onFileDropStarted}>
        APP
      </FilesDragDropZone>,
    );

    const target = screen.getByText('APP');
    fireEvent.dragEnter(target, {
      dataTransfer: {
        types: ['Html'],
      },
    });

    expect(onFileDropStarted).not.toHaveBeenCalled();
  });

  it('should call onFileDropCanceled on drag leave', () => {
    render(
      <FilesDragDropZone
        onFileDrop={onFileDrop}
        onFileDropCanceled={onFileDropCanceled}
        onFileDropStarted={onFileDropStarted}
      >
        APP
      </FilesDragDropZone>,
    );

    const target = screen.getByText('APP');
    fireEvent.dragEnter(target, {
      dataTransfer: {
        types: ['Files'],
      },
    });

    expect(onFileDropStarted).toHaveBeenCalled();

    fireEvent.dragLeave(target, {
      dataTransfer: {
        types: ['Files'],
      },
    });

    expect(onFileDropCanceled).toHaveBeenCalled();
  });

  it('should call onDrop on drop with files', () => {
    render(
      <FilesDragDropZone
        onFileDrop={onFileDrop}
        onFileDropCanceled={onFileDropCanceled}
        onFileDropStarted={onFileDropStarted}
      >
        APP
      </FilesDragDropZone>,
    );

    const target = screen.getByText('APP');
    const eventData = {
      dataTransfer: {
        types: ['Files'],
      },
    };
    fireEvent.dragEnter(target, eventData);
    fireEvent.dragOver(target, eventData);

    const file = new File(['(⌐□_□)'], 'chucknorris.pdf', { type: 'application/pdf' });

    fireEvent.drop(target, {
      dataTransfer: {
        types: ['Files'],
        files: [file],
      },
    });

    expect(onFileDrop).toHaveBeenCalled();
    expect(onFileDrop).toHaveBeenCalledWith([file]);
  });

  it('should not call callbacks on missing dataTransfer', () => {
    render(
      <FilesDragDropZone
        onFileDrop={onFileDrop}
        onFileDropCanceled={onFileDropCanceled}
        onFileDropStarted={onFileDropStarted}
      >
        APP
      </FilesDragDropZone>,
    );

    const target = screen.getByText('APP');
    fireEvent.dragEnter(target);
    fireEvent.dragOver(target);
    fireEvent.dragLeave(target);
    fireEvent.drop(target);

    expect(onFileDropStarted).not.toHaveBeenCalled();
    expect(onFileDropCanceled).not.toHaveBeenCalled();
    expect(onFileDrop).not.toHaveBeenCalled();
  });
});
