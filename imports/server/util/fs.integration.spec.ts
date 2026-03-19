import { join } from 'node:path';

import { createFixture, FsFixture } from 'fs-fixture';
import { expect } from 'chai';

import { mkdirIfNotExists } from './fs';

describe('imports/server/fs.ts', function () {
    let fixture: FsFixture;
    let path: string

    beforeEach(async function () {
        fixture = await createFixture();
        process.on('SIGINT', () => { console.log('SIGINT INTERCEPTED'); fixture.rm(); });
        path = fixture.path;
    });

    afterEach(async function () {
        await fixture.rm();
    });

    describe('mkdirIfNotExists()', function () {
        it('should create a directory', async function () {
            this.timeout(1200);

            expect(await fixture.exists('foo')).to.be.false;
            await mkdirIfNotExists(join(path, 'foo'));
            expect(await fixture.exists('foo')).to.be.true;
        });

        it('should not modify the existing directory', async function () {
            this.timeout(1200);

            await fixture.mkdir('foo');
            await fixture.writeFile('foo/foo.txt', 'foo');
            await mkdirIfNotExists(join(path, 'foo'));
            expect(await fixture.exists('foo/foo.txt')).to.be.true;
            expect((await fixture.readFile('foo/foo.txt')).toString()).to.equal('foo');
        });
    });
});