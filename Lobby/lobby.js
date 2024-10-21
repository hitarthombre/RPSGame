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
  get(child(dbRef, `users/`))
    .then((snapshot) => {
      const users = snapshot.val();
      for (let key in users) {
        if (users[key].username === username) {
          userId = key;
          console.log(`User ID found: ${userId}`); // Log user ID
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

          // Load user stats after userId is assigned
          loadUserStats();
        });
      } else {
        console.error(`No user found with username: ${username}`);
      }
    })
    .catch((error) => {
      console.error("Error retrieving users:", error);
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
    onlineCount.textContent = onlineUsers.length;
    onlineList.innerHTML = onlineUsers
      .map((user) => `<div>${user}</div>`)
      .join("");
  });
};

// Function to start the game
const startGame = (username) => {
  const userRef = ref(db, `users/${userId}`);

  get(ref(db, "rooms/waiting"))
    .then((snapshot) => {
      if (snapshot.exists()) {
        // Found a waiting player, create a room and start game
        const waitingPlayerId = Object.keys(snapshot.val())[0];
        const roomId = `room_${userId}_${waitingPlayerId}`;

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

        // Update status of players
        update(userRef, { status: "playing", roomId: roomId });
        update(ref(db, `users/${waitingPlayerId}`), {
          status: "playing",
          roomId: roomId,
        });

        // Remove waiting player from the waiting queue
        remove(ref(db, `rooms/waiting/${waitingPlayerId}`));

        // Redirect to the room page
        window.location.href = `room.html?roomId=${roomId}&playerId=${userId}`;
      } else {
        // No waiting players, add current user to waiting list
        update(ref(db, `rooms/waiting/${userId}`), { username: username }).then(
          () => {
            update(userRef, { status: "waiting" });
            window.location.href = `waiting.html?playerId=${userId}`;
          }
        );
      }
    })
    .catch((error) => {
      console.error("Error starting the game:", error);
    });
};

// Function to load and display user statistics
const loadUserStats = async () => {
  if (!userId) {
    console.error("User ID is not assigned yet.");
    return;
  }

  const userRef = ref(db, `users/${userId}`);
  const snapshot = await get(userRef);
  if (snapshot.exists()) {
    const userStats = snapshot.val();
    console.log("User Stats:", userStats); // Log user stats for debugging

    const totalMatches = userStats.totalMatches || 0;
    const totalWins = userStats.totalWins || 0;
    const totalLosses = userStats.totalLosses || 0;
    const winRatio =
      totalMatches > 0 ? ((totalWins / totalMatches) * 100).toFixed(2) : 0;

    document.getElementById("profile-username").textContent =
      userStats.username || username;
    document.getElementById("total-matches").textContent = totalMatches;
    document.getElementById("total-wins").textContent = totalWins;
    document.getElementById("total-losses").textContent = totalLosses;
    document.getElementById("win-ratio").textContent = `${winRatio}%`;
  } else {
    console.error(`No data found for userId: ${userId}`);
  }
};

document.getElementById("exit-button").addEventListener("click", () => {
  update(ref(db, `users/${userId}`), { online: false });
});

window.onload = () => {
  const urlParams = new URLSearchParams(window.location.search);
  username = urlParams.get("username");
  if (username) {
    document.getElementById("current-username").textContent = username;
    startPinging(username);
    monitorOnlineStatus();

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

// Create a new Audio object and set the source
const backgroundMusic = new Audio("/Assests/thunderstorm.mp3");
backgroundMusic.loop = true; // Set the audio to loop

// Play the audio when the page loads
window.addEventListener("load", () => {
  backgroundMusic.play();
});

// Get the mute button element
const muteButton = document.getElementById("muteButton");

// Toggle mute/unmute functionality
muteButton.addEventListener("click", () => {
  if (backgroundMusic.muted) {
    backgroundMusic.muted = false;
    // muteButton.textContent = "Mute"; // Update button text to "Mute"
    muteButton.classList.remove("ri-volume-mute-fill");
    muteButton.classList.add("ri-volume-up-fill"); // Update button icon to "Mute"
  } else {
    backgroundMusic.muted = true;
    // muteButton.textContent = "Unmute"; // Update button text to "Unmute"
    muteButton.classList.remove("ri-volume-up-fill");
    muteButton.classList.add("ri-volume-mute-fill"); // Update button icon to "Unmute"
  }
});

// Play the audio when the page loads, or fallback to user interaction
const playMusic = () => {
  backgroundMusic.play().catch((error) => {
    console.warn("Autoplay blocked: Waiting for user interaction.");
    document.body.addEventListener(
      "click",
      () => {
        backgroundMusic.play().catch(() => {
          console.error("Audio play failed even after user interaction.");
        });
      },
      { once: true }
    ); // Play after the first user interaction
  });
};

// Start playing background music on window load
window.addEventListener("load", playMusic);

// Ensure the correct icon is displayed based on the muted state after page reload
window.addEventListener("load", () => {
  if (backgroundMusic.muted) {
    muteButton.classList.remove("ri-volume-up-fill");
    muteButton.classList.add("ri-volume-mute-fill");
  } else {
    muteButton.classList.remove("ri-volume-mute-fill");
    muteButton.classList.add("ri-volume-up-fill");
  }
});





const animateEmojis = () => {
  const emojis = document.querySelectorAll(".emoji");
  const container = document.querySelector(".emoji-container");
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;

  emojis.forEach((emoji) => {
    let posX = Math.random() * (containerWidth - 50); // Adjusting for emoji size
    let posY = Math.random() * (containerHeight - 50);
    emoji.style.left = `${posX}px`;
    emoji.style.top = `${posY}px`;

    let speedX = (Math.random() * 2 + 1) * (Math.random() > 0.5 ? 1 : -1);
    let speedY = (Math.random() * 4 + 1) * (Math.random() > 0.5 ? 1 : -1);

    const moveEmoji = () => {
      posX += speedX;
      posY += speedY;

      if (posX <= -100 || posX + 100 >= containerWidth) speedX = -speedX;
      if (posY <= -100 || posY + 100 >= containerHeight) speedY = -speedY;

      emoji.style.left = `${posX}px`;
      emoji.style.top = `${posY}px`;

      requestAnimationFrame(moveEmoji);
    };

    moveEmoji();
  });
};

animateEmojis();