import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/functions';

import * as api from './api';

import * as runtime from './modules/firebase/runtime';

import { Proxied } from './proxy';

// const foundryRuntimeAuthApp = '__FOUNDRY__-foundry-runtime-auth';
const foundryAppName = '__FOUNDRY__';

interface FirebaseConfig {
  options: object; // TODO: Make this explicit?
  name?: string;
}

export interface FoundryConfig {
  firebase: FirebaseConfig;
}

// TODO: Must also proxy firestore.app, database.app


const proxiedFirebase = new Proxied<typeof firebase>(firebase)
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
  .when('auth', (fb) => (app?: firebase.app.App) => {
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

function proxyFBApp(fbApp: firebase.app.App) {
  return new Proxied<firebase.app.App>(fbApp)
    .when('auth', (app) => () => {
      return proxyFBAppAuth(app.auth());
    })
    .finalize();
}

function proxyFBAppAuth(appAuth: firebase.auth.Auth) {
  return new Proxied<firebase.auth.Auth>(appAuth)
    .when('app', () => proxyFBApp(appAuth.app))
    .when('createUserWithEmailAndPassword', (auth) => async (email: string, password: string) => {
      // TODO: Check email and password?

      // 1. Call our own API endpoint so we create a user in Firebase Auth project with custom UID
      // This can't be done with the client Firebase SDK
      const { userId: proxiedUserId }: { userId: string } = await api.createUser(email, password);

      // 2. Sign in here with auth.signInWithEmailAndPassword
      const owner = await api.getEnvOwner();
      const userCredentials = await auth.signInWithEmailAndPassword(`${owner.uid}_${email}`, password);

      const unproxiedUserId = proxiedUserId.split('_')[1];

      await runtime.createUser(owner.uid, unproxiedUserId);

      return new Proxied<firebase.auth.UserCredential>(userCredentials)
        .when('user', (credentials) => {
          if (credentials.user) {
            return new Proxied<firebase.User>(credentials.user)
              .when('email', () => email)
              .when('uid', () => unproxiedUserId)
              .finalize();
          }
          return null;
        })
        .finalize();
    })
    .when('signInWithEmailAndPassword', (auth) => async (email: string, password: string) => {
      const owner = await api.getEnvOwner();
      const proxiedEmail = `${owner.uid}_${email}`;

      const userCredentials = await auth.signInWithEmailAndPassword(proxiedEmail, password);

      return new Proxied<firebase.auth.UserCredential>(userCredentials)
        .when('user', (credentials) => {
          if (credentials.user) {
            return new Proxied<firebase.User>(credentials.user)
              .when('email', () => email)
              .when('uid', (user) => user.uid.split('_')[1])
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

const foundry = {
  initializeProd,
  initializeDev,
  firebase: proxiedFirebase,
};

export default foundry;
