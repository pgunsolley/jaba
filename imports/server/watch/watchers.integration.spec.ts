/*
watchDir() tests are dependent on underlying filesystem and configured tmp dir,
and heavily rely on timeouts to test accurately.
Tests passed using Fedora 42 /tmp in memory:
https://docs.fedoraproject.org/en-US/defensive-coding/tasks/Tasks-Temporary_Files/
*/

import { createFixture, FsFixture } from 'fs-fixture';
import { SinonSpy, spy, assert } from 'sinon';

import { sleep } from '../../utils/sleep';
import { watch, watchDir } from './watchers';

describe('imports/server/watch.ts', function () {
    let fixture: FsFixture;
    let path: string;
    let onAddListener: SinonSpy;
    let onReadyListener: SinonSpy;
    let onUnlinkListener: SinonSpy;

    beforeEach(async function () {
        fixture = await createFixture();
        path = fixture.path;
        onAddListener = spy();
        onReadyListener = spy();
        onUnlinkListener = spy();
    });

    afterEach(async function () {
        await fixture.rm();
    });

    // Extends functionality from watch(), adding a watcher for subdirectories to be ignored
    describe('watchDir()', function () {
        this.timeout(8000);

        beforeEach(function () {
            watchDir({ path, onAddListener, onReadyListener, onUnlinkListener });
        });

        it('should not call onAddListener() when a directory is added', async function () {
            await fixture.mkdir('some-directory');
            await sleep(4000);
            assert.calledOnce(onReadyListener);
            assert.callCount(onAddListener, 0);
            assert.callCount(onUnlinkListener, 0);
        });

        it('should call onAddListener() once when a file is added', async function () {
            await fixture.writeFile('foo.txt', 'foo');
            await sleep(4000);
            assert.calledOnce(onReadyListener);
            assert.calledOnce(onAddListener);
            assert.callCount(onUnlinkListener, 0);
        });
    });

    // Shares functionality with watchDir(), but allows caller to pass Matcher.
    // Shared functionality is tested here.
    describe('watch()', function () {
        this.timeout(8000);

        beforeEach(async function () {
            watch({ path, onAddListener, onReadyListener, onUnlinkListener });
        });

        it('should call onReadListener() once on initialization', async function () {
            await sleep(1000);
            assert.calledOnce(onReadyListener);
            assert.callCount(onAddListener, 0);
            assert.callCount(onUnlinkListener, 0);
        });

        it('should call onReadyListener() once and onAddListener() once after writing 1 file', async function () {
            await fixture.writeFile('foo.txt', 'foo');
            await sleep(1000);
            assert.calledOnce(onReadyListener);
            assert.calledOnce(onAddListener);
            assert.callCount(onUnlinkListener, 0);
        });

        it('should call onReadyListener() once and onAddListener() twice after writing 2 files', async function () {
            await fixture.writeFile('foo.txt', 'foo');
            await fixture.writeFile('bar.txt', 'bar');
            await sleep(1000);
            assert.calledOnce(onReadyListener);
            assert.calledTwice(onAddListener);
            assert.callCount(onUnlinkListener, 0);
        });

        it('should call onReadyLlistener() once, onAddListener() twice, onUnlinkListener() once after writing 2 files, and removing 1', async function () {
            await fixture.writeFile('foo.txt', 'foo');
            await fixture.writeFile('bar.txt', 'bar');
            await fixture.rm('bar.txt');
            await sleep(3000);
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
            assert.callCount(onUnlinkListener, 0);
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

        it('should call onReadyListener() once, and ignore added subdirectory', async function () {
            await fixture.mkdir('foo');
            await sleep(1000);
            assert.calledOnce(onReadyListener);
            assert.callCount(onAddListener, 0);
            assert.callCount(onUnlinkListener, 0);
        });
    });
});