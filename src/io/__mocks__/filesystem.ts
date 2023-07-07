const UPLOADS_DIR = 'uploads';

export const makeUploadPath = (filename: string) => `/${UPLOADS_DIR}/${filename}`;

export const makeNewFilePath = (filename: string) => `/${filename}`;

export const splitFilePath = (filePath: string) => filePath.split('/');

export const getUploadsDir = vi.fn();

export const getConfigDir = vi.fn();

export const getAppDataDir = vi.fn();

export const ensureProjectFileStructure = vi.fn();

export const readAllProjectFiles = vi.fn();

export const writeFileContent = vi.fn();

export const uploadFiles = vi.fn();

export const readFileContent = vi.fn();

export const deleteFile = vi.fn();
