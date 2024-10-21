import {
  ref,
  update,
  onValue,
  get,
  remove,
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
let hasStatsUpdated = false; // Flag to prevent multiple stats updates

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
  // document.getElementById(
  //   "player1_choice"
  // ).textContent = `Choice: ${playerChoice}`;
  document.getElementById(
    "player1_choice"
  ).innerHTML=`<img src="/Assests/${playerChoice}.png" alt="">`;

  // Fetch opponent's choice
  const snapshot = await get(roomRef);
  const data = snapshot.val();
  opponentChoice = data[`${opponentId}_choice`] || null;

  if (playerChoice && opponentChoice && !isResultChecked) {
    revealChoicesAndCheckResult();
  } else if (!opponentChoice) {
    document.getElementById(
      "player2_choice"
    ).textContent = `Choice: Waiting for opponent...`;
  }
};

const revealChoicesAndCheckResult = () => {
  // document.getElementById(
  //   "player1_choice"
  // ).textContent = `Choice: ${playerChoice}`;
  document.getElementById(
    "player1_choice"
  ).innerHTML=`<img src="/Assests/${playerChoice}.png" alt="">`;

  // document.getElementById("player2_choice").textContent = `Choice: ${
  //   opponentChoice || "Waiting for opponent..."
  // }`;
  let player2Choice = document.getElementById("player2_choice")
  if(opponentChoice){
   player2Choice.innerHTML=`<img src="/Assests/${opponentChoice}.png" alt="">`;
  }
  else{
    player2Choice.innerHTML = "Waiting for opponent..."
  }
  
  
  checkResult(playerChoice, opponentChoice);
};

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

  updateScore(); // Update score immediately

  if (playerScore >= 3) {
    endGame(playerId, opponentId, "You won the match!", "You lost the match!");
  } else if (opponentScore >= 3) {
    endGame(opponentId, playerId, "You lost the match!", "You won the match!");
  } else {
    showPopup(result);
  }

  isResultChecked = true;
};

const endGame = async (winnerId, loserId, winnerMessage, loserMessage) => {
  if (hasStatsUpdated) return; // Prevent multiple updates

  const winnerUsername = await getUsernameById(winnerId);
  const loserUsername = await getUsernameById(loserId);

  showPopup(`${winnerUsername}, ${winnerMessage}`);
  hasStatsUpdated = true; // Set the flag to prevent further updates

  // Wait for the popup to show before updating stats and redirecting
  setTimeout(async () => {
    // Update winner stats
    const redirectUsername = await getUsernameById(playerId);
    if (winnerId == playerId) {
      // p1 === winner // p2 === loser
      // p1 === p1 // p1 === p2
      await updateUserStats(winnerId, true); // Pass true for winner
    } else {
      // p1 === loser
      // Update loser stats
      await updateUserStats(loserId, false); // Pass false for loser
    }
    await remove(roomRef); // Remove room

    // Redirect to lobby with the current player's username

    window.location.href = `/Lobby/lobby.html?username=${redirectUsername}`;
  }, 1500); // Reduced delay to 1.5 seconds
};

const updateUserStats = async (playerId, isWinner) => {
  const playerRef = ref(db, `users/${playerId}`);

  const playerSnapshot = await get(playerRef);
  const playerData = playerSnapshot.val();

  // Default to 0 if the values don't exist yet
  const totalMatches = playerData?.totalMatches || 0;
  const totalWins = playerData?.totalWins || 0;
  const totalLosses = playerData?.totalLosses || 0;

  // Increment match played and either wins or losses
  const updates = {
    totalMatches: totalMatches + 1,
  };

  if (isWinner) {
    updates.totalWins = totalWins + 1;
  } else {
    updates.totalLosses = totalLosses + 1;
  }

  // Apply the updates to the player's record
  await update(playerRef, updates);
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

const showPopup = (result) => {
  const popup = document.getElementById("result-popup");
  popup.textContent = result;
  popup.style.display = "block";

  setTimeout(() => {
    popup.style.display = "none";
    resetChoices();
  }, 1500); // Reduced delay to 1.5 seconds
};

const resetChoices = async () => {
  playerChoice = null;
  opponentChoice = null;
  isResultChecked = false;

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

    playerChoice = data[`${playerId}_choice`] || null;
    opponentChoice = data[`${opponentId}_choice`] || null;

    if (playerChoice && opponentChoice && !isResultChecked) {
      revealChoicesAndCheckResult();
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
