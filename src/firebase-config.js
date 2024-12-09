import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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

// Initialize Auth using getAuth
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

export { auth, db };
export default app;
