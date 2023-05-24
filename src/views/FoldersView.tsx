import { FileEntry } from '@tauri-apps/api/fs';
import { useEffect, useState } from 'react';
import { FileUploader } from 'react-drag-drop-files';

import { cx } from '../cx';
import { openFile } from '../features/openedFiles/openedFilesSlice';
import { ensureProjectFileStructure, readAllProjectFiles, uploadFiles } from '../filesystem';
import { useAppDispatch, useAppSelector } from '../redux/hooks';

const BASE_DIR = await ensureProjectFileStructure();

export function FoldersView() {
  const dispatch = useAppDispatch();
  const [files, setFiles] = useState<FileEntry[]>([]);

  useEffect(() => {
    readAllProjectFiles().then((files) => {
      setFiles(files);
      const selected = files.find((f) => f.name?.endsWith('.tiptap'));
      if (selected) {
        dispatch(
          openFile({
            type: 'TipTap',
            entry: selected,
            isDirectory: false,
          }),
        );
      }
    });
  }, [dispatch]);

  const handleChange = (files: FileList) => {
    uploadFiles(files).then(() => {
      readAllProjectFiles().then(setFiles);
    });
  };

  return (
    <div className="flex h-full flex-col justify-between">
      <div>
        <h1 className="flex flex-col">
          Project X<code className="block text-xs font-normal">{BASE_DIR}</code>
        </h1>
        <FileTree root files={files} />
      </div>
      <FileUploader handleChange={handleChange} name="file" multiple label="Upload or drop a file right here" />
    </div>
  );
}

function FileTree({ files, root = false }: { files: FileEntry[]; root?: boolean }) {
  return (
    <div>
      <ul
        className={cx('', {
          'ml-6': !root,
        })}
      >
        {files.map((file) => (
          <FileTreeNode key={file.path} file={file} />
        ))}
      </ul>
    </div>
  );
}

function FileTreeNode({ file }: { file: FileEntry }) {
  const dispatch = useAppDispatch();
  const selectedFile = useAppSelector((state) => state.openedFiles.selectedFile);

  if (!file) return null;
  const isFolder = Array.isArray(file.children);

  function handleOnClick(file: FileEntry): void {
    dispatch(
      openFile({
        type: file.name?.endsWith('.tiptap') //
          ? 'TipTap'
          : file.name?.endsWith('.pdf')
          ? 'PDF'
          : 'Unknown',
        entry: file,
        isDirectory: false,
      }),
    );
  }

  // Hide DOT_FILES
  if (file.name?.startsWith('.')) return null;

  return (
    <li>
      <div
        className={cx(
          'mb-1 py-1',
          'flex flex-row items-center', //
          {
            'bg-slate-100': file.path === selectedFile?.entry.path,
            'cursor-pointer hover:bg-slate-100': !isFolder,
          },
        )}
        onClick={() => !isFolder && handleOnClick(file)}
      >
        {isFolder ? <FolderIcon /> : <FileIcon />}
        <span
          className={cx({
            'font-bold': isFolder,
          })}
        >
          {file.name}
        </span>
      </div>

      {isFolder && Array.isArray(file.children) && <FileTree files={file.children} />}
    </li>
  );
}

const FileIcon = () => <span className="inline-flex pr-2">&mdash;</span>;
const FolderIcon = () => <span className="inline-flex pr-2">&mdash;</span>;
