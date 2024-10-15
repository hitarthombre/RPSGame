import {
  ref,
  onValue,
  remove,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";
import { db } from "./firebaseConfig.js";

const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get("roomId");
const currentPlayer = urlParams.get("player");

const currentPlayerDiv = document.getElementById("current-player");
const opponentPlayerDiv = document.getElementById("opponent-player");

currentPlayerDiv.textContent = `You: ${currentPlayer}`;

// Get the opponent player from the room
const roomRef = ref(db, `matchmaking/rooms/${roomId}/players/`);
onValue(roomRef, (snapshot) => {
  const players = snapshot.val() || {};
  const opponents = Object.keys(players).filter(
    (player) => player !== currentPlayer
  );
  if (opponents.length > 0) {
    opponentPlayerDiv.textContent = `Opponent: ${opponents[0]}`;
  } else {
    opponentPlayerDiv.textContent = "Waiting for an opponent...";
  }
});

// Handle exit room button
document.getElementById("exit-room").addEventListener("click", () => {
  remove(ref(db, `matchmaking/rooms/${roomId}`))
    .then(() => {
      console.log(`Room ${roomId} removed.`);
      window.location.href = "lobby.html"; // Redirect back to the lobby
    })
    .catch((error) => {
      console.error("Error removing room:", error);
    });
});
