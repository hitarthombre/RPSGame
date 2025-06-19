# 🔥 Multiplayer Rock Paper Scissors Game with Firebase

This is a fun and interactive **Multiplayer Rock Paper Scissors** game built using **HTML, CSS, and JavaScript**, powered by **Firebase Realtime Database** and **Firebase Authentication**.

Players can log in, join the game lobby, compete in real-time with others, and track their performance stats — all in a sleek, responsive UI.

---

## 🚀 Features

- 🔐 **User Authentication**
  - Sign up and log in using Firebase Authentication (email/password).
  - Persistent login across sessions.

- 🧑‍🤝‍🧑 **Multiplayer Gameplay**
  - Real-time matchmaking and gameplay using Firebase Realtime Database.
  - Automatic pairing and state updates.

- 📊 **Persistent Player Stats**
  - Tracks:
    - Total Wins
    - Total Losses
    - Win Percentage
    - Loss Percentage
  - Displayed in the user dashboard.

- 🖥️ **Responsive UI**
  - Clean, intuitive layout for all screen sizes.
  - Feedback for game result, player actions, and status updates.

---


## 🛠️ Tech Stack

| Tech             | Usage                        |
|------------------|-------------------------------|
| **HTML/CSS**     | UI layout and styling         |
| **JavaScript**   | Game logic and interactivity  |
| **Firebase Auth**| User login/signup             |
| **Firebase DB**  | Real-time data and state sync |

---


## 🧩 How It Works

1. **Login/Signup**:
   - Users create an account or log in with Firebase Auth.

2. **Matchmaking**:
   - Players are paired via the Realtime Database under a `rooms` node.

3. **Gameplay**:
   - Players select Rock, Paper, or Scissors.
   - Results are synced in real-time and displayed to both users.

4. **Stats Update**:
   - Each game result updates win/loss stats in the user’s Firebase profile.

---
