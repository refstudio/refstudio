const UPLOADS_DIR = 'uploads';
const EXPORTS_DIR = 'exports';

function join(...segments: string[]) {
  return segments.join('/').replaceAll('//', '/');
}

// #####################################################################################
// Top Level PATH API
// #####################################################################################
export const getNewProjectsBaseDir = vi.fn(() => '/usr/name/desktop');
export const getSeparator = vi.fn(() => '/');

// FileSystem project ID
// #####################################################################################
export const setCurrentFileSystemProjectId = vi.fn();

// #####################################################################################
// UPLOADS
// #####################################################################################
export const getUploadsDir = vi.fn(() => UPLOADS_DIR);
export const getExportsDir = vi.fn(() => EXPORTS_DIR);
export const makeUploadPath = vi.fn((filename: string) => join(UPLOADS_DIR, filename));
export const isInUploadsDir = vi.fn((path: string) => path.startsWith(UPLOADS_DIR));
export const uploadFiles = vi.fn();

// #####################################################################################
// Project Structure and read project files
// #####################################################################################
export const ensureSampleProjectFiles = vi.fn();
export const readAllProjectFiles = vi.fn(() => []);

// #####################################################################################
// file path utils
// #####################################################################################
export const splitRefStudioPath = vi.fn((path: string) => path.split('/'));

// #####################################################################################
// FILE Operations: read, write, delete, rename
// #####################################################################################
export const writeFileContent = vi.fn();
export const readFileContent = vi.fn();
export const deleteFile = vi.fn();
export const renameFile = vi.fn();

// #####################################################################################
// Export Operations: references, markdown
// #####################################################################################
export const exportReferences = vi.fn();
