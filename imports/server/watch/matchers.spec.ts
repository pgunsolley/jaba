import { expect } from 'chai';

import { stub } from 'sinon';
import { Stats } from 'fs';

import { isSubdirectory } from "./matchers";

describe('imports/server/watch/matchers.ts', function () {
    describe('ignoreSubdirectories()', function () {
        const createStatsStub = ({
            isDirectory,
        }: Pick<Stats, 'isDirectory'>): Stats => ({
            isFile: () => false,
            isDirectory,
            isBlockDevice: () => true,
            isCharacterDevice: () => true,
            isSymbolicLink: () => true,
            isFIFO: () => true,
            isSocket: () => true,
            dev: 0,
            ino: 0,
            mode: 0,
            nlink: 0,
            uid: 0,
            gid: 0,
            rdev: 0,
            size: 0,
            blksize: 0,
            blocks: 0,
            atimeMs: 0,
            mtimeMs: 0,
            ctimeMs: 0,
            birthtimeMs: 0,
            atime: new Date(),
            mtime: new Date(),
            ctime: new Date(),
            birthtime: new Date(),
        });

        it('should return true when directory', function () {
            const matcher = isSubdirectory('foo/bar/baz');
            const stats = createStatsStub({
                isDirectory: stub().returns(true),
            });
            const results = matcher('foo/bar/baz/some-directory', stats);
            expect(results).to.be.true;
        });

        it('should return false when not directory', function () {
            const matcher = isSubdirectory('foo/bar/baz');
            const stats = createStatsStub({
                isDirectory: stub().returns(false),
            });
            const results = matcher('foo/bar/baz/some-file', stats);
            expect(results).to.be.false;
        });

        it('should return false when dirname does not match', function () {
            const matcher = isSubdirectory('foo/bar/baz');
            const stats = createStatsStub({
                isDirectory: stub().returns(false),
            });
            const results = matcher('some/where/else/some-file', stats);
            expect(results).to.be.false;
        });
    });
});