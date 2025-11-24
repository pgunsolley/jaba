import { basename, join } from 'node:path';

import sharp from 'sharp';
import { fromPath as pdf2picFromPath } from 'pdf2pic';

import config from '../config';
import { mkdirIfNotExists } from '../fs';

const thumbnailsPath = join(config.appFilesPath, 'thumbnails');
export const thumbnailWidth = 300;
export const thumbnailHeight = 300;

export const createThumbnailsDirectoryIfNotExists = () => mkdirIfNotExists(thumbnailsPath);

export const writeFromImagePath = (filePath: string) =>
    sharp(filePath)
        .resize({
            width: thumbnailWidth,
            height: thumbnailHeight,
        })
        .toFile(join(thumbnailsPath, basename(filePath)));

export const writeFromPdfPath = (filePath: string) => 
    pdf2picFromPath(filePath, {
        density: 100,
        saveFilename: basename(filePath),
        savePath: thumbnailsPath,
        format: "png",
        width: thumbnailWidth,
        height: thumbnailHeight,
    })(1);
