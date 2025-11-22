import { MatchFunction } from 'chokidar';
import { Stats } from 'fs';
import { dirname } from 'path';

export const isSubdirectory = (path: string | string[]): MatchFunction =>
    (filePath: string, stats?: Stats) => {
        const dirName = dirname(filePath);
        return Boolean(stats && stats.isDirectory() && (Array.isArray(path) ? path.includes(dirName) : dirName === path));
    }
