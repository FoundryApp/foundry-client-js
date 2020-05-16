
import foundry from './index';
import * as api from './api';
// import * as firebase from 'firebase';
// import 'firebase/auth';
// const app = firebase.initializeApp({
//   apiKey: 'AIzaSyAqL--IsyZd3cQTUgXR3KRWZZN-M6jR1kE',
//   authDomain: 'foundryapp.firebaseapp.com',
//   databaseURL: 'https://foundryapp.firebaseio.com',
//   projectId: 'foundryapp',
//   storageBucket: 'foundryapp.appspot.com',
//   messagingSenderId: '103053412875',
//   appId: '1:103053412875:web:d6720b66501102a45e550e',
// });



// (document as any).___FOUNDRY_ENV_DEV_API_KEY___ = 'foundry|ak_dev_710f41debd7d017f264c58b25dd581bd8a4787ca7be8739b2f6ea08e2aed8a9c';


// if (process.env.IS_DEV) {
//   foundry.initializeDev();
// } else {
//   foundry.initializeProd({
//     firebase: {
//       options: {
//         apiKey: 'AIzaSyD8PTDvrCQ1vt0TRdXawz0qT4Ok8lg4EpM',
//         authDomain: 'foundry-examples.firebaseapp.com',
//         databaseURL: 'https://foundry-examples.firebaseio.com',
//         projectId: 'foundry-examples',
//         storageBucket: 'foundry-examples.appspot.com',
//         messagingSenderId: '149179017051',
//         appId: '1:149179017051:web:edbb73e4decf62ac18dc7e',
//         measurementId: 'G-3LHKSPNS4',
//       },
//     },
//   });
// }




const { firebase } = foundry;

async function startMayhem() {
  await foundry.initializeDev();

  // await api.createUser('email@example.com', '123456');
  try {
    const { user } = await firebase.auth().createUserWithEmailAndPassword('user2@email.com', '123');
    // const { user } = await firebase.auth().signInWithEmailAndPassword('new-user5@email.com', '123456');
    console.log('user', user?.uid);
    console.log('user', user?.email);

    console.log(firebase.auth().currentUser);

    console.log(firebase.auth().currentUser?.uid);
    console.log(firebase.auth().currentUser?.email);
  } catch (err) {
    console.error(err);
  }

  // const { user } = await app.auth().signInWithEmailAndPassword('vasek@foundryapp.co', '123456');
  // const tok = await user?.getIdToken();
  // console.log(tok);

  // await firebase.firestore().collection('hello').add({
  //   a: 'b',
  // });

  // const c = await firebase.firestore().collection('hello').get();
  // console.log('After', c);
  // c.forEach(d => {
  //   console.log(d.data());
  // });

  // await firebase.firestore().collection('hello').doc('world').set({
  //   make: 'love not war 2',
  // });

  // const r = await firebase.firestore().collection('hello').doc('world').get();
  // console.log('data:', r.data());

  // firebase.app().auth().createUserWithEmailAndPassword('a', 'b');
  // console.log(firebase.auth().currentUser);
  // console.log('////');
  // console.log(firebase.app().auth().currentUser);
  console.log('////');
  // try {
  //   const { user } = await firebase.auth().signInWithEmailAndPassword('vasek+asj@foundryapp.co', '123456');
  //   console.log(user?.email);
  // } catch (err) {
  //   console.log(err);
  // }
  // firebase.apps[0].auth().app.auth().createUserWithEmailAndPassword('v', 'w');
  // firebase.auth(firebase.auth().app).createUserWithEmailAndPassword('x', 'y');
  // firebase.auth().createUserWithEmailAndPassword('1', '2');
  // firebase.auth().app.auth().createUserWithEmailAndPassword('a', 'b');// .app.auth().createUserWithEmailAndPassword('e', 'a');
  // console.log('////');
  // console.log(firebase.apps[0].auth().currentUser);

  // await firebase.auth().createUserWithEmailAndPassword('asd', '123456');
  // console.log(firebase.auth());
}

startMayhem();
