import firebase from 'firebase/app';
import { Proxied } from '../../../proxy';
import * as manager from '../manager';

export function proxyFirestore(appFirestore: firebase.firestore.Firestore) {
  return new Proxied<firebase.firestore.Firestore>(appFirestore)
    .when('app', (firestore) => {
      const foundryAuthAppName = firestore.app.name;
      const developerAppName = foundryAuthAppName.split(manager.foundryAuthAppNamePrefix)[1];
      return manager.getProxiedDeveloperApp(developerAppName);
    })
    .finalize();
}