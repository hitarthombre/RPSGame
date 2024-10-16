// firebaseConfig.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBqk48DBOdTRfZ9zXoGrK8EDTiD1_wD5wY",
  authDomain: "rpsgame-2f89b.firebaseapp.com",
  databaseURL: "https://rpsgame-2f89b-default-rtdb.firebaseio.com",
  projectId: "rpsgame-2f89b",
  storageBucket: "rpsgame-2f89b.appspot.com",
  messagingSenderId: "673682508484",
  appId: "1:673682508484:web:9684aa47d977fb58ba1791",
  measurementId: "G-PJTZ0D4FK0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
