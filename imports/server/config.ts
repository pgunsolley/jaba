import env from 'env-var';

export default {
    mediaPath: env.get('MEDIA_PATH').required().asString(),
    thumbnailPathSuffix: env.get('THUMBNAIL_PATH_SUFFIX').required().asString(),
};
