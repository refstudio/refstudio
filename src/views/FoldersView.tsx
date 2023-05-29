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
    readAllProjectFiles()
      .then((newFiles) => {
        setFiles(newFiles);
        const selected = newFiles.find((f) => f.name?.endsWith('.tiptap'));
        if (selected) {
          setSelectedFile(selected); // We need this because we might be selecting a DOT_FILE
          onClick?.(selected);
        }
      })
      .catch((e) => {
        console.error(e);
      });
  }, [onClick]);

  function handleOnClick(file: FileEntry): void {
    setSelectedFile(file);
    onClick?.(file);
  }

  async function handleChange(uploadedFiles: FileList) {
    try {
      await uploadFiles(uploadedFiles);
      console.log('File uploaded with success');

      const projectFiles = await readAllProjectFiles();
      setFiles(projectFiles);

      await runPDFIngestion();
      console.log('PDFs ingested with success');
    } catch (err) {
      console.error('Error uploading references', err);
    }
  }

  return (
    <div className="flex h-full flex-col justify-between px-2 pt-2">
      <div className="flex h-full w-full flex-1 flex-col">
        <div className="mb-2 flex flex-col text-sm font-bold uppercase">Project X</div>
        <FileTree files={files} root selectedFile={selectedFile} onClick={handleOnClick} />
      </div>
      <div>
        <FileUploader handleChange={handleChange} label="Upload or drop a file right here" multiple name="file" />
        <code className="mb-auto block text-xs font-normal">{BASE_DIR}</code>
      </div>
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

const FileTree = ({ files, root, ...props }: FileTreeBaseProps) => (
  <div className="flex-1 overflow-scroll">
    <ul
      className={cx('', {
        'ml-6': !root,
      })}
    >
      {files.map((file) => (
        <FileTreeNode file={file} files={files} key={file.path} {...props} />
      ))}
    </ul>
  </div>
);

const FileTreeNode = ({ file, onClick, selectedFile }: FileTreeBaseProps) => {
  if (!file) {
    return null;
  }
  const isFolder = Array.isArray(file.children);

  // Hide DOT_FILES
  if (file.name?.startsWith('.')) {
    return null;
  }

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
        <FileTree files={file.children} selectedFile={selectedFile} onClick={onClick} />
      )}
    </li>
  );
};

const FileIcon = () => <span className="inline-flex pr-2">&mdash;</span>;

const FolderIcon = () => <span className="inline-flex pr-2">&mdash;</span>;
