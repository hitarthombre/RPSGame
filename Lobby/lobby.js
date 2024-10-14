import {
  ref,
  update,
  onValue,
  onDisconnect,
  get,
  child,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";
import { db } from "./firebaseConfig.js";

const PING_INTERVAL = 2000;
const TIMEOUT_DURATION = 5000;

let pingInterval;
let userId;
const playerStack = [];

const sendPing = (userRef) => {
  update(userRef, { lastPing: Date.now() });
};

const startPinging = (username) => {
  const dbRef = ref(db);
  get(child(dbRef, `users/`)).then((snapshot) => {
    const users = snapshot.val();

    for (let key in users) {
      if (users[key].username === username) {
        userId = key;
        break;
      }
    }

    if (userId) {
      const userRef = ref(db, `users/${userId}`);
      update(userRef, { online: true }).then(() => {
        sendPing(userRef);
        pingInterval = setInterval(() => {
          sendPing(userRef);
        }, PING_INTERVAL);
        onDisconnect(userRef).update({ online: false });
      });
    }
  });
};

const monitorOnlineStatus = (username) => {
  const onlinePlayersList = document.getElementById("online-players-list");
  const stackList = document.getElementById("stack-list");

  const usersRef = ref(db, "users/");
  onValue(usersRef, (snapshot) => {
    const users = snapshot.val();
    onlinePlayersList.innerHTML = "";
    let onlineUsers = [];

    for (let key in users) {
      const user = users[key];
      const timeSinceLastPing = Date.now() - user.lastPing;

      if (timeSinceLastPing <= TIMEOUT_DURATION) {
        onlineUsers.push(user.username);
        onlinePlayersList.innerHTML += `<div>${user.username}</div>`;
      }
    }

    if (!onlineUsers.includes(username)) {
      onlineUsers.push(username);
    }

    updateStackDisplay(stackList);
  });
};

const updateStackDisplay = (stackList) => {
  stackList.innerHTML = playerStack
    .map((user) => `<div>${user}</div>`)
    .join("");
};

document.getElementById("start-button").addEventListener("click", () => {
  const username = document
    .getElementById("greeting")
    .textContent.replace("Hello, ", "")
    .trim();
  if (!playerStack.includes(username)) {
    playerStack.push(username);
    updateStackDisplay(document.getElementById("stack-list"));
  }
});

document.getElementById("exit-button").addEventListener("click", () => {
  const username = document
    .getElementById("greeting")
    .textContent.replace("Hello, ", "")
    .trim();
  const index = playerStack.indexOf(username);
  if (index !== -1) {
    playerStack.splice(index, 1);
    updateStackDisplay(document.getElementById("stack-list"));
  }
});

window.onload = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const username = urlParams.get("username");
  if (username) {
    document.getElementById("greeting").textContent += username;
    startPinging(username);
    monitorOnlineStatus(username);
  } else {
    alert("No username provided!");
    window.location.href = "login.html";
  }
};

window.onbeforeunload = () => {
  clearInterval(pingInterval);
};
