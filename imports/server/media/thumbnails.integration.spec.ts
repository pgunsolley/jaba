import { basename, join } from 'node:path';
import { promisify } from 'node:util';

import { expect } from 'chai';
import { createFixture, FsFixture } from 'fs-fixture';
import imgGen from 'js-image-generator';
import sharp from 'sharp';

const generateImage = promisify(imgGen.generateImage);

describe('imports/server/media/thumbnails.ts', function () {
    let fixture: FsFixture;
    let appFilesPath: string;
    let mediaPath: string;
    let thumbnailsPath: string;
    let thumbnailsModule: typeof import('../media/thumbnails');
    
    beforeEach(async function () {
        fixture = await createFixture();
        appFilesPath = await fixture.mkdir('.jaba') as string;
        mediaPath = await fixture.mkdir('media') as string;
        thumbnailsPath = await fixture.mkdir('.jaba/thumbnails') as string;
        process.env.APP_FILES_PATH = appFilesPath;
        process.env.MEDIA_PATH = mediaPath;
        thumbnailsModule = await import('../media/thumbnails');
    });
    
    afterEach(async function () {
        await fixture.rm();
    });
    
    describe('writeFromImagePath()', async function () {
        it('should write thumbnail successfully', async function () {
            const image = await generateImage(1200, 1200, 80);
            const imageName = 'image.jpg';
            const imageFullPath = join(mediaPath, imageName);
            const imageRelativePath = join(basename(mediaPath), imageName);
            const expectedThumbnailFullPath = join(thumbnailsPath, imageName);
            await fixture.writeFile(imageRelativePath, image.data);
            await thumbnailsModule.writeFromImagePath(imageFullPath);
            const thumbnailMeta = await sharp(expectedThumbnailFullPath).metadata();
            expect(thumbnailMeta.width).to.equal(thumbnailsModule.thumbnailWidth);
            expect(thumbnailMeta.height).to.equal(thumbnailsModule.thumbnailHeight);
        });
    });
});
