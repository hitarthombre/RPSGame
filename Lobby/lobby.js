import {
  ref,
  set,
  update,
  onValue,
  onDisconnect,
  get,
  child,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";
import { db } from "./firebaseConfig.js";

const PING_INTERVAL = 2000; // Send a ping every 2 seconds
const TIMEOUT_DURATION = 5000; // Timeout after 5 seconds of no ping

let pingInterval;
let userId; // Store current user ID
let username; // Store current username

const sendPing = (userRef) => {
  const timestamp = Date.now();
  update(userRef, { lastPing: timestamp });
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

      // Mark user as online immediately
      update(userRef, { online: true }).then(() => {
        sendPing(userRef);

        // Set up a ping mechanism that continuously updates `lastPing` field
        pingInterval = setInterval(() => {
          sendPing(userRef);
        }, PING_INTERVAL);

        // Handle disconnection (when the browser is closed)
        onDisconnect(userRef).update({ online: false });
      });
    }
  });
};

const monitorOnlineStatus = () => {
  const onlineList = document.getElementById("online-list");
  const onlineCount = document.getElementById("online-count");

  const usersRef = ref(db, "users/");
  onValue(usersRef, (snapshot) => {
    const users = snapshot.val();
    let onlineUsers = [];

    for (let key in users) {
      const user = users[key];
      const timeSinceLastPing = Date.now() - user.lastPing;

      if (timeSinceLastPing <= TIMEOUT_DURATION) {
        onlineUsers.push(user.username);
      }
    }

    // Update the online players count and list
    onlineCount.textContent = onlineUsers.length;
    onlineList.innerHTML = onlineUsers
      .map((user) => `<div>${user}</div>`)
      .join("");
  });
};

const monitorMatchmakingStack = () => {
  const stackList = document.getElementById("stack-list");
  const stackCount = document.getElementById("stack-count");

  const matchmakingRef = ref(db, "matchmaking/stack/");
  onValue(matchmakingRef, (snapshot) => {
    const stackPlayers = snapshot.val() || {};
    const stackUsernames = Object.keys(stackPlayers);

    // Update the matchmaking players count and list
    stackCount.textContent = stackUsernames.length;
    stackList.innerHTML = stackUsernames
      .map((user) => `<div>${user}</div>`)
      .join("");
  });
};

const addToStack = () => {
  const stackRef = ref(db, `matchmaking/stack/${username}`);

  // Use set to add the user to the stack
  set(stackRef, true)
    .then(() => {
      console.log(`${username} added to matchmaking stack.`);
    })
    .catch((error) => {
      console.error("Error adding to matchmaking stack:", error);
    });
};

const removeFromStack = () => {
  const stackRef = ref(db, `matchmaking/stack/${username}`);
  set(stackRef, null)
    .then(() => {
      console.log(`${username} removed from matchmaking stack.`);
    })
    .catch((error) => {
      console.error("Error removing from matchmaking stack:", error);
    });
};

document.getElementById("start-button").addEventListener("click", () => {
  console.log("Start button clicked");
  addToStack();
});

document.getElementById("exit-button").addEventListener("click", () => {
  console.log("Exit button clicked");
  removeFromStack();
});

window.onload = () => {
  const urlParams = new URLSearchParams(window.location.search);
  username = urlParams.get("username");
  if (username) {
    document.getElementById("current-username").textContent = username;
    startPinging(username);
    monitorOnlineStatus();
    monitorMatchmakingStack();
  } else {
    alert("No username provided!");
    window.location.href = "login.html";
  }
};

window.onbeforeunload = () => {
  clearInterval(pingInterval);
  removeFromStack(); // Remove user from stack on unload
};
