import foundry from './index';

foundry.initialize({
  firebase: {
    options: { /* TODO: Firebase config */ },
  },
});

const { firebase } = foundry;
firebase.firestore.initializeFirestore();


