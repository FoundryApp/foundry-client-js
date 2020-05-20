// import firebase from '@firebase/app';

import { Proxied } from '../../../proxy';

import * as manager from '../manager';

export function proxyApp(fbApp: firebase.app.App) {
  return new Proxied<firebase.app.App>(fbApp)
    .when('auth', (app) => () => {
      manager.importAuth();
      // Return auth of the Foundry Auth app that
      // is associated with the developer's app
      const developerAppName = app.name;
      const authAppName = manager.foundryAuthAppNamePrefix + developerAppName;
      const foundryAuthApp = manager.getProxiedFoundryAuthApp(authAppName);
      return foundryAuthApp.auth();
    })
    .when('database', (app) => (url?: string) => {
      manager.importDatabase();
      const developerAppName = app.name;
      const authAppName = manager.foundryAuthAppNamePrefix + developerAppName;
      const foundryAuthApp = manager.getProxiedFoundryAuthApp(authAppName);
      return foundryAuthApp.database(url);
    })
    .when('firestore', (app) => () => {
      manager.importFirestore();
      const developerAppName = app.name;
      const authAppName = manager.foundryAuthAppNamePrefix + developerAppName;
      const foundryAuthApp = manager.getProxiedFoundryAuthApp(authAppName);
      return foundryAuthApp.firestore();
    })
    .when('functions', (app) => (region?: string) => {
      manager.importFunctions();
      const developerAppName = app.name;
      const authAppName = manager.foundryAuthAppNamePrefix + developerAppName;
      const foundryAuthApp = manager.getProxiedFoundryAuthApp(authAppName);
      return foundryAuthApp.functions(region);
    })
    .finalize();
}
