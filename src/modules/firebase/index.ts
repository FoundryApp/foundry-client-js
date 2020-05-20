import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/functions';

import { Proxied } from '../../proxy';
import { proxyApp as proxyDeveloperApp } from './proxiedDeveloperApp';

import { proxyApp as proxyFoundryAuthApp } from './proxiedFoundryAuthApp';

import * as manager from './manager';
import { FoundryEnvDevAPI } from '../../api';

// TODO: Handle when user is signing up/signing in with 3rd party providers (Twitter, Facebook, etc)
// because user has its own email there. Should we pre}fix it?

// TODO: Firebase probably has to be proxied for both production and dev
// because we have to change things in config in the dev mode
// Specifically, the 'databaseURL' field


// TODO: This is dynamically injected by runtime
const ___FOUNDRY_OWNER_ENV_DEV_API_KEY___ = '';
const foundryEnvDevAPI = new FoundryEnvDevAPI(___FOUNDRY_OWNER_ENV_DEV_API_KEY___);

function createFoundryAuthApp(
  name: string,
  developerAppConfig: any,
  developerAppName: string,
) {
  const foundryAuthconfig = {
    apiKey: 'AIzaSyAVGHbPUV10gw2sfAhO0rKeosRGRVzWF2c',
    authDomain: 'foundry-auth-56125.firebaseapp.com',
    // databaseURL: 'https://foundry-auth-56125.firebaseio.com',
    // projectId: 'foundry-auth-56125',
    projectId: developerAppConfig.projectId,
    // storageBucket: 'foundry-auth-56125.appspot.com',
    // messagingSenderId: '754118299690',
    // appId: '1:754118299690:web:c3f8939bb2bfcf04847353',
    // measurementId: 'G-FTE7202N6R',
    databaseURL: developerAppConfig.databaseURL,
  };
  const foundryAuthApp = firebase.initializeApp(foundryAuthconfig, name);

  return proxyFoundryAuthApp(foundryAuthApp, developerAppConfig, developerAppName, foundryEnvDevAPI);
}

export function getProxiedFirebase() {
  return new Proxied<typeof firebase>(firebase)
    .when('initializeApp', (fb) => (options: Object, name?: string) => {
      const projectId = (options as any).projectId;
      const app = fb.initializeApp(options, name);
      const proxied = proxyDeveloperApp(app);

      // We set the emulator URLs (Firestore, RTDB, Functions) for Foundry Auth app
      // and not for the actual developer's app. That's because Firestore, RTDB,
      // and Functions requests must be done from the same app where is the
      // currentUser signed in. Otherwise, things like authorization headers in
      // callable Functions or Firestore rules where user checks for 'auth' won't work.
      let emulatorDatabaseURL: string | undefined;
      if ((options as any).databaseURL) {
        emulatorDatabaseURL = 'http://localhost:9000?ns=' + projectId;
      }
      const authAppName = manager.foundryAuthAppNamePrefix + app.name;
      const authApp = createFoundryAuthApp(authAppName, options, app.name);

      authApp.firestore().settings({
        host: 'localhost:8080',
        ssl: false,
      });
      // TODO:
      authApp.functions().useFunctionsEmulator('https://localhost:8000/functions/' + projectId);

      manager.addProxiedFoundryAuthApp(authAppName, authApp);
      manager.addProxiedDeveloperApp(app.name, proxied);
      return proxied;
    })
    .when('app', () => (name?: string) => {
      return manager.getProxiedDeveloperApp(name || '[DEFAULT]');
    })
    .when('apps', () => {
      return manager.getProxiedDeveloperApps();
    })
    .when('auth', (fb) => (app?: firebase.app.App) => {
      // Return auth of the Foundry Auth app that
      // is associated with the developer's app

      // If app is undefined get the default app
      const developerAppName = app ? app.name : fb.app().name;

      const authAppName = manager.foundryAuthAppNamePrefix + developerAppName;
      const foundryAuthApp = manager.getProxiedFoundryAuthApp(authAppName);

      return foundryAuthApp.auth();

      // TODO: Should we return Foundry Auth app or developer's proxied app?

      // const authAppName = manager.foundryAuthAppNamePrefix + (app ? app.name : '[DEFAULT]');
      // const authApp = manager.getProxiedDeveloperApp(authAppName);
      // return authApp.auth();
    })
    .when('database', (fb) => (app?: firebase.app.App) => {
      const developerAppName = app ? app.name : fb.app().name;

      const authAppName = manager.foundryAuthAppNamePrefix + developerAppName;
      const foundryAuthApp = manager.getProxiedFoundryAuthApp(authAppName);
      return foundryAuthApp.database();
    })
    .when('firestore', (fb) => (app?: firebase.app.App) => {
      const developerAppName = app ? app.name : fb.app().name;

      const authAppName = manager.foundryAuthAppNamePrefix + developerAppName;
      const foundryAuthApp = manager.getProxiedFoundryAuthApp(authAppName);
      return foundryAuthApp.firestore();
    })
    .when('functions', (fb) => (app?: firebase.app.App) => {
      const developerAppName = app ? app.name : fb.app().name;

      const authAppName = manager.foundryAuthAppNamePrefix + developerAppName;
      const foundryAuthApp = manager.getProxiedFoundryAuthApp(authAppName);
      return foundryAuthApp.functions();
    })
    // Remove currently unsupported modules from Firebase:
    // TODO: Maybe left the following modules accessible?
    // Have to investigate how they are used
    .when('analytics', () => undefined)
    .when('database', () => undefined)
    .when('messaging', () => undefined)
    .when('performance', () => undefined)
    .when('remoteConfig', () => undefined)
    .when('storage', () => undefined)
    .when('installations', () => undefined)
    .finalize();
}

export function __overrideEnvDevAPIKey(k: string) {
  foundryEnvDevAPI.__overrideAPIKey(k);
}
