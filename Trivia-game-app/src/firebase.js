// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

# ADD CONFIGURATION HERE #
const firebaseConfig = {
  apiKey: "API KEY",
  authDomain: "DOMAIN",
  projectId: "ID",
  storageBucket: "STORAGE",
  messagingSenderId: "MESSAGING",
  appId: "APP",
  measurementId: "MEASUREMENT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Export the auth object for use in your React components
export { auth };
