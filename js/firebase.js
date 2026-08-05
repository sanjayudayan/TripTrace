const firebaseConfig = {
  apiKey: "AIzaSyANsCF6CbNT15eRugRAPOvzzguQeF7qGeA",
  authDomain: "triptrace-202d3.firebaseapp.com",
  projectId: "triptrace-202d3",
  storageBucket: "triptrace-202d3.firebasestorage.app",
  messagingSenderId: "573086361163",
  appId: "1:573086361163:web:503d43d23027cb80c38fce",
  measurementId: "G-F22KFDZ4J3"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth    = firebase.auth();
const db      = firebase.firestore();
const storage = firebase.storage();