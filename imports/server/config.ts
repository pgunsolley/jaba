import { homedir } from 'node:os';

import env from 'env-var';

export default {
    appFilesPath: env.get('APP_FILES_PATH').default(homedir()).asString(),
    mediaPath: env.get('MEDIA_PATH').required().asString(),
};
