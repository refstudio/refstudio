import Fuse from 'fuse.js';

import { ReferenceItem } from '../../../../../types/ReferenceItem';

export const fuseOptions: Fuse.IFuseOptions<ReferenceItem> = {
  keys: ['title', 'authors.fullName'],
};
