import { FileEntry } from '@tauri-apps/api/fs';
import { useEffect, useState } from 'react';
import { FileUploader } from 'react-drag-drop-files';

import { cx } from '../cx';
import { ensureProjectFileStructure, readAllProjectFiles, runPDFIngestion, uploadFiles } from '../filesystem';

const BASE_DIR = await ensureProjectFileStructure();

export function FoldersView({ onClick }: { onClick?: (fileEntry: FileEntry) => void }) {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileEntry>();

  useEffect(() => {
    readAllProjectFiles().then((files) => {
      setFiles(files);
      const selected = files.find((f) => f.name?.endsWith('.tiptap'));
      if (selected) {
        setSelectedFile(selected); // We need this because we might be selecting a DOT_FILE
        onClick?.(selected);
      }
    });
  }, [onClick]);

  function handleOnClick(file: FileEntry): void {
    setSelectedFile(file);
    onClick?.(file);
  }

  const handleChange = (files: FileList) => {
    uploadFiles(files).then(() => {
      console.log('File uploaded with success');
      readAllProjectFiles().then(setFiles);
      console.log(files);
    });
    runPDFIngestion().then(() => {
      console.log('PDFs ingested with success');
      readAllProjectFiles().then(setFiles);
    });
  };

  return (
    <div className="flex h-full flex-col justify-between">
      <div className='flex-1 flex flex-col h-full w-full'>
        <h1 className="flex flex-col">
          Project X<code className="block text-xs font-normal">{BASE_DIR}</code>
        </h1>
        <FileTree root files={files} selectedFile={selectedFile} onClick={handleOnClick} />
      </div>
      <FileUploader handleChange={handleChange} name="file" multiple label="Upload or drop a file right here" />
    </div>
  );
}

interface FileTreeBaseProps {
  root?: boolean;
  files: FileEntry[];
  file?: FileEntry;
  selectedFile?: FileEntry;
  onClick: (file: FileEntry) => void;
}

const FileTree = ({ files, root, ...props }: FileTreeBaseProps) => {
  return (
    <div className="flex-1 overflow-scroll">
      <ul
        className={cx('', {
          'ml-6': !root,
        })}
      >
        {files.map((file) => (
          <FileTreeNode key={file.path} files={files} file={file} {...props} />
        ))}
      </ul>
    </div>
  );
};

const FileTreeNode = ({ file, onClick, selectedFile }: FileTreeBaseProps) => {
  if (!file) return null;
  const isFolder = Array.isArray(file.children);

  // Hide DOT_FILES
  if (file.name?.startsWith('.')) return null;

  return (
    <li>
      <div
        className={cx(
          'mb-1 py-1',
          'flex flex-row items-center', //
          {
            'bg-slate-100': file.path === selectedFile?.path,
            'cursor-pointer hover:bg-slate-100': !isFolder,
          },
        )}
        onClick={() => !isFolder && onClick(file)}
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

      {isFolder && Array.isArray(file.children) && (
        <FileTree files={file.children} onClick={onClick} selectedFile={selectedFile} />
      )}
    </li>
  );
};

const FileIcon = () => <span className="inline-flex pr-2">&mdash;</span>;

const FolderIcon = () => <span className="inline-flex pr-2">&mdash;</span>;
