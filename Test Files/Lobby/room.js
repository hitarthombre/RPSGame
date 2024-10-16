import {
  ref,
  update,
  onValue,
  get,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";
import { db } from "./firebaseConfig.js";

let roomId;
let playerId;
let opponentId;
let playerChoice = null;
let opponentChoice = null;
let playerScore = 0;
let opponentScore = 0;

const urlParams = new URLSearchParams(window.location.search);
roomId = urlParams.get("roomId");
playerId = urlParams.get("playerId");
const roomRef = ref(db, `rooms/${roomId}`);
const usersRef = ref(db, `users`);

const getUsernameById = async (id) => {
  const snapshot = await get(usersRef);
  const users = snapshot.val();
  return users[id]?.username || "Unknown";
};

const makeChoice = async (choice) => {
  playerChoice = choice;
  await update(roomRef, { [`${playerId}_choice`]: playerChoice });

  // Display the current player's choice immediately
  document.getElementById(
    "player1_choice"
  ).textContent = `Choice: ${playerChoice}`;

  // Fetch opponent's choice to show it
  const snapshot = await get(roomRef);
  const data = snapshot.val();
  opponentChoice = data[`${opponentId}_choice`] || null;
  document.getElementById("player2_choice").textContent = `Choice: ${
    opponentChoice || "Waiting"
  }`;
};

const updateScore = async () => {
  await update(roomRef, {
    [`${playerId}_score`]: playerScore,
    [`${opponentId}_score`]: opponentScore,
  });

  document.getElementById(
    "player1_score"
  ).textContent = `Score: ${playerScore}`;
  document.getElementById(
    "player2_score"
  ).textContent = `Score: ${opponentScore}`;
};

// Listen for room updates
onValue(roomRef, async (snapshot) => {
  const data = snapshot.val();
  if (data) {
    opponentId = data.player1 === playerId ? data.player2 : data.player1;
    const player1Name = await getUsernameById(playerId);
    const player2Name = await getUsernameById(opponentId);

    document.getElementById("player1_name").textContent = `You: ${player1Name}`;
    document.getElementById(
      "player2_name"
    ).textContent = `Opponent: ${player2Name}`;

    document.getElementById("player1_choice").textContent = `Choice: ${
      data[`${playerId}_choice`] || "Waiting"
    }`;
    document.getElementById("player2_choice").textContent = `Choice: ${
      data[`${opponentId}_choice`] || "Waiting"
    }`;
    document.getElementById("player1_score").textContent = `Score: ${
      data[`${playerId}_score`] || 0
    }`;
    document.getElementById("player2_score").textContent = `Score: ${
      data[`${opponentId}_score`] || 0
    }`;
    document.getElementById("result").textContent = data.win || "";

    opponentChoice = data[`${opponentId}_choice`];
    playerScore = data[`${playerId}_score`] || 0;
    opponentScore = data[`${opponentId}_score`] || 0;
  }
});
