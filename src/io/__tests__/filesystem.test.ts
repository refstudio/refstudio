import {
  createDir as tauriCreateDir,
  exists as tauriExists,
  FileEntry as TauriFileEntry,
  readBinaryFile as tauriReadBinaryFile,
  readDir as tauriReadDir,
  readTextFile as tauriReadTextFile,
  removeFile as tauriRemoveFile,
  renameFile as tauriRenameFile,
  writeBinaryFile as tauriWriteBinaryFile,
  writeTextFile as tauriWriteTextFile,
} from '@tauri-apps/api/fs';
import { appConfigDir, appDataDir, join } from '@tauri-apps/api/path';

import { EditorContent } from '../../atoms/types/EditorContent';
import { FileFileEntry } from '../../atoms/types/FileEntry';
import {
  deleteFile,
  ensureProjectFileStructure,
  getParentFolder,
  getRefStudioPath,
  getSystemAppDataDir,
  getSystemConfigurationsDir,
  getSystemPath,
  getUploadsDir,
  isInUploadsDir,
  makeRefStudioPath,
  makeUploadPath,
  readAllProjectFiles,
  readFileContent,
  renameFile,
  splitRefStudioPath,
  uploadFiles,
  writeFileContent,
} from '../filesystem';

vi.mock('@tauri-apps/api/fs');
vi.mock('@tauri-apps/api/path');

const APP_CONFIG_DIR = '/usr/path/configdir/bundleid';
const APP_DATA_DIR = '/usr/path/datadir/bundleid';

vi.mocked(appConfigDir).mockResolvedValue(APP_CONFIG_DIR);
vi.mocked(appDataDir).mockResolvedValue(APP_DATA_DIR);
vi.mocked(join).mockImplementation(async (...args: string[]) => Promise.resolve(args.join('/').replaceAll('//', '/')));
vi.mocked(tauriReadDir).mockResolvedValue([]);

describe('filesystem', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  // #####################################################################################
  // Top Level PATH API
  // #####################################################################################
  describe('top level path api', () => {
    it('should export the (system) configurations directory', async () => {
      expect(await getSystemConfigurationsDir()).toBeDefined();
    });

    it('should export the (system) app data directory', async () => {
      expect(await getSystemAppDataDir()).toBeDefined();
    });

    it('should make system path from ref studio path', async () => {
      const rsPath = '/some/file.txt';
      const systemPath = await getSystemPath(rsPath);
      expect(systemPath).not.toBe(rsPath);
      expect(systemPath.endsWith(rsPath)).toBeTruthy();
    });

    it('should extract ref studio path from system path (reflective)', async () => {
      const rsPath = '/some/file.txt';
      const systemPath = await getSystemPath(rsPath);
      expect(await getRefStudioPath(systemPath)).toBe(rsPath);
    });
  });

  // #####################################################################################
  // UPLOADS
  // #####################################################################################
  describe('uploads', () => {
    it('should return non-empty uploads dir', () => {
      expect(getUploadsDir()).toBeDefined();
    });

    it('should make uploads path', () => {
      const path = makeUploadPath('file.pdf');
      expect(path).toBeDefined();
      expect(path).toContain('file.pdf');
    });

    it('should be able to check if file is in uploads dir', () => {
      const result = isInUploadsDir(makeUploadPath('file.pdf'));
      expect(result).toBeTruthy();
    });

    it('should be able to check if file is NOT in uploads dir', () => {
      const result = isInUploadsDir('/not-in-uploads-dir/file.pdf');
      expect(result).toBeFalsy();
    });

    it('should upload files', async () => {
      const fileBuffer = Buffer.from('(⌐□_□⌐)');
      const makeFile = (fileName: string) => {
        const file = new File([fileBuffer], fileName, { type: 'application/pdf' });
        file.arrayBuffer = () => Promise.resolve(fileBuffer);
        return file;
      };

      const files = [makeFile('file 1.pdf'), makeFile('file 2.pdf')];
      const uploadedFiles = await uploadFiles(files);

      expect(tauriWriteBinaryFile).toHaveBeenCalledTimes(files.length);
      expect(tauriWriteBinaryFile).toHaveBeenCalledWith(await getSystemPath(makeUploadPath(files[1].name)), fileBuffer);
      let call = 1;
      for await (const file of files) {
        expect(tauriWriteBinaryFile).toHaveBeenNthCalledWith(
          call++,
          await getSystemPath(makeUploadPath(file.name)),
          fileBuffer,
        );
      }

      expect(uploadedFiles).toHaveLength(files.length);
      expect(uploadedFiles).toStrictEqual(files.map((f) => f.name));
    });
  });

  // #####################################################################################
  // Project Structure and read project files
  // #####################################################################################
  describe('project structure and read files', () => {
    it('should create project structure if folder and files dont exist', async () => {
      await ensureProjectFileStructure();
      // Create 2 folders
      expect(tauriCreateDir).toHaveBeenCalledTimes(2);
      // Check and create 3 files
      expect(tauriExists).toHaveBeenCalledTimes(3);
      expect(tauriWriteTextFile).toHaveBeenCalledTimes(3);
    });

    it('should throw error if any tauri fs throws', async () => {
      vi.mocked(tauriCreateDir).mockRejectedValue('any');
      await expect(ensureProjectFileStructure()).rejects.toThrow();
    });

    it('should read all project files empty if none exists', async () => {
      const files = await readAllProjectFiles();
      expect(files).toHaveLength(0);
    });

    const makeFileEntry = async (path: string, name: string, children?: TauriFileEntry[]) =>
      ({
        path: await getSystemPath(path + name),
        name,
        children,
      } as TauriFileEntry);

    it('should read project structure', async () => {
      let fileA;
      let fileD;
      const FILES = [
        (fileA = await makeFileEntry('/', 'file A.txt')), //
        await makeFileEntry('/', 'file B.txt'), //
        await makeFileEntry('/', 'uploads', [
          await makeFileEntry('/', 'file C.pdf'), //
          (fileD = await makeFileEntry('/', 'file D.pdf')), //
          await makeFileEntry('/', 'file E.pdf'), //
        ]), //
      ];
      vi.mocked(tauriReadDir).mockResolvedValue(FILES);

      const files = await readAllProjectFiles();
      expect(files).toHaveLength(files.length);
      expect(files[0]).toStrictEqual<FileFileEntry>({
        path: '/' + fileA.name!,
        name: fileA.name!,
        fileExtension: 'txt',
        isDotfile: false,
        isFile: true,
        isFolder: false,
      });
      // Uploads folder
      expect(files[2].isFolder && files[2].children).toHaveLength(3);
      expect(files[2].isFolder && files[2].children[1]).toStrictEqual<FileFileEntry>({
        path: '/' + fileD.name!,
        name: fileD.name!,
        fileExtension: 'pdf',
        isDotfile: false,
        isFile: true,
        isFolder: false,
      });
    });
  });

  // #####################################################################################
  // file path utils
  // #####################################################################################
  describe('file path utils', () => {
    it('should make ref studio path', () => {
      const file = 'file.txt';
      const rsFilePath = makeRefStudioPath(file);
      expect(rsFilePath).toBeDefined();
      expect(rsFilePath).not.toBe(file);
    });

    it('should split ref studio path', () => {
      expect(splitRefStudioPath(makeRefStudioPath('file.txt'))).toStrictEqual(['', 'file.txt']);
    });

    it('should get parent folder', () => {
      const base = '/some/path/foo/file.txt';
      expect(getParentFolder(base)).toBe('/some/path/foo');
    });
  });

  // #####################################################################################
  // FILE Operations: read, write, delete, rename
  // #####################################################################################
  describe('file operations', () => {
    it('should write file content via tauri APIs', async () => {
      const result = await writeFileContent('/some/relative.txt', 'the content');
      expect(result).toBeTruthy();
      expect(tauriWriteTextFile).toHaveBeenCalledTimes(1);
      expect(tauriWriteTextFile).toHaveBeenCalledWith(await getSystemPath('/some/relative.txt'), 'the content');
    });

    it('should return false if tauri APIs fails for write', async () => {
      vi.mocked(tauriWriteTextFile).mockRejectedValueOnce('');
      const result = await writeFileContent('/some/relative.txt', 'the content');
      expect(result).toBeFalsy();
    });

    it.each([
      { extension: 'xml', type: 'text' },
      { extension: 'md', type: 'text' },
      { extension: 'json', type: 'json' },
    ])('should read $extension file content via tauri APIs', async ({ extension, type }) => {
      vi.mocked(tauriReadTextFile).mockResolvedValue('Some content');
      const content = await readFileContent({
        path: '/file1.' + extension,
        name: 'file1.' + extension,
        fileExtension: extension,
        isDotfile: false,
        isFile: true,
        isFolder: false,
      });

      expect(vi.mocked(tauriReadTextFile)).toHaveBeenCalledTimes(1);
      expect(content).toStrictEqual({
        type,
        textContent: 'Some content',
      });
    });

    it('should read refstudio file content via tauri APIs', async () => {
      vi.mocked(tauriReadTextFile).mockResolvedValue('{ "doc": "Some content" }');
      const content = await readFileContent({
        path: '/file1.refstudio',
        name: 'file1.refstudio',
        fileExtension: 'refstudio',
        isDotfile: false,
        isFile: true,
        isFolder: false,
      });

      expect(vi.mocked(tauriReadTextFile)).toHaveBeenCalledTimes(1);
      expect(content).toStrictEqual<EditorContent>({
        type: 'refstudio',
        jsonContent: { doc: 'Some content' },
      });
    });

    it('should read PDF as binary from tauri APIs', async () => {
      const binFileContent = Uint8Array.from([1, 2, 3]);
      vi.mocked(tauriReadBinaryFile).mockResolvedValue(binFileContent);
      const content = await readFileContent({
        path: '/file1.pdf',
        name: 'file1.pdf',
        fileExtension: 'pdf',
        isDotfile: false,
        isFile: true,
        isFolder: false,
      });

      expect(vi.mocked(tauriReadBinaryFile)).toHaveBeenCalledTimes(1);
      expect(content).toStrictEqual({
        type: 'pdf',
        binaryContent: binFileContent,
      });
    });

    it('should delete file content via tauri APIs', async () => {
      const result = await deleteFile('/some/relative.txt');
      expect(result).toBeTruthy();
      expect(tauriRemoveFile).toHaveBeenCalledTimes(1);
      expect(tauriRemoveFile).toHaveBeenCalledWith(await getSystemPath('/some/relative.txt'));
    });

    it('should return false if tauri APIs fails for delete', async () => {
      vi.mocked(tauriRemoveFile).mockRejectedValueOnce('');
      const result = await deleteFile('/some/relative.txt');
      expect(result).toBeFalsy();
    });

    it('should rename file content via tauri APIs', async () => {
      const result = await renameFile('/some/relative.txt', 'updated.txt');
      expect(result).toStrictEqual({ success: true, newPath: '/some/updated.txt' });
      expect(tauriExists).toHaveBeenCalledTimes(1);
      expect(tauriRenameFile).toHaveBeenCalledTimes(1);
      expect(tauriRenameFile).toHaveBeenCalledWith(
        await getSystemPath('/some/relative.txt'),
        await getSystemPath('/some/updated.txt'), //
      );
    });

    it('should return unsuccessful if tauri APIs fails for rename (file exists)', async () => {
      vi.mocked(tauriExists).mockResolvedValue(true);
      const result = await renameFile('/some/relative.txt', 'updated.txt');
      expect(result).toStrictEqual({ success: false });
    });

    it('should return unsuccessful if tauri APIs fails for rename (rename fails)', async () => {
      vi.mocked(tauriRenameFile).mockRejectedValue(false);
      const result = await renameFile('/some/relative.txt', 'updated.txt');
      expect(result).toStrictEqual({ success: false });
    });
  });
});
