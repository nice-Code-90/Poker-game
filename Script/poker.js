const newGameButton = document.querySelector(".js-new-game-button");

const playerCardsContainer = document.querySelector(
  ".js-player-cards-container"
); // space of player cards: bind variable with HTML section tag

playerCardsContainer.innerHTML = "cards";

// program state
let deckId = null;
let playerCards = [];

function renderPlayerCards() {
  let html = "";

  for (let card of playerCards) {
    html += `<img src = "${card.image}" alt="${card.code}" />`;
  }
  playerCardsContainer.innerHTML = html;
}

function drawAndRenderPlayerCards() {
  if (deckId == null) return;
  fetch(`https://www.deckofcardsapi.com/api/deck/${deckId}/draw/?count=2`)
    .then((data) => data.json())
    .then(function (response) {
      playerCards = response.cards;
      renderPlayerCards();
    });
}

function startGame() {
  fetch("https://www.deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1")
    .then((data) => data.json())
    .then(function (response) {
      deckId = response.deck_id;
      drawAndRenderPlayerCards(); // todo: refactor async-await
    });
}
newGameButton.addEventListener("click", startGame);
