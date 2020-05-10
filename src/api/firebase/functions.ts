import firebase from 'firebase/app';
import 'firebase/functions';

export function initializeFunctions() {
  // TODO:
  firebase.functions().useFunctionsEmulator('https://foundryapp.co/functions');
}