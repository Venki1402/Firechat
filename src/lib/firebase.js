import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "fir-chat-reactv1.firebaseapp.com",
  projectId: "fir-chat-reactv1",
  storageBucket: "fir-chat-reactv1.appspot.com",
  messagingSenderId: "695793267953",
  appId: "1:695793267953:web:99a8faefa1ce266591a550"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth()
export const db = getFirestore()
export const storage = getStorage()