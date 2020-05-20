import originalFirebase from 'firebase/app';

import * as proxiedFb from './modules/firebase';

// TODO: This dev environment should be someow specified by developer
const IS_PRODUCTION = false;
export const firebase = IS_PRODUCTION ? originalFirebase : proxiedFb.getProxiedFirebase();

export const __overrideEnvDevAPIKey = proxiedFb.__overrideEnvDevAPIKey;
