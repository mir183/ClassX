// src/firebase/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBVVbTophY_2gTaEgZSZPSXSP1-9cxBmiA",
  authDomain: "classx-5b5dd.firebaseapp.com",
  projectId: "classx-5b5dd",
  storageBucket: "classx-5b5dd.firebasestorage.app",
  messagingSenderId: "75631986950",
  appId: "1:75631986950:web:963dfdd06384b31ea8b687"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);

export { auth };
