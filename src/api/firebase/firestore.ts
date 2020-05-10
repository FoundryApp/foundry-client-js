import firebase from 'firebase/app';
import 'firebase/firestore';

export function initializeFirestore() {
  firebase.firestore().settings({
    // TODO
    host: 'https://foundryapp.co/firestores',
  });
}