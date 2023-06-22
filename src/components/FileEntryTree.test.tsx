import { makeFile, makeFolder } from '../atoms/test-fixtures';
import { noop } from '../utils/noop';
import { render, screen, setup } from '../utils/test-utils';
import { FileEntryTree } from './FileEntryTree';

describe('FileEntryTree component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('should render a file', () => {
        const { fileEntry } = makeFile('File 1.pdf');
        render(
            <FileEntryTree
                files={[fileEntry]}
                root
                selectedFiles={[]}
                onClick={noop}
            />,
        );
        expect(screen.getByText(fileEntry.name)).toBeInTheDocument();
    });

    test('should call onClick with file path', async () => {
        const { fileEntry } = makeFile('File 1.pdf');
        const onClick = vi.fn();
        const { user } = setup(
            <FileEntryTree
                files={[fileEntry]}
                root
                selectedFiles={[]}
                onClick={onClick}
            />,
        );

        await user.click(screen.getByText(fileEntry.name));

        expect(onClick).toHaveBeenCalledTimes(1);
        expect(onClick).toHaveBeenCalledWith(fileEntry.path);
    });

    test('should render a folder and its children', () => {
        const { fileEntry } = makeFile('File 1.pdf');
        const folderEntry = makeFolder('Folder 1', [fileEntry]);
        render(
            <FileEntryTree
                files={[folderEntry]}
                root
                selectedFiles={[]}
                onClick={noop}
            />,
        );
        expect(screen.getByText(fileEntry.name)).toBeInTheDocument();
        expect(screen.getByText(folderEntry.name)).toBeInTheDocument();
    });

    test('should render a right action', () => {
        const { fileEntry } = makeFile('File 1.pdf');
        const rightActionMock = vi.fn().mockReturnValue(<div>Right action</div>);
        render(
            <FileEntryTree
                files={[fileEntry]}
                rightAction={rightActionMock}
                root
                selectedFiles={[]}
                onClick={noop}
            />,
        );

        expect(rightActionMock).toHaveBeenCalledTimes(1);
        expect(rightActionMock).toHaveBeenCalledWith(fileEntry.path);
        expect(screen.getByText('Right action')).toBeInTheDocument();
    });

    test('should not render dotfiles', () => {
        const { fileEntry } = makeFile('File 1.pdf');
        const { fileEntry: dotfileFileEntry } = makeFile('.file2');
        render(
            <FileEntryTree
                files={[fileEntry, dotfileFileEntry]}
                root
                selectedFiles={[]}
                onClick={noop}
            />,
        );
        expect(screen.getByText(fileEntry.name)).toBeInTheDocument();
        expect(screen.queryByText(dotfileFileEntry.name)).not.toBeInTheDocument();
    });
});