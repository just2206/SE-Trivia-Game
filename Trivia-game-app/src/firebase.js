// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBdjwJdPdHJmBiY2QXSGXCiwzvftJowxB4",
  authDomain: "final-project---se--25.firebaseapp.com",
  projectId: "final-project---se--25",
  storageBucket: "final-project---se--25.firebasestorage.app",
  messagingSenderId: "529188519972",
  appId: "1:529188519972:web:1b464d8262bc40d832d8b1",
  measurementId: "G-6S5KNEHD7H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Export the auth object for use in your React components
export { auth };
