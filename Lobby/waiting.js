import {
  ref,
  onValue,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";
import { db } from "./firebaseConfig.js";

const urlParams = new URLSearchParams(window.location.search);
const playerId = urlParams.get("playerId");

const playerRef = ref(db, `users/${playerId}`);
const roomRef = ref(db, "rooms/");

onValue(playerRef, (snapshot) => {
  const data = snapshot.val();
  if (data && data.roomId) {
    window.location.href = `room.html?roomId=${data.roomId}&playerId=${playerId}`;
  }
});

onValue(roomRef, (snapshot) => {
  const rooms = snapshot.val();
  for (let roomId in rooms) {
    const room = rooms[roomId];
    if (room.player1 === playerId || room.player2 === playerId) {
      window.location.href = `room.html?roomId=${roomId}&playerId=${playerId}`;
      break;
    }
  }
});
