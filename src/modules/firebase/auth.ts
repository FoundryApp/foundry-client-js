import firebase from 'firebase/app';
import 'firebase/auth';

export function createUserWithEmailAndPassword(email: string, password: string) {
  console.log('HELLO AUTH!');
  firebase.auth();
}

function signInWithEmailAndPassword(email: string, password: string) {

}

// const auth = {
//   ...firebase.auth,
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword
// }

// (firebase.auth().createUserWithEmailAndPassword as any) = createUserWithEmailAndPassword;
export const auth = firebase.auth;

