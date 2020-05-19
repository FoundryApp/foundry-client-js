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
  // TODO: Check if the app already exists?
  developerApps[name] = app;
}

export function getProxiedDeveloperApp(name: string) {
  console.log(Object.keys(developerApps));
  // TODO: Check if the app exists?
  return developerApps[name];
}

export function addProxiedFoundryAuthApp(name: string, app: firebase.app.App) {
  foundryAuthApps[name] = app;
}

export function getProxiedFoundryAuthApp(name: string) {
  console.log(Object.keys(foundryAuthApps));
  return foundryAuthApps[name];
}