import { createStore, Provider } from 'jotai';

import { act, render, screen } from '../../utils/test-utils';
import { FilesDragDropZone } from './FilesDragDropZone';
import { ReferencesDropZone } from './ReferencesDropZone';

let onFileDropFn: undefined | ((uploadedFiles: FileList) => void);
let onFileDropStarted: undefined | (() => void);
vi.mock('./FilesDragDropZone', () => {
  const FakeFilesDragDropZone = vi.fn(
    (params: {
      onFileDropStarted: () => void;
      onFileDrop: (uploadedFiles: FileList) => void;
      children: React.ReactNode;
    }) => {
      onFileDropFn = params.onFileDrop;
      onFileDropStarted = params.onFileDropStarted;
      return params.children;
    },
  );
  return { FilesDragDropZone: FakeFilesDragDropZone };
});

describe('ReferencesDropZone', () => {
  it('should render children with', () => {
    render(
      <Provider>
        <ReferencesDropZone>This is the child content</ReferencesDropZone>
      </Provider>,
    );
    expect(screen.getByText('This is the child content')).toBeInTheDocument();
  });

  it('should render upload overlay hidden', () => {
    render(
      <Provider>
        <ReferencesDropZone>APP</ReferencesDropZone>
      </Provider>,
    );
    expect(screen.getByTestId('release-files-message')).toHaveClass('hidden');
  });

  it.skip('should display overlay visible', () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <ReferencesDropZone>APP</ReferencesDropZone>
      </Provider>,
    );

    expect(screen.getByTestId('release-files-message')).toHaveClass('hidden');
    expect(FilesDragDropZone).toHaveBeenCalled();

    act(() => {
      onFileDropStarted?.();
    });

    expect(screen.getByTestId('release-files-message')).toHaveClass('visible');
  });
});
