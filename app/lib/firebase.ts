import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"

const firebaseConfig = {
  apiKey: "AIzaSyChgkiyAF19-uDZYPHkikPvtxZXMzpitFI",
  authDomain: "birthday-surprise-66337.firebaseapp.com",
  projectId: "birthday-surprise-66337",
  storageBucket: "birthday-surprise-66337.firebasestorage.app",
  messagingSenderId: "590468186831",
  appId: "1:590468186831:web:84c4da192b7dce22512dba",
  measurementId: "G-GKPWR57BC6",
  databaseURL:"https://birthday-surprise-66337-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);