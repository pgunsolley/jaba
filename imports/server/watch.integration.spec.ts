import { createFixture, FsFixture } from 'fs-fixture';
import { SinonSpy, spy, assert } from 'sinon';
import { FSWatcher } from 'chokidar';

import { sleep } from '../utils/sleep';
import { watchDir } from './watch';

// Tests are dependent on underlying filesystem and configured tmp dir,
// and heavily rely on timeouts to test accurately.
describe('imports/server/watch.ts', function () {
    describe('watchDir()', function () {
        this.timeout(8000);

        let fixture: FsFixture;
        let watcher: FSWatcher;
        let onAddListener: SinonSpy;
        let onReadyListener: SinonSpy;
        let onUnlinkListener: SinonSpy;

        beforeEach(async function () {
            fixture = await createFixture();
            onAddListener = spy();
            onReadyListener = spy();
            onUnlinkListener = spy();
            const path = fixture.path;
            watcher = watchDir({ path, onAddListener, onReadyListener, onUnlinkListener });
        });

        afterEach(async function () {
            await fixture.rm();
        });

        it('should call onReadListener() once on initialization', async function () {
            await sleep(1000);
            assert.calledOnce(onReadyListener);
            assert.neverCalledWith(onAddListener);
            assert.neverCalledWith(onUnlinkListener);
        });

        it('should call onReadyListener() once and onAddListener() once after writing 1 file', async function () {
            await fixture.writeFile('foo.txt', 'foo');
            await sleep(1000);
            assert.calledOnce(onReadyListener);
            assert.calledOnce(onAddListener);
            assert.neverCalledWith(onUnlinkListener);
        });

        it('should call onReadyListener() once and onAddListener() twice after writing 2 files', async function () {
            await fixture.writeFile('foo.txt', 'foo');
            await fixture.writeFile('bar.txt', 'bar');
            await sleep(1000);
            assert.calledOnce(onReadyListener);
            assert.calledTwice(onAddListener);
            assert.neverCalledWith(onUnlinkListener);
        });

        it('should call onReadyLlistener() once, onAddListener() twice, onUnlinkListener() once after writing 2 files, and removing 1', async function () {
            await fixture.writeFile('foo.txt', 'foo');
            await fixture.writeFile('bar.txt', 'bar');
            await fixture.rm('bar.txt');
            await sleep(1000);
            assert.calledOnce(onReadyListener);
            assert.calledTwice(onAddListener);
            assert.calledOnce(onUnlinkListener);
        });

        it('should call onReadyListener() once, onAddListener() 10000 times', async function () {
            const fileCount = 10000;
            await Promise.all([...Array(fileCount).keys()].map((n) => fixture.writeFile(`foo_${n}.txt`, 'foo')));
            await sleep(3000);
            assert.calledOnce(onReadyListener);
            assert.callCount(onAddListener, fileCount);
            assert.neverCalledWith(onUnlinkListener);
        });

        it('should call onReadyListener() once, onAddListener() 10000 times, and onUnlinkListner() 10000 times', async function () {
            const fileCount = 10000;
            const range = [...Array(fileCount).keys()];
            const fileName = (n: number) => `foo_${n}.txt`;
            await Promise.all(range.map((n) => fixture.writeFile(fileName(n), 'foo')));
            await sleep(3000);
            await Promise.all(range.map((n) => fixture.rm(fileName(n))));
            await sleep(3000);
            assert.calledOnce(onReadyListener);
            assert.callCount(onAddListener, fileCount);
            assert.callCount(onUnlinkListener, fileCount);
        });
    });
});