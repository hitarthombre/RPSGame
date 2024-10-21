import {
  ref,
  set,
  get,
  child,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";
import { db } from "./firebaseConfig.js";

// Signup function
const signup = async (username, email, password) => {
  const dbRef = ref(db);
  const snapshot = await get(child(dbRef, `users/`));

  if (snapshot.exists()) {
    const users = snapshot.val();
    if (Object.values(users).some((user) => user.username === username)) {
      alert("Username already exists");
      return;
    }
    if (Object.values(users).some((user) => user.email === email)) {
      alert("Email already exists");
      return;
    }
  }

  const userId = Date.now(); // Unique ID for the user
  try {
    await set(ref(db, `users/${userId}`), {
      username,
      email,
      password,
      online: false,
      totalMatches: 0,
      totalWins: 0,
      totalLosses: 0,
    });
    alert("Signup successful");
    window.location.href = `lobby.html?username=${encodeURIComponent(
      username
    )}`; // Redirect to lobby
  } catch (error) {
    console.error(error);
  }
};

// Attach event listener for signup button
document.getElementById("signup-button").addEventListener("click", (event) => {
  event.preventDefault();
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  signup(username, email, password);
});

// Emoji animation logic
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

// Email input validation logic
const emailInput = document.getElementById("email");
const emailIcon = document.getElementById("emailIcon");

emailInput.addEventListener("input", () => {
  const emailValue = emailInput.value;
  if (emailValue === "") {
    emailIcon.classList.remove("ri-mail-close-fill", "ri-mail-check-fill");
    emailIcon.classList.add("ri-mail-add-fill");
  } else if (
    !emailValue.includes(".") ||
    emailValue.split(".").pop().length === 0
  ) {
    emailIcon.classList.remove("ri-mail-add-fill", "ri-mail-check-fill");
    emailIcon.classList.add("ri-mail-close-fill");
  } else {
    emailIcon.classList.remove("ri-mail-close-fill", "ri-mail-add-fill");
    emailIcon.classList.add("ri-mail-check-fill");
  }
});

// Password field logic
const passwordInput = document.getElementById("password");
const passwordIcon = document.getElementById("passwordIcon");

passwordInput.addEventListener("input", () => {
  passwordIcon.classList.toggle("ri-key-fill", passwordInput.value === "");
  passwordIcon.classList.toggle(
    "ri-eye-close-fill",
    passwordInput.value !== ""
  );
});

passwordIcon.addEventListener("click", () => {
  const type =
    passwordInput.getAttribute("type") === "password" ? "text" : "password";
  passwordInput.setAttribute("type", type);
  passwordIcon.classList.toggle("ri-eye-fill", type === "text");
  passwordIcon.classList.toggle("ri-eye-close-fill", type === "password");
});
