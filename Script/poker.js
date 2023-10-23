const newGameButton = document.querySelector(".js-new-game-button");
const playerCardsContainer = document.querySelector(
  ".js-player-cards-container"
); // space of player cards: bind variable with HTML section tag

const chipCountContainer = document.querySelector(".js-chip-count-container");
const potContainer = document.querySelector(".js-pot-container");
const betArea = document.querySelector(".js-bet-area");
const betSlider = document.querySelector("#bet-amount");
const betSliderValue = document.querySelector(".js-slider-value");

// program state

//using destructure array for initialize
let { deckID, playerCards, playerChips, computerChips, pot } =
  getInitialState();

function getInitialState() {
  return {
    deckID: null,
    playerCards: [],
    playerChips: 100,
    computerChips: 100,
    pot: 0,
  };
}

function initialize() {
  ({ deckID, playerCards, playerChips, computerChips, pot } =
    getInitialState());
}

//conditions for player bet
function canBet() {
  return playerCards.length === 2 && playerChips > 0 && pot === 0;
}

function renderSlider() {
  if (canBet()) {
    betArea.classList.remove("invisible");
    betSlider.setAttribute("max", playerChips);
    betSliderValue.innerText = betSlider.value;
  } else {
    betArea.classList.add("invisible");
  }
}

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
  renderSlider();
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

betSlider.addEventListener("change", render);
initialize();
render();
