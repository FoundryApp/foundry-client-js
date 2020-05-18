import firebase from 'firebase/app';

import { Proxied } from '../../proxy';
import { FoundryEnvDevAPI } from '../../api';

import { proxyAuth } from './auth';

export function proxyApp(fbApp: firebase.app.App, foundryEnvDevAPI: FoundryEnvDevAPI) {
  return new Proxied<firebase.app.App>(fbApp)
    .when('auth', (app) => () => {
      return proxyAuth(app.auth(), foundryEnvDevAPI);
    })
    .finalize();
}
