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
    muteButton.textContent = "Mute"; // Update button text to "Mute"
  } else {
    backgroundMusic.muted = true;
    muteButton.textContent = "Unmute"; // Update button text to "Unmute"
  }
});
