import firebase from 'firebase/app';

const apps: { [name: string]: firebase.app.App } = {};

export function getProxiedApps() {
  const arr: firebase.app.App[] = [];
  Object.keys(apps).map(k => arr.push(apps[k]));
  return arr;
}

export function addProxiedApp(name: string, app: firebase.app.App) {
  // TODO: Check if the app already exists?
  apps[name] = app;
}

export function getProxiedApp(name: string) {
  // TODO: Check if the app exists?
  return apps[name];
}


