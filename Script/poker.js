const newGameButton = document.querySelector(".js-new-game-button");
const playerCardsContainer = document.querySelector(
  ".js-player-cards-container"
); // space of player cards: bind variable with HTML section tag

const chipCountContainer = document.querySelector(".js-chip-count-container");
const potContainer = document.querySelector(".js-pot-container");

// program state
let deckId = null;
let playerCards = [];
let playerChips = 100;
let computerChips = 100;
let pot = 0;

function renderPlayerCards() {
  let html = "";

  for (let card of playerCards) {
    html += `<img src = "${card.image}" alt="${card.code}" />`;
  }
  // instert 'html' into section:js-player-cards-container
  playerCardsContainer.innerHTML = html;
}

function renderChips() {
  chipCountContainer.innerHTML = `
  <div class="chip-count">Player: ${playerChips}</div>
  <div class="chip-count">Computer: ${computerChips}</div>

  `;
}

function renderPot() {
  potContainer.innerHTML = `
      <div class="chip-count">Pot: ${pot}</div>

    `;
}
// rendering all datas at the same time. simplify of code > tiny speed loss
function render() {
  renderPlayerCards();
  renderChips();
  renderPot();
}

function drawAndRenderPlayerCards() {
  if (deckId == null) return;
  fetch(`https://www.deckofcardsapi.com/api/deck/${deckId}/draw/?count=2`)
    .then((data) => data.json())
    .then(function (response) {
      playerCards = response.cards;
      render();
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
render();
