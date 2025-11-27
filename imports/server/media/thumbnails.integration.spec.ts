import { basename, join } from 'node:path';
import { promisify } from 'node:util';
import { createWriteStream } from 'node:fs';

import { expect } from 'chai';
import { createFixture, FsFixture } from 'fs-fixture';
import imgGen from 'js-image-generator';
import PDFDocument from 'pdfkit';
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
        process.on('SIGINT', () => fixture.rm());
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
    
    describe('writeFromImagePath()', function () {
        it('should write thumbnail successfully', async function () {
            const image = await generateImage(1200, 1200, 80);
            const imageName = 'image';
            const imageNameWExt = 'image.png';
            const imageFullPath = join(mediaPath, imageNameWExt);
            const imageRelativePath = join(basename(mediaPath), imageNameWExt);
            const expectedThumbnailFullPath = join(thumbnailsPath, `${imageName}.jpg`);
            await fixture.writeFile(imageRelativePath, image.data);
            await thumbnailsModule.writeFromImagePath(imageFullPath, imageName);
            const thumbnailMeta = await sharp(expectedThumbnailFullPath).metadata();
            expect(thumbnailMeta.width).to.equal(thumbnailsModule.thumbnailWidth);
            expect(thumbnailMeta.height).to.equal(thumbnailsModule.thumbnailHeight);
        });
    });

    // FIXME:
    describe('writeFromPdfPath()', function () {
        it.skip('should write thumbnail successfully', function () {
            this.timeout(1500);
            const docName = 'doc.pdf';
            const thumbnailName = `doc`;
            const docFullPath = join(mediaPath, docName);
            const expectedThumbnailFullPath = join(thumbnailsPath, `${thumbnailName}.1.jpg`);
            const pdfStream = createWriteStream(docFullPath);
            return new Promise<void>((resolve, reject) => {
                pdfStream.on('finish', () => {
                    thumbnailsModule
                        .writeFromPdfPath(docFullPath, thumbnailName)
                        .then(() => fixture.readdir(basename(thumbnailsPath))) // DEBUG
                        .then((contents) => { console.log('fixture contents'); console.log(contents); }) // DEBUG
                        .then(() => sharp(expectedThumbnailFullPath).metadata())
                        .then((thumbnailMeta) => {
                            expect(thumbnailMeta.width).to.equal(thumbnailsModule.thumbnailWidth);
                            expect(thumbnailMeta.height).to.equal(thumbnailsModule.thumbnailHeight);
                            resolve();
                        })
                        .catch((err) => {
                            console.error(err);
                            return reject(err);
                        });
                });
                const doc = new PDFDocument();
                doc.pipe(pdfStream);
                doc.fontSize(25).text('Foobar foobar foobar', 100, 80);
                doc.save();
                doc.end();
            });
        });
    });
});
