import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDh9fUMrC6zBLW0ygJGmg4fMJzZohUhly0",
  authDomain: "zyrodev-58fed.firebaseapp.com",
  projectId: "zyrodev-58fed",
  storageBucket: "zyrodev-58fed.firebasestorage.app",
  messagingSenderId: "579084406897",
  appId: "1:579084406897:web:3eddd503744d9965790bd0"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);