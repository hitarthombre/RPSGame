< script type = "module" > { /* // Import the functions you need from the SDKs you need */ }
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-analytics.js"; { /* // TODO: Add SDKs for Firebase products that you want to use */ } { /* // https://firebase.google.com/docs/web/setup#available-libraries */ }

{ /* // Your web app's Firebase configuration */ } { /* // For Firebase JS SDK v7.20.0 and later, measurementId is optional */ }
const firebaseConfig = {
    apiKey: "AIzaSyBqk48DBOdTRfZ9zXoGrK8EDTiD1_wD5wY",
    authDomain: "rpsgame-2f89b.firebaseapp.com",
    projectId: "rpsgame-2f89b",
    storageBucket: "rpsgame-2f89b.appspot.com",
    messagingSenderId: "673682508484",
    appId: "1:673682508484:web:9684aa47d977fb58ba1791",
    measurementId: "G-PJTZ0D4FK0"
};

{ /* // Initialize Firebase */ }
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

<
/script>