import firebase from 'firebase/app';
import { FoundryEnvDevAPI } from '../../../api';
import { Proxied } from '../../../proxy';

import { proxyAuth } from './auth';
import { proxyDatabase } from './database';
import { proxyFirestore } from './firestore';

// This module is used specifically for proxying Foundry Auth app

// Foundry Auth app is used for instead of the whole auth modules
// in developers' Firebase apps (because there isn't an Auth emulator)

// We must proxy auth module and currentUser so we return unprefixed
// email and uid
export function proxyApp(
  foundryAuthApp: firebase.app.App,
  developerAppConfig: any,
  developerAppName: string,
  foundryEnvDevAPI: FoundryEnvDevAPI
) {
  return new Proxied<firebase.app.App>(foundryAuthApp)
    .when('name', () => developerAppName)
    .when('options', () => developerAppConfig)
    .when('auth', (app) => () => {
      return proxyAuth(app.auth(), developerAppConfig.projectId, foundryEnvDevAPI);
    })

    // We  have to proxy following modules because when a developer writes
    // 'database().app' we must return the developer's app and not Foundry Auth
    // app.
    .when('database', (app) => (url?: string) => {
      return proxyDatabase(app.database(url));
    })
    .when('firestore', (app) => () => {
      return proxyFirestore(app.firestore());
    })
    // No need to proxy the 'functions' module because you can't access Firebase app
    // through functions like so 'functions().app'
    .finalize();
}

// export function getProxiedFirebase(developerAppProjectId: string, foundryEnvDevAPI: FoundryEnvDevAPI) {
//   return new Proxied<typeof firebase>(firebase)
//     // We need to proxy only the following functions because user doesn't
//     // have access to the whole Foundry Auth app, only to these modules
//     // of the Foundry Auth app.
//     .when('auth', (fb) => (app?: firebase.app.App) => {
//       console.log('PROXY AUTH (Foundry Auth app)');
//       return proxyAuth(app ? app.auth() : fb.auth(), developerAppProjectId, foundryEnvDevAPI);
//     })

//     // We  have to proxy following modules because when a developer writes
//     // 'database().app' we must return the developer's app and not Foundry Auth
//     // app.
//     .when('database', (fb) => (app?: firebase.app.App) => {
//       return proxyDatabase(app ? app.database() : fb.database());
//     })
//     .when('firestore', (fb) => (app?: firebase.app.App) => {
//       return proxyFirestore(app ? app.firestore() : fb.firestore());
//     })
//     .finalize();
// }