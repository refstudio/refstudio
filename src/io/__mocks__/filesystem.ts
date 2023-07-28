const PROJECT_PATH = '/usr/documents/refstudio/project-x';
const SYSTEM_PATH = '/usr/name/foo/tauri.foo';
const UPLOADS_DIR = 'uploads';

function join(...segments: string[]) {
  return segments.join('/').replaceAll('//', '/');
}

// #####################################################################################
// Top Level PATH API
// #####################################################################################
export const getSystemConfigurationsDir = vi.fn(() => join(SYSTEM_PATH, 'config'));
export const getNewProjectsBaseDir = vi.fn(() => '/desktop');
export const getRefStudioPath = vi.fn((path: string) => path.replace(SYSTEM_PATH, ''));
export const getProjectBaseDir = vi.fn(() => PROJECT_PATH);
export const setProjectBaseDir = vi.fn();
export const getSystemPath = vi.fn((rsPath: string) => join(SYSTEM_PATH, 'project-x', rsPath));
export const getSeparator = vi.fn(() => '/');

// #####################################################################################
// UPLOADS
// #####################################################################################
export const getUploadsDir = vi.fn(() => join('/', UPLOADS_DIR));
export const makeUploadPath = vi.fn((filename: string) => join(UPLOADS_DIR, filename));
export const isInUploadsDir = vi.fn((path: string) => path.startsWith(join('/', UPLOADS_DIR)));
export const uploadFiles = vi.fn();

// #####################################################################################
// Project Structure and read project files
// #####################################################################################
export const openProject = vi.fn();
export const readAllProjectFiles = vi.fn(() => []);

// #####################################################################################
// file path utils
// #####################################################################################
export const makeRefStudioPath = vi.fn((file: string) => '/' + file);
export const splitRefStudioPath = vi.fn((path: string) => path.split('/'));
export const getParentFolder = vi.fn((path: string) => path.split('/').slice(0, -1).join('/'));

// #####################################################################################
// FILE Operations: read, write, delete, rename
// #####################################################################################
export const writeFileContent = vi.fn();
export const readFileContent = vi.fn();
export const deleteFile = vi.fn();
export const renameFile = vi.fn();
