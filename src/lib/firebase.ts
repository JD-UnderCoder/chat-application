import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase Web App configuration (public keys)
// Provided by user; these are safe to include in client code.
const firebaseConfig = {
  apiKey: "AIzaSyChtoK_4wBcsLZiaXF-s_ksQBwxHPfZhs4",
  authDomain: "chat-application-1d2dc.firebaseapp.com",
  projectId: "chat-application-1d2dc",
  storageBucket: "chat-application-1d2dc.firebasestorage.app",
  messagingSenderId: "611424434957",
  appId: "1:611424434957:web:5b6e6044f296ceadf5ce44",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
