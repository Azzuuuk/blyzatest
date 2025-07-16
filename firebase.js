import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database"; 

const firebaseConfig = {
  apiKey: "AIzaSyDM9rSmh67R6q8Z6SB6HpTBYQ4QB-1HSY4",
  authDomain: "blyzatest.firebaseapp.com",
  projectId: "blyzatest",
  storageBucket: "blyzatest.firebasestorage.app",
  messagingSenderId: "138818921463",
  appId: "1:138818921463:web:51432a3829ad6ae62ec4f2",
  measurementId: "G-8LX4R29Q89"
};

const app = initializeApp(firebaseConfig);

// Get a reference to the services
const auth = getAuth(app);
const db = getDatabase(app); // <-- CRUCIAL INITIALIZATION

// Export the services for use in other files
export { auth, db };