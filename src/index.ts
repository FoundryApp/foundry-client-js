import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/functions';

import * as runtime from './api/firebase/runtime';

// import * as authApi from './api/firebase/auth';
// import * as firestoreApi from './api/firebase/firestore';
// import * as functionsApi from './api/firebase/functions';

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
  // TODO: DON'T DO THIS WHEN initializeProd was called!!!
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
      try {
        // First do auth against Foundry Runtime Auth

        const foundryApp = firebase.app(foundryAppName);
        foundryApp.;

        const runtimeEmail = `${uid}_${email}`;
        await runtime.createUser(runtimeEmail, email, password);
        return auth.createUserWithEmailAndPassword(email, password);
      } catch (err) {
        throw err;
      }

    })
    .when('signInWithEmailAndPassword', (auth) => (email: string, password: string) => {
      // TODO: Communicate with firebase-runtime
      return auth.signInWithEmailAndPassword(email, password);
    })
    .finalize();
}

function initializeProd(config: FoundryConfig) {
  proxiedFirebase.initializeApp(config.firebase.options, config.firebase.name);
}

function initializeDev() {
  // In the dev mode, Firebase is configured to connect to our Auth project
  const foundryAuthconfig = {
    apiKey: 'AIzaSyA9iGvgpbusMPnC2Ef6KKDnh9gQM0Pocfg',
    authDomain: 'foundry-runtime-auth.firebaseapp.com',
    databaseURL: 'https://foundry-runtime-auth.firebaseio.com',
    projectId: 'foundry-runtime-auth',
    storageBucket: 'foundry-runtime-auth.appspot.com',
    messagingSenderId: '527246454155',
    appId: '1:527246454155:web:d9cf9dd2d3bdb0c22a938e',
    measurementId: 'G-GZ44BGRWL7',
  };
  const foundryAuthApp = proxiedFirebase.initializeApp(foundryAuthconfig);

  foundryAuthApp.firestore().settings({
    // TODO
    host: 'localhost:8443',
    ssl: false,
  });

  // TODO
  foundryAuthApp.functions().useFunctionsEmulator('https://foundryapp.co/functions');

  // TODO: THIS must be done through our backend
  // because if we were using client SDK for this
  // user would have to actually sign in!!!!
  // Also initialize Firebase app for Foundry
  const foundryAppConfig = {
    apiKey: 'AIzaSyAqL--IsyZd3cQTUgXR3KRWZZN-M6jR1kE',
    authDomain: 'foundryapp.firebaseapp.com',
    databaseURL: 'https://foundryapp.firebaseio.com',
    projectId: 'foundryapp',
    storageBucket: 'foundryapp.appspot.com',
    messagingSenderId: '103053412875',
    appId: '1:103053412875:web:d6720b66501102a45e550e',
  };
  proxiedFirebase.initializeApp(foundryAppConfig, foundryAppName);
}

const foundry = {
  initializeProd,
  initializeDev,
  firebase: proxiedFirebase,
};

export default foundry;
