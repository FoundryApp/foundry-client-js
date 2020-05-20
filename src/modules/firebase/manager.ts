import firebase from 'firebase/app';

export const foundryAuthAppNamePrefix = '$_FOUNDRY_AUTH_APP_$';
export const foundryAuthSeparator = '$_foundry_$';

const developerApps: { [name: string]: firebase.app.App } = {};

const foundryAuthApps: { [name: string]: firebase.app.App } = {};

export function getProxiedDeveloperApps() {
  const arr: firebase.app.App[] = [];
  Object.keys(developerApps).map(k => arr.push(developerApps[k]));
  return arr;
}

export function addProxiedDeveloperApp(name: string, app: firebase.app.App) {
  developerApps[name] = app;
}

export function getProxiedDeveloperApp(name: string) {
  if (developerApps[name]) {
    return developerApps[name];
  }
  throw new Error(`No proxied developer app with the name '${name}'`);
}

export function addProxiedFoundryAuthApp(name: string, app: firebase.app.App) {
  foundryAuthApps[name] = app;
}

export function getProxiedFoundryAuthApp(name: string) {
  if (foundryAuthApps[name]) {
    return foundryAuthApps[name];
  }
  throw new Error(`No proxied Foundry Auth app with the name '${name}'`);
}
