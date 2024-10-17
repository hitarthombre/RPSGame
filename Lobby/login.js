const emojis = document.querySelectorAll(".emoji");
const container = document.querySelector(".emoji-container");
const containerWidth = container.clientWidth;
const containerHeight = container.clientHeight;

emojis.forEach((emoji) => {
  let posX = Math.random() * (containerWidth - 50); // Adjusting for emoji size
  let posY = Math.random() * (containerHeight - 50); // Adjusting for emoji size
  emoji.style.left = `${posX}px`;
  emoji.style.top = `${posY}px`;

  let speedX = (Math.random() * 2 + 1) * (Math.random() > 0.5 ? 1 : -1);
  let speedY = (Math.random() * 4 + 1) * (Math.random() > 0.5 ? 1 : -1);

  function moveEmoji() {
    posX += speedX;
    posY += speedY;

    if (posX <= -100 || posX + 100 >= containerWidth) {
      speedX = -speedX; // Reverse direction on X-axis
    }

    if (posY <= -100 || posY + 100 >= containerHeight) {
      speedY = -speedY; // Reverse direction on Y-axis
    }

    emoji.style.left = `${posX}px`;
    emoji.style.top = `${posY}px`;

    requestAnimationFrame(moveEmoji);
  }

  moveEmoji();
});

// Password field logic
const passwordInput = document.getElementById("password");
const passwordIcon = document.getElementById("passwordIcon");

passwordInput.addEventListener("input", function () {
  if (passwordInput.value === "") {
    passwordIcon.classList.remove("ri-eye-close-fill");
    passwordIcon.classList.add("ri-key-fill");
  } else {
    passwordIcon.classList.remove("ri-key-fill");
    passwordIcon.classList.add("ri-eye-close-fill");
  }
});

passwordIcon.addEventListener("click", function () {
  const type =
    passwordInput.getAttribute("type") === "password" ? "text" : "password";
  passwordInput.setAttribute("type", type);

  // Toggle between eye close and eye open icons
  passwordIcon.classList.remove("ri-key-fill", "ri-eye-close-fill");
  passwordIcon.classList.add("ri-eye-fill");

  if (type === "password") {
    passwordIcon.classList.remove("ri-key-fill", "ri-eye-fill");
    passwordIcon.classList.add("ri-eye-close-fill");
  } else {
    passwordIcon.classList.remove("ri-key-fill", "ri-eye-close-fill");
    passwordIcon.classList.add("ri-eye-fill");
  }
});

// wlcome message animation
const inputField = document.getElementById("username");
const welcomeMessage = document.getElementById("welcome-message");

let welcomeText = "Welcome ";
let isTypingStarted = false;

inputField.addEventListener("focus", () => {
  if (!isTypingStarted) {
    showWelcomeMessage();
    isTypingStarted = true;
  }
});

inputField.addEventListener("input", () => {
  updateWelcomeMessage(inputField.value);
});

function showWelcomeMessage() {
  welcomeMessage.textContent = "";
  welcomeMessage.classList.remove("typing-effect");
  welcomeMessage.style.opacity = "1";

  // Start the typing effect
  let i = 0;
  const typeWriter = setInterval(() => {
    if (i < welcomeText.length) {
      welcomeMessage.textContent += welcomeText.charAt(i);
      i++;
    } else {
      clearInterval(typeWriter);
    }
  }, 100);
}

function updateWelcomeMessage(username) {
  if (username === "") {
    welcomeMessage.textContent = welcomeText;
  } else {
    welcomeMessage.textContent = `${welcomeText}${username}`;
  }
}

// 4. Login and redirect to lobby
const loginButton = document.getElementById("signup-button");
loginButton.addEventListener("click", (event) => {
  event.preventDefault(); // Prevent form submission

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (username && password) {
    // Assuming basic validation is done; you can add more checks here
    // Redirecting to lobby.html with the username as a query parameter
    window.location.href = `lobby.html?username=${encodeURIComponent(
      username
    )}`;
  } else {
    alert("Please enter both username and password.");
  }
});
