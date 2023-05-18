export function FoldersView() {
  return (
    <div>
      <h1>Project X</h1>
      <FileTree tree={tree} />
    </div>
  );
}

const FileTree = ({ tree }: { tree: FileTree }) => {
  return (
    <div className="px-4">
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
      <div className="mb-2 flex flex-row items-center">
        {isDirectory ? <FolderIcon /> : <FileIcon />}
        <span>{node.name}</span>
      </div>

      {isDirectory && (
        <ul className="ml-4">
          {node.children.map((childNode, index) => (
            <FileTreeNode key={index} node={childNode} />
          ))}
        </ul>
      )}
    </li>
  );
};

const FileIcon = () => <span className="inline-flex px-1 font-mono font-bold">-</span>;

const FolderIcon = () => <span className="inline-flex px-1 font-mono font-bold">+</span>;

type FileTree = typeof tree;
type FileTreeNode = FileTree[0];

const tree = [
  {
    name: 'file1.md',
  },
  {
    name: 'file2.txt',
  },
  {
    name: 'folder1',
    children: [
      {
        name: 'file3.txt',
      },
      {
        name: 'file4.md',
      },
      {
        name: 'file5.md',
      },
    ],
  },
  {
    name: 'folder2',
    children: [
      {
        name: 'file6.md',
      },
      {
        name: 'file7.txt',
      },
      {
        name: 'file8.txt',
      },
    ],
  },
];
