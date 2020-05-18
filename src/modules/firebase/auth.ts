import firebase from 'firebase/app';
import 'firebase/auth';

import { Proxied } from '../../proxy';
import { FoundryEnvDevAPI } from '../../api';
import * as runtime from './runtime';

import { getProxiedApp } from './manager';

const foundryAuthSeparator = '$_foundry_$';

export function proxyAuth(appAuth: firebase.auth.Auth, foundryEnvDevAPI: FoundryEnvDevAPI) {
  return new Proxied<firebase.auth.Auth>(appAuth)
    .when('app', () => {
      // If we are proxy-ing auth the app had to be already proxied
      // The reason for this is that the 'app' property on the
      // firebase.auth.Auth object is a reference to the app that
      // already had to be initialized.

      // So it must saved it in the manager
      return getProxiedApp(appAuth.app.name);
    })
    .when('currentUser', (auth) => {
      if (auth.currentUser) {
        return new Proxied<firebase.User>(auth.currentUser)
          // TODO: Check for arr length when spliting?
          .when('email', (user) => user.email ? user.email.split(foundryAuthSeparator)[1] : null)
          .when('uid', (user) => user.uid.split(foundryAuthSeparator)[1])
          .finalize();
      }
      return null;
    })
    .when('createUserWithEmailAndPassword', (auth) => async (email: string, password: string) => {
      // Call our own API endpoint so we create a user in Firebase Auth project with custom UID
      // This can't be done with the client Firebase SDK
      const { userId: proxiedUserId }: { userId: string } = await foundryEnvDevAPI.createUser(email, password);

      const owner = await foundryEnvDevAPI.getEnvOwner();
      const prefixedEmail = owner.uid + foundryAuthSeparator + email;
      const userCredentials = await auth.signInWithEmailAndPassword(prefixedEmail, password);

      const unprefixedUserId = proxiedUserId.split(foundryAuthSeparator)[1];

      await runtime.createUser(owner.uid, unprefixedUserId);

      return new Proxied<firebase.auth.UserCredential>(userCredentials)
        .when('user', (credentials) => {
          if (credentials.user) {
            return new Proxied<firebase.User>(credentials.user)
              .when('email', () => email)
              .when('uid', () => unprefixedUserId)
              .finalize();
          }
          return null;
        })
        .finalize();
    })
    .when('signInWithEmailAndPassword', (auth) => async (email: string, password: string) => {
      const owner = await foundryEnvDevAPI.getEnvOwner();
      const prefixedEmail = `${owner.uid}${foundryAuthSeparator}${email}`;

      const userCredentials = await auth.signInWithEmailAndPassword(prefixedEmail, password);

      return new Proxied<firebase.auth.UserCredential>(userCredentials)
        .when('user', (credentials) => {
          if (credentials.user) {
            return new Proxied<firebase.User>(credentials.user)
              .when('email', () => email)
              .when('uid', (user) => user.uid.split(foundryAuthSeparator)[1])
              .finalize();
          }
          return null;
        })
        .finalize();
    })
    .finalize();
}
