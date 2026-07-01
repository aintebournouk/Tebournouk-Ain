import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBtK2geW93lFtHmkAnIN1o1HwcqjEpnyLs",
  authDomain: "boreal-inkwell-fnn32.firebaseapp.com",
  projectId: "boreal-inkwell-fnn32",
  storageBucket: "boreal-inkwell-fnn32.firebasestorage.app",
  messagingSenderId: "294352472269",
  appId: "1:294352472269:web:dfce3ef1868dbccb36c184"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with custom database ID
export const db = getFirestore(app, "ai-studio-a913be11-61ea-4a53-a196-daf86901fa35");
