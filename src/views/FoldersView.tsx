import { cx } from '../cx';

export function FoldersView({ onClick = () => {} }) {
  return (
    <div>
      <h1>Project X</h1>
      <FileTree onClick={onClick} tree={tree} />
    </div>
  );
}

const FileTree = ({
  tree,
  onClick,
}: {
  tree: FileTree;
  onClick: () => void;
}) => {
  return (
    <div>
      <ul>
        {tree.map((node, index) => (
          <FileTreeNode onClick={onClick} key={index} node={node} />
        ))}
      </ul>
    </div>
  );
};

const FileTreeNode = ({
  node,
  onClick,
}: {
  node: FileTreeNode;
  onClick: () => void;
}) => {
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
          onClick={onClick}
        >
          {node.name}
        </span>
      </div>

      {isDirectory && (
        <ul className="list-disc">
          {node.children.map((childNode, index) => (
            <FileTreeNode onClick={onClick} key={index} node={childNode} />
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
    name: 'file1.tiptap',
    selected: true,
  },
  {
    name: 'file2.lexical',
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
