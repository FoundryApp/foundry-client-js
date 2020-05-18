import ky from 'ky';
import axios from 'axios';
import firebase from 'firebase/app';
import 'firebase/firestore';

export interface EnvOwner {
  uid: string;
  email: string;
}

enum HttpMethod {
  Get = 'GET',
  Post = 'POST',
}
export class FoundryEnvDevAPI {
  private ENV_OWNER?: EnvOwner = undefined;
  private BASE_URL = 'https://api.foundryapp.co/v1';
  private ENV_DEV_URL = this.BASE_URL + '/env/dev';

  // TODO: Save the token into localstorage or indexedDB?
  // https://stackoverflow.com/questions/39176237/how-do-i-store-jwt-and-send-them-with-every-request-using-react
  // Security update: As @Dan mentioned in the comment,
  // tokens should not be stored in Localstorage because
  // every javascript script has access to that one, which
  // means third party scripts you don't own could access tokens and do whatevery they want with it.
  // A better place is to store it as a Cookie with HttpOnly flag.
  private ownerToken = '';
  private tokenTimestamp = 0; // The unix epoch timestamp in seconds denoting when the token was obtained

  constructor(private apiKey: string) { }

  private async apiRequest(route: string, method: HttpMethod, useToken: boolean, reqData?: any, ) {
    console.log('route', route);
    console.log('this.apiKey', this.apiKey);



    try {
      // const { body }: { body: any } = await ky(this.ENV_DEV_URL + route, {
      //   method,
      //   headers: {
      //     authorization: useToken ? `Bearer ${this.apiKey}:${this.ownerToken}` : `Bearer ${this.apiKey}`,
      //     'content-type': 'application/json',
      //   },
      //   json: method !== HttpMethod.Get ? { data } : undefined,
      // });
      const { data } = await axios({
        method,
        url: this.ENV_DEV_URL + route,
        headers: {
          authorization: useToken ? `Bearer ${this.apiKey}:${this.ownerToken}` : `Bearer ${this.apiKey}`,
          'content-type': 'application/json',
        },
        data: method !== HttpMethod.Get ? { reqData } : undefined,
      });

      // const response = await ky(this.ENV_DEV_URL + route, {
      //   method,
      //   headers: {
      //     authorization: useToken ? `Bearer ${this.apiKey}:${this.ownerToken}` : `Bearer ${this.apiKey}`,
      //     'content-type': 'application/json',
      //   },
      //   json: method !== HttpMethod.Get ? { data } : undefined,
      // });

      if (data?.data) {
        return data.data;
      } else {
        // console.log(body);
        throw new Error(`Unexpected response:\n${JSON.stringify(data)}`);
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

  private isTokenAlive() {
    const oneHourInSeconds = 60 * 60;
    const now = Math.floor(Date.now() / 1000);

    // console.log('now =', now);
    // console.log('tokenTimestamp =', tokenTimestamp);
    // console.log('now - tokenTimestamp =', now - tokenTimestamp);

    return (now - this.tokenTimestamp) < oneHourInSeconds;
  }

  private async refreshToken() {
    const route = '/refreshToken';

    const { token } = await this.apiRequest(route, HttpMethod.Get, false);
    this.ownerToken = token;
    this.tokenTimestamp = Math.floor(Date.now() / 1000);
  }

  async getEnvOwner() {
    if (this.ENV_OWNER) {
      return this.ENV_OWNER;
    }

    if (!this.isTokenAlive()) {
      await this.refreshToken();
    }
    const route = '/owner';
    const { owner }: { owner: EnvOwner } = await this.apiRequest(route, HttpMethod.Get, true);
    this.ENV_OWNER = owner;
    return this.ENV_OWNER;
  }

  async createUser(userEmail: string, password: string) {
    if (!this.isTokenAlive()) {
      await this.refreshToken();
    }

    const route = '/firebase/auth/user';
    const { email, userId } = await this.apiRequest(route, HttpMethod.Post, true, { email: userEmail, password });
    return { email, userId };
  }

  __overrideAPIKey(key: string) {
    this.apiKey = key;
  }
}
