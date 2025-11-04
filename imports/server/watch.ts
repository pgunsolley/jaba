import chokidar, { FSWatcher } from 'chokidar';
import { Stats } from 'node:fs';
import { dirname } from 'node:path';

export type OnReadyListener = () => void;
export type OnUnlinkListener = (filePath: string) => void;
export type OnAddListener = (filePath: string, stats?: Stats) => void;
export type OnErrorListener = (error: unknown) => void;

export interface WatchDirProps {
    path: string;
    onReadyListener?: OnReadyListener;
    onUnlinkListener: OnUnlinkListener;
    onAddListener: OnAddListener;
    onErrorListener?: OnErrorListener;
}

export const watchDir = ({ path, onReadyListener, onUnlinkListener, onAddListener, onErrorListener }: WatchDirProps): FSWatcher => {
    const watcher = chokidar.watch(path, {
        persistent: true,
        ignored: (filePath: string, stats?: Stats) => Boolean(stats && stats.isDirectory() && dirname(filePath) === path),
    });
    
    if (onReadyListener !== undefined) {
        watcher.on('ready', onReadyListener);
    }

    if (onErrorListener !== undefined) {
        watcher.on('error', onErrorListener);
    }

    return watcher
        .on('unlink', onUnlinkListener)
        .on('add', onAddListener);
};
