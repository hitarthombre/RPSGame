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
let isResultChecked = false; // Flag to prevent multiple score updates

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

// Assign event listeners to buttons
document
  .getElementById("rock")
  .addEventListener("click", () => makeChoice("rock"));
document
  .getElementById("paper")
  .addEventListener("click", () => makeChoice("paper"));
document
  .getElementById("scissors")
  .addEventListener("click", () => makeChoice("scissors"));

const makeChoice = async (choice) => {
  playerChoice = choice;
  await update(roomRef, { [`${playerId}_choice`]: playerChoice });

  // Fetch the latest state of the room
  const snapshot = await get(roomRef);
  const data = snapshot.val();
  opponentChoice = data[`${opponentId}_choice`] || null;

  // Display choices for both players
  document.getElementById(
    "player1_choice"
  ).textContent = `Choice: ${playerChoice}`;
  document.getElementById("player2_choice").textContent = `Choice: ${
    opponentChoice || "Waiting for opponent..."
  }`;

  // Check if both players have made their choices
  if (playerChoice && opponentChoice && !isResultChecked) {
    checkResult(playerChoice, opponentChoice);
  }
};

// Function to calculate result
const checkResult = (playerChoice, opponentChoice) => {
  let result;
  if (playerChoice === opponentChoice) {
    result = "It's a tie!";
  } else if (
    (playerChoice === "rock" && opponentChoice === "scissors") ||
    (playerChoice === "scissors" && opponentChoice === "paper") ||
    (playerChoice === "paper" && opponentChoice === "rock")
  ) {
    result = "You win!";
    playerScore++;
  } else {
    result = "You lose!";
    opponentScore++;
  }

  document.getElementById("result").textContent = result;
  showPopup(result); // Call function to display result popup
  updateScore(); // Update the scores after the round is finished

  // Set flag to prevent multiple result checks
  isResultChecked = true;
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

// Show result popup and reset choices after a delay
const showPopup = (result) => {
  const popup = document.getElementById("result-popup");
  popup.textContent = result;
  popup.style.display = "block"; // Show the popup

  // Hide the popup after 3 seconds and reset choices for the next round
  setTimeout(() => {
    popup.style.display = "none";
    resetChoices(); // Reset player choices
  }, 3000);
};

const resetChoices = async () => {
  playerChoice = null;
  opponentChoice = null;
  isResultChecked = false; // Reset the flag for the next round
  await update(roomRef, {
    [`${playerId}_choice`]: null,
    [`${opponentId}_choice`]: null,
  });

  document.getElementById("player1_choice").textContent = `Choice: Waiting...`;
  document.getElementById("player2_choice").textContent = `Choice: Waiting...`;
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

    // Update choices and scores from the database
    playerChoice = data[`${playerId}_choice`] || null;
    opponentChoice = data[`${opponentId}_choice`] || null;

    // If both players have made their choices, show them
    if (playerChoice && opponentChoice) {
      document.getElementById(
        "player1_choice"
      ).textContent = `Choice: ${playerChoice}`;
      document.getElementById(
        "player2_choice"
      ).textContent = `Choice: ${opponentChoice}`;
      if (!isResultChecked) {
        checkResult(playerChoice, opponentChoice); // Check result only if not done
      }
    } else {
      document.getElementById(
        "player1_choice"
      ).textContent = `Choice: Waiting for opponent...`;
      document.getElementById(
        "player2_choice"
      ).textContent = `Choice: Waiting for opponent...`;
    }

    playerScore = data[`${playerId}_score`] || 0;
    opponentScore = data[`${opponentId}_score`] || 0;

    document.getElementById(
      "player1_score"
    ).textContent = `Score: ${playerScore}`;
    document.getElementById(
      "player2_score"
    ).textContent = `Score: ${opponentScore}`;
  }
});
