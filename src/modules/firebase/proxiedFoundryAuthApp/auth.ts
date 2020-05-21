import { Proxied } from '../../../proxy';
import { FoundryEnvDevAPI } from '../../../api';
import * as runtime from '../runtime';

// import { getProxiedApp, foundryAuthSeparator } from './manager';
import * as manager from '../manager';

import { proxyUser } from './user';

// TODO: Check if other functions like resetting password must be proxied

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
      const { userID: prefixedUserID }: { userID: string } = await foundryEnvDevAPI.createUser(email, password, developerAppProjectID);

      const owner = await foundryEnvDevAPI.getEnvOwner();
      const prefixedEmail = manager.prefixEmail(owner, developerAppProjectID, email);
      const userCredentials = await auth.signInWithEmailAndPassword(prefixedEmail, password);

      const unprefixedUserID = manager.unprefixUserID(prefixedUserID);
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

      const prefixedEmail = manager.prefixEmail(owner, developerAppProjectID, email);

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
