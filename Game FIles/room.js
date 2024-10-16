let compCount = 0;
let PlayerCount = 0;
let scoreBoard = document.querySelector(".score");

function RockPaperAndSissors(p1Choise) {
  let compChoiceContainer = document.querySelector(".compuImgBox");
  let playerChoiceContainer = document.querySelector(".yourImgbox");
  let compChoice = Math.floor(Math.random() * 3) + 1;
  fillChoiceContainer(playerChoiceContainer, p1Choise);
  fillChoiceContainer(compChoiceContainer, compChoice);

  if (p1Choise == compChoice) {
  } else if (
    (p1Choise == 1 && compChoice == 3) ||
    (p1Choise == 2 && compChoice == 1) ||
    (p1Choise == 3 && compChoice == 2)
  ) {
    PlayerCount++;
    scoreBoard.innerHTML = `${compCount} : ${PlayerCount}`;
  } else {
    compCount++;
    scoreBoard.innerHTML = `${compCount} : ${PlayerCount}`;
  }

  if (compCount == 3 || PlayerCount == 3) {
    document.querySelectorAll(".inputButton").forEach((element) => {
      element.style.cursor = "not-allowed";
    });
  }
}

function fillChoiceContainer(ele, choice) {
  if (choice == 1) {
    ele.innerHTML = "ROCK";
  } else if (choice == 2) {
    ele.innerHTML = "PAPER";
  } else {
    ele.innerHTML = "SISSORS";
  }
}
