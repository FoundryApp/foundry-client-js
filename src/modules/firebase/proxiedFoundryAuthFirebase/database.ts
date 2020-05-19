import firebase from 'firebase/app';
import { Proxied } from '../../../proxy';
import * as manager from '../manager';

export function proxyDatabase(appDatabase: firebase.database.Database) {
  return new Proxied<firebase.database.Database>(appDatabase)
    .when('app', (database) => {
      const foundryAuthAppName = database.app.name;
      const developerAppName = foundryAuthAppName.split(manager.foundryAuthAppNamePrefix)[1];
      return manager.getProxiedDeveloperApp(developerAppName);
    })
    .finalize();
}