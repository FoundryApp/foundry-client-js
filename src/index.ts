import originalFirebase from 'firebase/app';
// import 'firebase/auth';
// import 'firebase/firestore';
// import 'firebase/functions';

import * as proxiedFb from './modules/firebase';


interface FirebaseConfig {
  options: object; // TODO: Make this explicit?
  name?: string;
}

export interface FoundryConfig {
  firebase: FirebaseConfig;
}

// function initializeProd(config: FoundryConfig) {
//   // TODO: Initialize regular (non-proxied) Firebase here?
//   return proxiedFb.originalFirebase.initializeApp(config.firebase.options, config.firebase.name);
// }

// function startDevMode() {
//   // TODO: What if user wants to have multiple firebase apps?

//   // In the dev mode, Firebase is configured to connect to our Auth project
//   const foundryAuthconfig = {
//     apiKey: 'AIzaSyAVGHbPUV10gw2sfAhO0rKeosRGRVzWF2c',
//     authDomain: 'foundry-auth-56125.firebaseapp.com',
//     databaseURL: 'https://foundry-auth-56125.firebaseio.com',
//     projectId: 'foundry-auth-56125',
//     storageBucket: 'foundry-auth-56125.appspot.com',
//     messagingSenderId: '754118299690',
//     appId: '1:754118299690:web:c3f8939bb2bfcf04847353',
//     measurementId: 'G-FTE7202N6R',
//   };

//   const foundryAuthApp = proxiedFb.getProxiedFirebase().initializeApp(foundryAuthconfig);

//   // TODO: Have a global env that is dynamically injected by runtime
//   // This env tells me that this SDK is being execuced inside the pod
//   // Because there are 2 options how user can use this SDK
//   // - running it locally from the user's computer without explicit active Foundry session
//   // - having an explicit active Foundry session (e.g.: $ foundry go) - this means that the
//   // the webapp is hosted on our server next to runtime
//   // const url = __ENV__ ? 'localhost:8000' : 'https://some-id.dev.foundryapp.co/'

//   foundryAuthApp.firestore().settings({
//     // TODO
//     host: 'localhost:8080',
//     ssl: false,
//   });

//   // TODO
//   foundryAuthApp.functions().useFunctionsEmulator('http://localhost:8000/functions');
// }


const IS_PRODUCTION = false;
export const firebase = IS_PRODUCTION ? originalFirebase : proxiedFb.getProxiedFirebase();

export const __overrideEnvDevAPIKey = proxiedFb.__overrideEnvDevAPIKey;
// export {
//   startDevMode,
// };
