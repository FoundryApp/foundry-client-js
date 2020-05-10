import fb from 'firebase/app';

import * as firebaseAuth from './api/firebase/auth';
import * as firebaseFirestore from './api/firebase/firestore';
import * as firebaseFunctions from './api/firebase/functions';

interface FirebaseConfig {
  options: object; // TODO: Make this explicit?
  name?: string;
}

export interface FoundryConfig {
  firebase: FirebaseConfig;
}

function initialize(config: FoundryConfig) {
  fb.initializeApp(config.firebase.options, config.firebase.name);
  fb.functions();
}

const foundry = {
  initialize,
  firebase: {
    ...fb,
    analytics: undefined,
    database: undefined,
    installations: undefined,
    messaging: undefined,
    performance: undefined,
    remoteconfig: undefined,
    storage: undefined,
    auth: firebaseAuth,
    firestore: firebaseFirestore,
    function: firebaseFunctions,
  }
};

export default foundry;
