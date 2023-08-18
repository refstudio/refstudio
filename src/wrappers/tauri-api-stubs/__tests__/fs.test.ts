import { createDir, readDir, removeDir, renameFile, resetInMemoryFsForTesting, writeTextFile } from '../fs';

describe('in-memory fs', () => {
  afterEach(() => {
    resetInMemoryFsForTesting();
  });

  it('should create a directory', async () => {
    await createDir('/path/to/dir', { recursive: true });
    expect(await readDir('/path/to', { recursive: true })).toMatchInlineSnapshot(`
      [
        {
          "children": [],
          "name": "dir",
          "path": "/path/to/dir",
        },
      ]
    `);
  });

  it('should allow double-slashes', async () => {
    await createDir('/path/to//dir', { recursive: true });
    expect(await readDir('/path//to', { recursive: true })).toMatchInlineSnapshot(`
      [
        {
          "children": [],
          "name": "dir",
          "path": "/path/to/dir",
        },
      ]
    `);
  });

  it('should create a file in a directory', async () => {
    await createDir('/path/to/dir', { recursive: true });
    await writeTextFile('/path/to/dir/file.txt', 'Hello World');
    expect(await readDir('/path/to', { recursive: true })).toMatchInlineSnapshot(`
      [
        {
          "children": [
            {
              "children": undefined,
              "name": "file.txt",
              "path": "/path/to/dir/file.txt",
            },
          ],
          "name": "dir",
          "path": "/path/to/dir",
        },
      ]
    `);

    expect(await readDir('/path/to', { recursive: false })).toMatchInlineSnapshot(`
      [
        {
          "children": undefined,
          "name": "dir",
          "path": "/path/to/dir",
        },
      ]
    `);
  });

  it('should remove a directory', async () => {
    await createDir('/path/to/a', { recursive: true });
    await createDir('/path/to/b', { recursive: true });
    await writeTextFile('/path/to/a/file1.txt', 'Hello World');
    await writeTextFile('/path/to/a/file2.txt', 'Hello World');
    await writeTextFile('/path/to/b/file3.txt', 'Hello World');
    expect(await readDir('/path/to', { recursive: false })).toMatchInlineSnapshot(`
      [
        {
          "children": undefined,
          "name": "a",
          "path": "/path/to/a",
        },
        {
          "children": undefined,
          "name": "b",
          "path": "/path/to/b",
        },
      ]
    `);
    expect(await readDir('/path/to/a', { recursive: false })).toMatchInlineSnapshot(`
      [
        {
          "children": undefined,
          "name": "file1.txt",
          "path": "/path/to/a/file1.txt",
        },
        {
          "children": undefined,
          "name": "file2.txt",
          "path": "/path/to/a/file2.txt",
        },
      ]
    `);
    await removeDir('/path/to/a', { recursive: true });
    expect(await readDir('/path/to', { recursive: false })).toMatchInlineSnapshot(`
      [
        {
          "children": undefined,
          "name": "b",
          "path": "/path/to/b",
        },
      ]
    `);
  });

  it('should rename files', async () => {
    await writeTextFile('/path/to/a/file1.txt', 'Hello World');
    await renameFile('/path/to/a/file1.txt', '/path/to/a/file2.txt');
    expect(await readDir('/path/to/a', { recursive: false })).toMatchInlineSnapshot(`
      [
        {
          "children": undefined,
          "name": "file2.txt",
          "path": "/path/to/a/file2.txt",
        },
      ]
    `);
  });
});
