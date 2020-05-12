import foundry from './index';



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

foundry.initializeDev();


const { firebase } = foundry;

async function startMayhem() {

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
  try {
    const { user } = await firebase.auth().signInWithEmailAndPassword('vasek+asj@foundryapp.co', '123456');
    console.log(user?.email);
  } catch (err) {
    console.log(err);
  }
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
