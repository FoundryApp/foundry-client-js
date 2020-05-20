import { Proxied } from '../../../proxy';

import { foundryAuthSeparator } from '../manager';

export function proxyUser(fbUser: firebase.User) {
  return new Proxied<firebase.User>(fbUser)
    // TODO: Check for arr length when spliting?
    .when('email', (user) => user.email ? user.email.split(foundryAuthSeparator)[1] : null)
    .when('uid', (user) => user.uid.split(foundryAuthSeparator)[1])
    .when('updateEmail', (user) => (newEmail: string) => {
      // TODO
    })
    .when('verifyBeforeUpdateEmail', (user) => (newEmail: string, actionCodeSettings?: firebase.auth.ActionCodeSettings | null) => {
      // TODO
    })
    .when('toJSON', (user) => () => {
      return user.toJSON();

      // TODO: Should we proxy this?
      // Because one of the fields this JSON contains is
      // authDomain: 'foundry-auth-56125.firebaseapp.com',
      // So changing user IDs and email would kind of make this JSON invalid

      const json: any = user.toJSON();
      const { uid, email, providerData }: { uid: string, email: string, providerData: firebase.UserInfo[] } = json;

      let unprefixedEmail = email;
      if (email) {
        unprefixedEmail = email.split(foundryAuthSeparator)[1];
      }
      const unprefixedUID = uid.split(foundryAuthSeparator)[1];

      // TODO: If user has multiple providers, we probably change the UID for each provider
      const filtered = providerData.filter(p => p.providerId === 'password');
      // TODO: Can you have multiple 'password' providers?
      let newPasswordProvider: any;
      if (filtered.length === 1) {
        const passwordProvider = filtered[0];
        newPasswordProvider = {
          ...passwordProvider,
          uid: unprefixedUID,
          email: passwordProvider.email ? unprefixedEmail : null,
        };
      }

      const newProviders = [...providerData];
      if (newPasswordProvider) {
        newProviders.map(p => {
          if (p.providerId === 'password') {
            p = newPasswordProvider;
          }
        });
      }
      return {
        ...json,
        providerData: newProviders,
        uid: unprefixedUID,
        email: unprefixedEmail,
      };
    })
    .when('delete', (user) => () => {
      // TODO?
    })
    .finalize();
}