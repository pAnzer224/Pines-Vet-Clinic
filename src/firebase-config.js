// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBdMcEt1Dif0IKzu-XUoeD_Za12u7aNWmU",
  authDomain: "highland-petvibes-ph.firebaseapp.com",
  projectId: "highland-petvibes-ph",
  storageBucket: "highland-petvibes-ph.firebasestorage.app",
  messagingSenderId: "856904127955",
  appId: "1:856904127955:web:9b2e38fb6100fa3a0a0b26",
  measurementId: "G-GC1DG7X8HT",
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Firebase Authentication and Firestore
export const auth = getAuth(app);
export const firestore = getFirestore(app);

export default app;
