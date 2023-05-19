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
    <div
      style={{
        paddingLeft: '1rem',
        paddingRight: '1rem',
      }}
    >
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
        style={{
          marginBottom: '0.5rem',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        {isDirectory ? <FolderIcon /> : <FileIcon />}
        <span>{node.name}</span>
      </div>

      {isDirectory && (
        <ul style={{ marginLeft: '1rem' }}>
          {node.children.map((childNode, index) => (
            <FileTreeNode key={index} node={childNode} />
          ))}
        </ul>
      )}
    </li>
  );
};

const FileIcon = () => (
  <span
    style={{
      display: 'inline-flex',
      paddingLeft: '0.25rem',
      paddingRight: ' 0.25rem',
      fontFamily:
        'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      fontWeight: 700,
    }}
  >
    -
  </span>
);

const FolderIcon = () => (
  <span
    style={{
      display: 'inline-flex',
      paddingLeft: '0.25rem',
      paddingRight: ' 0.25rem',
      fontFamily:
        'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      fontWeight: 700,
    }}
  >
    +
  </span>
);

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
