import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

import sharp from 'sharp';
import { fromPath as pdf2picFromPath } from 'pdf2pic';

import config from '../config';
import { mkdirIfNotExists } from '../fs';

const thumbnailsPath = join(config.appFilesPath, 'thumbnails');
export const thumbnailWidth = 300;
export const thumbnailHeight = 300;

const removeExtension = (value: string) => value.replace(/\.[^.]+?$/, '');
const generateDefaultName = () => randomUUID();
export const createThumbnailsDirectoryIfNotExists = () => mkdirIfNotExists(thumbnailsPath);

export const writeFromImagePath = (imagePath: string, name?: string) => {    
    if (name === undefined) {
        name = generateDefaultName();
    }

    return sharp(imagePath)
        .resize({
            width: thumbnailWidth,
            height: thumbnailHeight,
        })
        .toFile(join(thumbnailsPath, `${removeExtension(name)}.jpg`))
        .then((info) => ({ ...info, name }));
}

export const writeFromPdfPath = (pdfPath: string, name: string) => {
    if (name === undefined) {
        name = generateDefaultName();
    }

    return pdf2picFromPath(pdfPath, {
        density: 100,
        saveFilename: removeExtension(name),
        savePath: thumbnailsPath,
        format: 'jpg',
        width: thumbnailWidth,
        height: thumbnailHeight,
    })(1);
}
