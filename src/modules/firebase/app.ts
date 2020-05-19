import firebase from 'firebase/app';

import { Proxied } from '../../proxy';
import { FoundryEnvDevAPI } from '../../api';

// import { proxyAuth } from './auth';

// TODO: PROXY APP
export function proxyApp(fbApp: firebase.app.App, foundryEnvDevAPI: FoundryEnvDevAPI) {
  return new Proxied<firebase.app.App>(fbApp)
    // .when('auth', (fb) => (app?: firebase.app.App) => {
    //   // Return auth of the Foundry Auth app that
    //   // is associated with the developer's app


    //   // If app is undefined get the default app
    //   const developerAppName = app ? app.name : fb.app().name;
    //   console.log('developerAppName', developerAppName);

    //   const authAppName = manager.foundryAuthAppNamePrefix + developerAppName;
    //   const foundryAuthApp = manager.getProxiedFoundryAuthApp(authAppName);
    //   return foundryAuthApp.auth();

    //   // TODO: Should we return Foundry Auth app or developer's proxied app?

    //   // const authAppName = manager.foundryAuthAppNamePrefix + (app ? app.name : '[DEFAULT]');
    //   // const authApp = manager.getProxiedDeveloperApp(authAppName);
    //   // return authApp.auth();
    // })

    //   // return proxyAuth(app.auth(), foundryEnvDevAPI);
    // })
    // .when('database', (fb) => (app?: firebase.app.App) => {
    //   const developerAppName = app ? app.name : fb.app().name;

    //   const authAppName = manager.foundryAuthAppNamePrefix + developerAppName;
    //   const foundryAuthApp = manager.getProxiedFoundryAuthApp(authAppName);
    //   return foundryAuthApp.database();
    // })
    // .when('firestore', (fb) => (app?: firebase.app.App) => {
    //   const developerAppName = app ? app.name : fb.app().name;

    //   const authAppName = manager.foundryAuthAppNamePrefix + developerAppName;
    //   const foundryAuthApp = manager.getProxiedFoundryAuthApp(authAppName);
    //   return foundryAuthApp.firestore();
    // })
    // .when('functions', (fb) => (app?: firebase.app.App) => {
    //   const developerAppName = app ? app.name : fb.app().name;

    //   const authAppName = manager.foundryAuthAppNamePrefix + developerAppName;
    //   const foundryAuthApp = manager.getProxiedFoundryAuthApp(authAppName);
    //   return foundryAuthApp.functions();
    // })
    .finalize();
}
