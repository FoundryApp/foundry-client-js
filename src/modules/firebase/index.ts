import firebase from 'firebase/app';
import { Proxied } from '../../proxy';
import { proxyApp } from './app';
import { proxyAuth } from './auth';

import { FoundryEnvDevAPI } from '../../api';

import { addProxiedApp, getProxiedApp, getProxiedApps } from './manager';

// TODO: Must also proxy firestore.app, database.app

// TODO: Handle when user is signing up/signing in with 3rd party providers (Twitter, Facebook, etc)
// because user has its own email there. Should we pre}fix it?


// TODO: This is dynamically injected by runtime
const ___FOUNDRY_OWNER_ENV_DEV_API_KEY___ = '';
const foundryEnvDevAPI = new FoundryEnvDevAPI(___FOUNDRY_OWNER_ENV_DEV_API_KEY___);

export const proxiedFirebase = new Proxied<typeof firebase>(firebase)
  .when('initializeApp', (fb) => (options: object, name?: string) => {
    // TODO: Should we forbid user initializing app when in dev env?
    const app = fb.initializeApp(options, name);
    console.log('initializeApp', app.name);
    const proxied = proxyApp(app, foundryEnvDevAPI);
    addProxiedApp(app.name, proxied);
    return proxied;
  })
  .when('app', () => (name?: string) => {
    return getProxiedApp(name || '[DEFAULT]');
  })
  .when('apps', () => {
    return getProxiedApps();
  })
  .when('auth', (fb) => (app?: firebase.app.App) => {
    // If app is undefined get the default app
    return proxyAuth(app ? app.auth() : fb.auth(), foundryEnvDevAPI);
  })
  // Remove currently unsupported modules from Firebase:
  // TODO: DON'T PROXY FIREBASE WHEN initializeProd was called!!!
  .when('analytics', () => undefined)
  .when('database', () => undefined)
  .when('messaging', () => undefined)
  .when('performance', () => undefined)
  .when('remoteConfig', () => undefined)
  .when('storage', () => undefined)
  .when('installations', () => undefined)
  .finalize();

export function __overrideEnvDevAPIKey(k: string) {
  foundryEnvDevAPI.__overrideAPIKey(k);
}

