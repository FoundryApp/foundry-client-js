import firebase from 'firebase/app';

import { Proxied } from '../../../proxy';
import { FoundryEnvDevAPI } from '../../../api';
import * as runtime from '../runtime';

// import { getProxiedApp, foundryAuthSeparator } from './manager';
import * as manager from '../manager';

import { proxyUser } from './user';

export function proxyAuth(appAuth: firebase.auth.Auth, developerAppProjectID: string, foundryEnvDevAPI: FoundryEnvDevAPI) {
  return new Proxied<firebase.auth.Auth>(appAuth)
    .when('app', (auth) => {
      // Here we want to return the developer's firebase app
      // not our Foundry Auth app

      // Foundry Auth apps have name in the following format:
      // manager.foundryAuthAppNamePrefix + <name of the developer's app>
      const foundryAuthAppName = auth.app.name;
      const developerAppName = foundryAuthAppName.split(manager.foundryAuthAppNamePrefix)[1];

      return manager.getProxiedDeveloperApp(developerAppName);
    })
    .when('currentUser', (auth) => {
      if (auth.currentUser) {
        return proxyUser(auth.currentUser);
      }
      return null;
    })
    .when('createUserWithEmailAndPassword', (auth) => async (email: string, password: string) => {
      // uid = <developerID>-<firebaseProjectID>$_foundry_$<random user id>
      // uid is set on server through the Admin SDK
      // email = <developerID>-<firebaseProjectID>$_foundry_$<email>
      const { userID: prefixedUserID }: { userID: string } = await foundryEnvDevAPI.createUser(email, password, developerAppProjectID);

      const owner = await foundryEnvDevAPI.getEnvOwner();
      const prefixedEmail = owner.uid + '-' + developerAppProjectID + manager.foundryAuthSeparator + email;
      const userCredentials = await auth.signInWithEmailAndPassword(prefixedEmail, password);

      const unprefixedUserID = prefixedUserID.split(manager.foundryAuthSeparator)[1];
      await runtime.createUser(owner.uid, developerAppProjectID, unprefixedUserID);

      return new Proxied<firebase.auth.UserCredential>(userCredentials)
        .when('user', (credentials) => {
          if (credentials.user) {
            return proxyUser(credentials.user);
          }
          return null;
        })
        .finalize();
    })
    .when('signInWithEmailAndPassword', (auth) => async (email: string, password: string) => {
      const owner = await foundryEnvDevAPI.getEnvOwner();
      // email = <developerID>-<firebaseProjectID>$_foundry_$<email>
      const prefixedEmail = owner.uid + '-' + developerAppProjectID + manager.foundryAuthSeparator + email;

      const userCredentials = await auth.signInWithEmailAndPassword(prefixedEmail, password);

      return new Proxied<firebase.auth.UserCredential>(userCredentials)
        .when('user', (credentials) => {
          if (credentials.user) {
            return proxyUser(credentials.user);
          }
          return null;
        })
        .finalize();
    })
    .finalize();
}

//////////////////////////////

// export function proxyAuth2(appAuth: firebase.auth.Auth, foundryEnvDevAPI: FoundryEnvDevAPI) {
//   return new Proxied<firebase.auth.Auth>(appAuth)
//     .when('app', () => {
//       // If we are proxy-ing auth the app had to be already proxied
//       // The reason for this is that the 'app' property on the
//       // firebase.auth.Auth object is a reference to the app that
//       // already had to be initialized.

//       // So it must saved it in the manager
//       return manager.getProxiedDeveloperApp(appAuth.app.name);
//     })
//     .when('currentUser', (auth) => {
//       if (auth.currentUser) {
//         return new Proxied<firebase.User>(auth.currentUser)
//           // TODO: Check for arr length when spliting?
//           .when('email', (user) => user.email ? user.email.split(manager.foundryAuthSeparator)[1] : null)
//           .when('uid', (user) => user.uid.split(manager.foundryAuthSeparator)[1])
//           .finalize();
//       }
//       return null;
//     })
//     .when('createUserWithEmailAndPassword', (auth) => async (email: string, password: string) => {
//       // TODO: create user through our Foundry Auth App

//       // Call our own API endpoint so we create a user in Firebase Auth project with custom UID
//       // This can't be done with the client Firebase SDK
//       const { userId: proxiedUserId }: { userId: string } = await foundryEnvDevAPI.createUser(email, password);

//       const owner = await foundryEnvDevAPI.getEnvOwner();
//       const prefixedEmail = owner.uid + manager.foundryAuthSeparator + email;
//       const userCredentials = await auth.signInWithEmailAndPassword(prefixedEmail, password);

//       const unprefixedUserId = proxiedUserId.split(manager.foundryAuthSeparator)[1];

//       await runtime.createUser(owner.uid, unprefixedUserId);

//       return new Proxied<firebase.auth.UserCredential>(userCredentials)
//         .when('user', (credentials) => {
//           if (credentials.user) {
//             return new Proxied<firebase.User>(credentials.user)
//               .when('email', () => email)
//               .when('uid', () => unprefixedUserId)
//               .finalize();
//           }
//           return null;
//         })
//         .finalize();
//     })
//     .when('signInWithEmailAndPassword', (auth) => async (email: string, password: string) => {
//       const owner = await foundryEnvDevAPI.getEnvOwner();
//       const prefixedEmail = `${owner.uid}${manager.foundryAuthSeparator}${email}`;

//       const userCredentials = await auth.signInWithEmailAndPassword(prefixedEmail, password);

//       return new Proxied<firebase.auth.UserCredential>(userCredentials)
//         .when('user', (credentials) => {
//           if (credentials.user) {
//             return new Proxied<firebase.User>(credentials.user)
//               .when('email', () => email)
//               .when('uid', (user) => user.uid.split(manager.foundryAuthSeparator)[1])
//               .finalize();
//           }
//           return null;
//         })
//         .finalize();
//     })
//     .finalize();
// }
