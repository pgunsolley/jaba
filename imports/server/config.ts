import env from 'env-var';

export default {
    mediaPath: env.get('MEDIA_PATH').required().asString(),
};
