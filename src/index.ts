import firebase from 'firebase/app';

// import * as authApi from './api/firebase/auth';
import * as firestoreApi from './api/firebase/firestore';
import * as functionsApi from './api/firebase/functions';

interface FirebaseConfig {
  options: object; // TODO: Make this explicit?
  name?: string;
}

export interface FoundryConfig {
  firebase: FirebaseConfig;
}

function initialize(config: FoundryConfig) {
  firebase.initializeApp(config.firebase.options, config.firebase.name);
  firebase.firestore().settings({
    // TODO
    host: 'https://foundryapp.co/firestores',
  });
  // TODO
  firebase.functions().useFunctionsEmulator('https://foundryapp.co/functions');
}

const foundryFirebase = {
  ...firebase,
  firestore: firestoreApi.firestore,
  functions: functionsApi.functions,
  // auth: firebaseAuth,
};

delete foundryFirebase.analytics;
delete foundryFirebase.database;
// delete foundryFirebase.installations; TODO: ???
delete foundryFirebase.messaging;
delete foundryFirebase.performance;
delete foundryFirebase.remoteConfig;
delete foundryFirebase.storage;

const foundry = {
  initialize,
  firebase: foundryFirebase,
};

export default foundry;
