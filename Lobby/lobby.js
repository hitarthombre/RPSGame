import {
  ref,
  update,
  onValue,
  get,
  child,
  remove,
  onDisconnect,
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

const startGame = (username) => {
  const userRef = ref(db, `users/${userId}`);

  get(ref(db, "rooms/waiting")).then((snapshot) => {
    if (snapshot.exists()) {
      const waitingPlayerId = Object.keys(snapshot.val())[0];
      const roomId = `room_${userId}_${waitingPlayerId}`;

      // Pair the players and create a room
      update(ref(db, `rooms/${roomId}`), {
        player1: userId,
        player2: waitingPlayerId,
        player1_choice: "",
        player1_score: 0,
        player2_choice: "",
        player2_score: 0,
        win: "",
        status: "playing",
      });
      update(userRef, { status: "playing", roomId: roomId });
      update(ref(db, `users/${waitingPlayerId}`), {
        status: "playing",
        roomId: roomId,
      });

      // Remove from waiting list
      remove(ref(db, `rooms/waiting/${waitingPlayerId}`));

      // Redirect to room page
      window.location.href = `room.html?roomId=${roomId}&playerId=${userId}`;
    } else {
      // No waiting player, set current player to waiting
      update(ref(db, `rooms/waiting/${userId}`), { username: username }).then(
        () => {
          update(userRef, { status: "waiting" });
          // Redirect to waiting room page
          window.location.href = `waiting.html?playerId=${userId}`;
        }
      );
    }
  });
};

document.getElementById("exit-button").addEventListener("click", () => {
  console.log("Exit button clicked");
  update(ref(db, `users/${userId}`), { online: false });
});

window.onload = () => {
  const urlParams = new URLSearchParams(window.location.search);
  username = urlParams.get("username");
  if (username) {
    document.getElementById("current-username").textContent = username;
    startPinging(username);
    monitorOnlineStatus();

    // Attach event listener to start game button
    document.getElementById("start-button").addEventListener("click", () => {
      startGame(username);
    });
  } else {
    alert("No username provided!");
    window.location.href = "login.html";
  }
};

window.onbeforeunload = () => {
  clearInterval(pingInterval);
};
