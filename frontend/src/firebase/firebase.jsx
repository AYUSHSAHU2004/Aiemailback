// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // Import Firestore

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBC_oKfzSeJ2phlnrgR9rRKcTAF8_hM8UU",
  authDomain: "ast-engine-rule.firebaseapp.com",
  projectId: "ast-engine-rule",
  storageBucket: "ast-engine-rule.appspot.com",
  messagingSenderId: "473198018285",
  appId: "1:473198018285:web:a83046d16c8760177416e4",
  measurementId: "G-WXGR399HR5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Set up Firebase authentication and Firestore
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const firestore = getFirestore(app); // Initialize Firestore
