import { mkdir, constants } from 'node:fs/promises';

export const mkdirIfNotExists = (path: string, mode = constants.R_OK | constants.W_OK) => mkdir(path, { recursive: true, mode, });
