import got from 'got';
import firebase from 'firebase/app';
import 'firebase/firestore';

export interface EnvOwner {
  uid: string;
  email: string;
}

// TODO: This is dynamically injected by runtime
const ___FOUNDRY_OWNER_ENV_DEV_API_KEY___ = 'foundry|ak_dev_710f41debd7d017f264c58b25dd581bd8a4787ca7be8739b2f6ea08e2aed8a9c';

let ENV_OWNER: EnvOwner;
const BASE_URL = 'https://api.foundryapp.co/v1';
const ENV_DEV_URL = BASE_URL + '/env/dev';

// TODO: Save the token into localstorage or indexedDB?
// https://stackoverflow.com/questions/39176237/how-do-i-store-jwt-and-send-them-with-every-request-using-react
// Security update: As @Dan mentioned in the comment,
// tokens should not be stored in Localstorage because
// every javascript script has access to that one, which
// means third party scripts you don't own could access tokens and do whatevery they want with it.
// A better place is to store it as a Cookie with HttpOnly flag.
let ownerToken = '';
let tokenTimestamp = 0; // The unix epoch timestamp in seconds denoting when the token was obtained

enum HttpMethod {
  Get = 'GET',
  Post = 'POST',
}

async function apiRequest(route: string, method: HttpMethod, token: string, data?: any, ) {
  try {
    const { body }: { body: any } = await got(ENV_DEV_URL + route, {
      method,
      headers: {
        authorization: token ? `Bearer ${___FOUNDRY_OWNER_ENV_DEV_API_KEY___}:${token}` : `Bearer ${___FOUNDRY_OWNER_ENV_DEV_API_KEY___}`
      },
      json: method !== HttpMethod.Get ? { data } : undefined,
      responseType: 'json',
    });
    if (body?.data) {
      return body.data;
    } else {
      throw new Error(`Unexpected response when refreshing the access token:\n${body}`);
    }

  } catch (error) {
    if (error.response?.body?.error) {
      const errStr = JSON.stringify(error.response.body.error);
      throw new Error(errStr);
    } else {
      throw error;
    }
  }
}

async function refreshToken() {
  const route = '/refreshToken';

  const { token } = await apiRequest(route, HttpMethod.Get, '');
  ownerToken = token;
  tokenTimestamp = Math.floor(Date.now() / 1000);
}

function isTokenAlive() {
  const oneHourInSeconds = 60 * 60;
  const now = Math.floor(Date.now() / 1000);

  // console.log('now =', now);
  // console.log('tokenTimestamp =', tokenTimestamp);
  // console.log('now - tokenTimestamp =', now - tokenTimestamp);

  return (now - tokenTimestamp) < oneHourInSeconds;
}

export async function getEnvOwner() {
  if (ENV_OWNER) {
    return ENV_OWNER;
  }

  if (!isTokenAlive()) {
    await refreshToken();
  }
  const route = '/owner';
  const { owner }: { owner: EnvOwner } = await apiRequest(route, HttpMethod.Get, ownerToken);
  ENV_OWNER = owner;
  return owner;
}


export async function createUser(userEmail: string, password: string) {
  if (!isTokenAlive()) {
    await refreshToken();
  }

  const route = '/firebase/auth/user';
  const { email, userId } = await apiRequest(route, HttpMethod.Post, ownerToken, { email: userEmail, password });
  return { email, userId };
}


