import originalFirebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/functions';

import { FoundryEnvDevAPI } from './api';

import * as runtime from './modules/firebase/runtime';

import { Proxied } from './proxy';

// TODO: This is dynamically injected by runtime
const ___FOUNDRY_OWNER_ENV_DEV_API_KEY___ = '';
const foundryEnvDevAPI = new FoundryEnvDevAPI(___FOUNDRY_OWNER_ENV_DEV_API_KEY___);

const foundryAuthSeparator = '$_foundry_$';

interface FirebaseConfig {
  options: object; // TODO: Make this explicit?
  name?: string;
}

export interface FoundryConfig {
  firebase: FirebaseConfig;
}

// TODO: Must also proxy firestore.app, database.app


const proxiedFirebase = new Proxied<typeof originalFirebase>(originalFirebase)
  .when('initializeApp', (fb) => (options: Object, name?: string) => {
    // TODO: Should we forbid user initializing app when in dev env?
    const app = fb.initializeApp(options, name);
    return proxyFBApp(app);
  })
  .when('app', (fb) => (name?: string) => {
    const app = fb.app(name);
    return proxyFBApp(app);
  })
  .when('apps', (fb) => {
    return fb.apps.map(a => proxyFBApp(a));
  })
  .when('auth', (fb) => (app?: originalFirebase.app.App) => {
    if (app) {
      return proxyFBAppAuth(app.auth());
    }
    // If app is undefined get the default app
    return proxyFBAppAuth(fb.auth());
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

function proxyFBApp(fbApp: originalFirebase.app.App) {
  return new Proxied<originalFirebase.app.App>(fbApp)
    .when('auth', (app) => () => {
      return proxyFBAppAuth(app.auth());
    })
    .finalize();
}

// TODO: Proxy methods for changing user email


// TODO: Use a single method for proxy-ing user
function proxyFBUser(fbUser: originalFirebase.User) {
  return new Proxied<originalFirebase.User>(fbUser)
    // TODO: Check for arr length when spliting?
    .when('email', (user) => user.email ? user.email.split(foundryAuthSeparator)[1] : null)
    .when('uid', (user) => user.uid.split(foundryAuthSeparator)[1])
    .when('updateEmail', (user) => (newEmail: string) => {
      // TODO
    })
    .when('verifyBeforeUpdateEmail', (user) => (newEmail: string, actionCodeSettings?: originalFirebase.auth.ActionCodeSettings | null) => {
      // TODO
    })
    .when('toJSON', (user) => () => {
      // TODO
    })
    .when('delete', (user) => () => {
      // TODO?
    })
    .finalize();
}

function proxyFBAppAuth(appAuth: originalFirebase.auth.Auth) {
  return new Proxied<originalFirebase.auth.Auth>(appAuth)
    .when('app', () => proxyFBApp(appAuth.app))
    .when('currentUser', (auth) => {
      if (auth.currentUser) {
        return new Proxied<originalFirebase.User>(auth.currentUser)
          // TODO: Check for arr length when spliting?
          .when('email', (user) => user.email ? user.email.split(foundryAuthSeparator)[1] : null)
          .when('uid', (user) => user.uid.split(foundryAuthSeparator)[1])
          .finalize();
      }
      return null;
    })
    .when('createUserWithEmailAndPassword', (auth) => async (email: string, password: string) => {
      // Call our own API endpoint so we create a user in Firebase Auth project with custom UID
      // This can't be done with the client Firebase SDK
      const { userId: proxiedUserId }: { userId: string } = await foundryEnvDevAPI.createUser(email, password);

      const owner = await foundryEnvDevAPI.getEnvOwner();
      const prefixedEmail = owner.uid + foundryAuthSeparator + email;
      const userCredentials = await auth.signInWithEmailAndPassword(prefixedEmail, password);

      const unprefixedUserId = proxiedUserId.split(foundryAuthSeparator)[1];

      await runtime.createUser(owner.uid, unprefixedUserId);

      return new Proxied<originalFirebase.auth.UserCredential>(userCredentials)
        .when('user', (credentials) => {
          if (credentials.user) {
            return new Proxied<originalFirebase.User>(credentials.user)
              .when('email', () => email)
              .when('uid', () => unprefixedUserId)
              .finalize();
          }
          return null;
        })
        .finalize();
    })
    .when('signInWithEmailAndPassword', (auth) => async (email: string, password: string) => {
      const owner = await foundryEnvDevAPI.getEnvOwner();
      const prefixedEmail = `${owner.uid}${foundryAuthSeparator}${email}`;

      const userCredentials = await auth.signInWithEmailAndPassword(prefixedEmail, password);

      return new Proxied<originalFirebase.auth.UserCredential>(userCredentials)
        .when('user', (credentials) => {
          if (credentials.user) {
            return new Proxied<originalFirebase.User>(credentials.user)
              .when('email', () => email)
              .when('uid', (user) => user.uid.split(foundryAuthSeparator)[1])
              .finalize();
          }
          return null;
        })
        .finalize();
    })
    .finalize();
}

function initializeProd(config: FoundryConfig) {
  proxiedFirebase.initializeApp(config.firebase.options, config.firebase.name);
}

async function initializeDev() {
  // In the dev mode, Firebase is configured to connect to our Auth project
  const foundryAuthconfig = {
    apiKey: 'AIzaSyAVGHbPUV10gw2sfAhO0rKeosRGRVzWF2c',
    authDomain: 'foundry-auth-56125.firebaseapp.com',
    databaseURL: 'https://foundry-auth-56125.firebaseio.com',
    projectId: 'foundry-auth-56125',
    storageBucket: 'foundry-auth-56125.appspot.com',
    messagingSenderId: '754118299690',
    appId: '1:754118299690:web:c3f8939bb2bfcf04847353',
    measurementId: 'G-FTE7202N6R',
  };
  const foundryAuthApp = proxiedFirebase.initializeApp(foundryAuthconfig);

  // TODO: Have a global env that is dynamically injected by runtime
  // This env tells me that this SDK is being execuced inside the pod
  // Because there are 2 options how user can use this SDK
  // - running it locally from the user's computer without explicit active Foundry session
  // - having an explicit active Foundry session (e.g.: $ foundry go) - this means that the
  // the webapp is hosted on our server next to runtime
  // const url = __ENV__ ? 'localhost:8000' : 'https://some-id.dev.foundryapp.co/'

  foundryAuthApp.firestore().settings({
    // TODO
    host: 'localhost:8080',
    ssl: false,
  });

  // TODO
  foundryAuthApp.functions().useFunctionsEmulator('localhost:8000/functions');
}

function __overrideEnvDevAPIKey(k: string) {
  foundryEnvDevAPI.__overrideAPIKey(k);
}

export const firebase = proxiedFirebase;
export {
  initializeProd,
  initializeDev,
  __overrideEnvDevAPIKey,
};

