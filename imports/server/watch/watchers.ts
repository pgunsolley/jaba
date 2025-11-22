import chokidar, { FSWatcher, Matcher } from 'chokidar';
import { Stats } from 'node:fs';
import { isSubdirectory } from './matchers';

export type OnReadyListener = () => void;
export type OnUnlinkListener = (filePath: string) => void;
export type OnAddListener = (filePath: string, stats?: Stats) => void;
export type OnErrorListener = (error: unknown) => void;

export interface WatchersProp {
    onReadyListener?: OnReadyListener;
    onUnlinkListener?: OnUnlinkListener;
    onAddListener?: OnAddListener;
    onErrorListener?: OnErrorListener;
}

export interface WatchDirProps extends WatchersProp {
    path: string | string[];
}

const registerListeners = (
    watcher: FSWatcher,
    {
        onReadyListener,
        onUnlinkListener,
        onAddListener,
        onErrorListener,
    }: WatchersProp
) => {
    if (onReadyListener !== undefined) {
        watcher.on('ready', onReadyListener);
    }

    if (onErrorListener !== undefined) {
        watcher.on('error', onErrorListener);
    }

    if (onUnlinkListener !== undefined) {
        watcher.on('unlink', onUnlinkListener);
    }

    if (onAddListener !== undefined) {
        watcher.on('add', onAddListener);
    }

    return watcher;
};

export const watchDir = ({ 
    path,
    onReadyListener,
    onUnlinkListener,
    onAddListener,
    onErrorListener,
}: WatchDirProps): FSWatcher => {
    const watcher = chokidar.watch(path, {
        persistent: true,
        ignored: isSubdirectory(path),
    });
    
    return registerListeners(watcher, { onReadyListener, onUnlinkListener, onAddListener, onErrorListener });
};

export const watch = ({
    path,
    ignored,
    onReadyListener,
    onUnlinkListener,
    onAddListener,
    onErrorListener,
}: WatchDirProps & { ignored?: Matcher }): FSWatcher => {
    const watcher = chokidar.watch(path, {
        persistent: true,
        ignored,
    });

    return registerListeners(watcher, { onReadyListener, onUnlinkListener, onAddListener, onErrorListener });
};
