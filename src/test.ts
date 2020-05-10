import foundry from './index';

foundry.initialize({
  firebase: {
    options: {
      apiKey: 'AIzaSyD8PTDvrCQ1vt0TRdXawz0qT4Ok8lg4EpM',
      authDomain: 'foundry-examples.firebaseapp.com',
      databaseURL: 'https://foundry-examples.firebaseio.com',
      projectId: 'foundry-examples',
      storageBucket: 'foundry-examples.appspot.com',
      messagingSenderId: '149179017051',
      appId: '1:149179017051:web:edbb73e4decf62ac18dc7e',
      measurementId: 'G-3LHKSPNS4',
    },
  },
});

const { firebase } = foundry;
