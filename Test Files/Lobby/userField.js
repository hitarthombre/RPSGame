const inputField = document.getElementById("username-input");
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
