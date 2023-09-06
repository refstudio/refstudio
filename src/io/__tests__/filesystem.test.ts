import { FileEntry as TauriFileEntry } from '@tauri-apps/api/fs';
import { desktopDir, join } from '@tauri-apps/api/path';

import {
  deleteProjectFile,
  existsProjectFile,
  readProjectBinaryFile,
  readProjectFiles,
  readProjectTextFile,
  renameProjectFile,
  writeProjectBinaryFile,
  writeProjectTextFile,
} from '../../api/projectsAPI';
import { EditorContent } from '../../atoms/types/EditorContent';
import { FileFileEntry } from '../../atoms/types/FileEntry';
import {
  deleteFile,
  ensureSampleProjectFiles,
  getFileNameAndExtension,
  getNewProjectsBaseDir,
  getUploadsDir,
  isInUploadsDir,
  makeUploadPath,
  readAllProjectFiles,
  readFileContent,
  renameFile,
  setCurrentFileSystemProjectId,
  splitRefStudioPath,
  uploadFiles,
  writeFileContent,
} from '../filesystem';

const PROJECT_ID = 'CAFEBABE-0000-0000-0000-000000000000';

vi.mock('@tauri-apps/api/path');

vi.mock('../../api/projectsAPI');

vi.mocked(desktopDir).mockResolvedValue('/usr/name/desktop');
vi.mocked(join).mockImplementation(async (...args: string[]) => Promise.resolve(args.join('/').replaceAll('//', '/')));

describe('filesystem', () => {
  beforeEach(() => {
    setCurrentFileSystemProjectId(PROJECT_ID);
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  // #####################################################################################
  // Top Level PATH API
  // #####################################################################################
  describe('top level path api', () => {
    it('should export the new projects base directory', async () => {
      expect(await getNewProjectsBaseDir()).toBeDefined();
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

      expect(writeProjectBinaryFile).toHaveBeenCalledTimes(files.length);
      let call = 1;
      for await (const file of files) {
        expect(writeProjectBinaryFile).toHaveBeenNthCalledWith(
          call++,
          PROJECT_ID,
          makeUploadPath(file.name),
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
    it('should create sample project structure with 3 files', async () => {
      await ensureSampleProjectFiles('/usr/documents/sample-x');
      expect(writeProjectTextFile).toHaveBeenCalledTimes(3);
    });

    it('should read all project files empty if none exists', async () => {
      vi.mocked(readProjectFiles).mockResolvedValue([]);
      const files = await readAllProjectFiles();
      expect(files).toHaveLength(0);
    });

    const makeFileEntry = (path: string, name: string, children?: TauriFileEntry[]) =>
      ({
        path: path + name,
        name,
        children,
      } as TauriFileEntry);

    it('should read project structure', async () => {
      let fileA;
      let fileD;
      const FILES = [
        (fileA = makeFileEntry('/', 'file A.txt')), //
        makeFileEntry('/', 'file B.txt'), //
        makeFileEntry('/', 'uploads', [
          makeFileEntry('/', 'file C.pdf'), //
          (fileD = makeFileEntry('/', 'file D.pdf')), //
          makeFileEntry('/', 'file E.pdf'), //
        ]), //
      ];
      vi.mocked(readProjectFiles).mockResolvedValue(FILES);

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

    it('should not call projectAPI if no project is open, and return []', async () => {
      setCurrentFileSystemProjectId('');
      const files = await readAllProjectFiles();
      expect(readProjectFiles).not.toHaveBeenCalled();
      expect(files).toHaveLength(0);
    });
  });

  // #####################################################################################
  // file path utils
  // #####################################################################################
  describe('file path utils', () => {
    it('should split ref studio path', () => {
      expect(splitRefStudioPath('file.txt')).toStrictEqual(['file.txt']);
    });

    it('should split ref studio path with many segments', () => {
      expect(splitRefStudioPath('some/folder/file.txt')).toStrictEqual(['some', 'folder', 'file.txt']);
    });

    it('should extract fileName and extension of a file path without extension', () => {
      expect(getFileNameAndExtension('file')).toStrictEqual({ name: 'file', ext: '' });
    });

    it('should extract fileName and extension of a file with a single dot', () => {
      expect(getFileNameAndExtension('file.txt')).toStrictEqual({ name: 'file', ext: 'txt' });
    });

    it('should extract fileName and extension of a file with a two dots', () => {
      expect(getFileNameAndExtension('file.extra.txt')).toStrictEqual({ name: 'file.extra', ext: 'txt' });
    });

    it('should extract fileName and extension of a file path with a two dots', () => {
      expect(getFileNameAndExtension('some/dir/file.extra.txt')).toStrictEqual({ name: 'file.extra', ext: 'txt' });
    });

    it('should extract fileName and extension of an empty file path', () => {
      expect(getFileNameAndExtension('')).toStrictEqual({ name: '', ext: '' });
    });

    it('should extract dot files (ex: .gitignore) correctly, with an empty extension', () => {
      expect(getFileNameAndExtension('.gitignore')).toStrictEqual({ name: '.gitignore', ext: '' });
      expect(getFileNameAndExtension('some/dir/.gitignore')).toStrictEqual({ name: '.gitignore', ext: '' });
    });
  });

  // #####################################################################################
  // FILE Operations: read, write, delete, rename
  // #####################################################################################
  describe('file operations', () => {
    it('should write file content via projects API', async () => {
      const result = await writeFileContent('/some/relative.txt', 'the content');
      expect(result).toBeTruthy();
      expect(writeProjectTextFile).toHaveBeenCalledTimes(1);
      expect(writeProjectTextFile).toHaveBeenCalledWith(PROJECT_ID, '/some/relative.txt', 'the content');
    });

    it('should return false if projects API fails for write', async () => {
      vi.mocked(writeProjectTextFile).mockRejectedValueOnce('');
      const result = await writeFileContent('/some/relative.txt', 'the content');
      expect(result).toBeFalsy();
    });

    it.each([
      { extension: 'xml', type: 'text' },
      { extension: 'md', type: 'text' },
      { extension: 'json', type: 'json' },
    ])('should read $extension file content via projects API', async ({ extension, type }) => {
      vi.mocked(readProjectTextFile).mockResolvedValue('Some content');
      const content = await readFileContent({
        path: '/file1.' + extension,
        name: 'file1.' + extension,
        fileExtension: extension,
        isDotfile: false,
        isFile: true,
        isFolder: false,
      });

      expect(readProjectTextFile).toHaveBeenCalledTimes(1);
      expect(content).toStrictEqual({
        type,
        textContent: 'Some content',
      });
    });

    it('should read refstudio file content via projects API', async () => {
      vi.mocked(readProjectTextFile).mockResolvedValue('{ "doc": "Some content" }');
      const content = await readFileContent({
        path: '/file1.refstudio',
        name: 'file1.refstudio',
        fileExtension: 'refstudio',
        isDotfile: false,
        isFile: true,
        isFolder: false,
      });

      expect(readProjectTextFile).toHaveBeenCalledTimes(1);
      expect(content).toStrictEqual<EditorContent>({
        type: 'refstudio',
        jsonContent: { doc: 'Some content' },
      });
    });

    it('should read PDF as binary from projects API', async () => {
      const binFileContent = Uint8Array.from([1, 2, 3]);
      vi.mocked(readProjectBinaryFile).mockResolvedValue(binFileContent);
      const content = await readFileContent({
        path: '/file1.pdf',
        name: 'file1.pdf',
        fileExtension: 'pdf',
        isDotfile: false,
        isFile: true,
        isFolder: false,
      });

      expect(readProjectBinaryFile).toHaveBeenCalledTimes(1);
      expect(content).toStrictEqual({
        type: 'pdf',
        binaryContent: binFileContent,
      });
    });

    it('should delete file content via projects API', async () => {
      const result = await deleteFile('some/relative.txt');
      expect(result).toBeTruthy();
      expect(deleteProjectFile).toHaveBeenCalledTimes(1);
      expect(deleteProjectFile).toHaveBeenCalledWith(PROJECT_ID, 'some/relative.txt');
    });

    it('should return false if projects API fails for delete', async () => {
      vi.mocked(deleteProjectFile).mockRejectedValueOnce('');
      const result = await deleteFile('some/relative.txt');
      expect(result).toBeFalsy();
    });

    it('should rename file content via projects API', async () => {
      vi.mocked(existsProjectFile).mockResolvedValue(false);
      const result = await renameFile('relative.txt', 'updated.txt');
      expect(result).toStrictEqual({ success: true, newPath: 'updated.txt' });
      expect(existsProjectFile).toHaveBeenCalledTimes(0);
      expect(renameProjectFile).toHaveBeenCalledTimes(1);
      expect(renameProjectFile).toHaveBeenCalledWith(PROJECT_ID, 'relative.txt', 'updated.txt');
    });

    it('should return unsuccessful if rename file outside of root', async () => {
      const result = await renameFile('outside/relative.txt', 'updated.txt');
      expect(result).toStrictEqual({ success: false });
    });

    it('should return unsuccessful if projects API fails for rename', async () => {
      vi.mocked(renameProjectFile).mockRejectedValue(false);
      const result = await renameFile('relative.txt', 'updated.txt');
      expect(result).toStrictEqual({ success: false });
    });
  });
});
