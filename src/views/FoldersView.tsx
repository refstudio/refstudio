import * as React from 'react';
import { FileUploader } from "react-drag-drop-files";
import { cx } from '../cx';

export function FoldersView() {
  const [filesTree, setFilesTree] = React.useState(tree);
  const handleChange = (files: FileList) => {
    setFilesTree((_filesTree) => {
      const updatedFilesTree = [..._filesTree];
      for (const file of files) {
        updatedFilesTree.push({ name: file.name });
        file.arrayBuffer().then(console.log);
      }
      return updatedFilesTree;
    });
  };

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <h1>Project X</h1>
        <FileTree tree={filesTree} />
      </div>
      <FileUploader handleChange={handleChange} name="file" multiple label="Upload or drop a file right here" />
    </div>
  );
}

const FileTree = ({ tree }: { tree: FileTree }) => {
  return (
    <div>
      <ul>
        {tree.map((node, index) => (
          <FileTreeNode key={index} node={node} />
        ))}
      </ul>
    </div>
  );
};

const FileTreeNode = ({ node }: { node: FileTreeNode }) => {
  const isDirectory = node.children && node.children.length > 0;

  return (
    <li>
      <div
        className={cx(
          'truncate',
          'mb-2 flex flex-row items-center', //
          {
            'bg-slate-100': node.selected,
            'cursor-pointer hover:bg-slate-100': !isDirectory,
          },
        )}
      >
        {isDirectory ? <FolderIcon /> : <FileIcon />}
        <span
          className={cx({
            'font-bold': isDirectory,
          })}
        >
          {node.name}
        </span>
      </div>

      {isDirectory && (
        <ul className="list-disc">
          {node.children.map((childNode, index) => (
            <FileTreeNode key={index} node={childNode} />
          ))}
        </ul>
      )}
    </li>
  );
};

const FileIcon = () => (
  <span className="inline-flex px-1 font-mono font-bold">&#xB7;</span>
);

const FolderIcon = () => (
  <span className="inline-flex px-1 font-mono font-bold"></span>
);

type FileTree = typeof tree;
type FileTreeNode = FileTree[0];

const tree = [
  {
    name: 'file1.md',
    selected: true,
  },
  {
    name: 'file2.txt',
  },
  {
    name: 'Uploads',
    children: [
      {
        name: 'Deep Learning.pdf',
      },
      {
        name: 'Artificial Intelligence: A Modern Approach.pdf',
      },
      {
        name: 'Pattern Recognition and Machine Learning.pdf',
      },
    ],
  },
];
