import firebase from 'firebase/app';
import 'firebase/firestore';

export async function getFoundryUser(foundryConfig: string) {
  const foundryApp = firebase.app(/* TODO: App name */);
  const userDoc = await foundryApp.firestore().doc('').get();
}
