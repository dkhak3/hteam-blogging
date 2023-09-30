import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyBlbe-DJbj4jl0N6E4BkSS6_4d1k--mskY",
  authDomain: "monkey-blogging-3d4ce.firebaseapp.com",
  projectId: "monkey-blogging-3d4ce",
  storageBucket: "monkey-blogging-3d4ce.appspot.com",
  messagingSenderId: "624117428280",
  appId: "1:624117428280:web:e49456e97019ea9040f6cd",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
