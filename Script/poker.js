const newGameButton = document.querySelector(".js-new-game-button");
const playerCardsContainer = document.querySelector(
  ".js-player-cards-container"
); // space of player cards: bind variable with HTML section tag

const chipCountContainer = document.querySelector(".js-chip-count-container");
const potContainer = document.querySelector(".js-pot-container");
const betArea = document.querySelector(".js-bet-area");
const betSlider = document.querySelector("#bet-amount");
const betSliderValue = document.querySelector(".js-slider-value");
const betButton = document.querySelector(".js-bet-button");

// program state

//using destructure array for initialize
let {
  deckID,
  playerCards,
  computerCards,
  playerChips,
  computerChips,
  playerBetPlaced, // player has bet
  pot,
} = getInitialState();

function getInitialState() {
  return {
    deckID: null,
    playerCards: [],
    playerChips: 100,

    computerChips: 100,
    playerBetPlaced: false,
    pot: 0,
  };
}

function initialize() {
  ({ deckID, playerCards, playerChips, computerChips, playerBetPlaced, pot } =
    getInitialState());
}

//conditions for player bet
function canBet() {
  return (
    playerCards.length === 2 && playerChips > 0 && playerBetPlaced === false
  );
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

function postBlinds() {
  playerChips -= 1;
  computerChips -= 2;
  pot += 3;
  render();
}

//starting new hand
function startHand() {
  postBlinds(); // decrease SMallBlind and BigBlind from players
  fetch("https://www.deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1")
    .then((data) => data.json())
    .then(function (response) {
      deckId = response.deck_id;
      drawAndRenderPlayerCards(); // todo: refactor async-await
    });
}

// one game include one hand
function startGame() {
  initialize();
  startHand();
}

function shouldComputerCall() {
  if (computerCards.length !== 2) return false;
  const card1Code = computerCards[0].code; // e.g AC, 0H ...
  const card2Code = computerCards[1].code;
  const card1Value = card1Code[0];
  const card2Value = card1Code[0];
  const card1Suit = card1Code[1];
  const card2Suit = card1Code[1];

  return (
    card1Value === card2Value || // computer has a pair
    ["J", "Q", "K", "A", "0"].includes(card1Code) || // computer has a Highcard (>T)
    ["J", "Q", "K", "A", "0"].includes(card2Code) ||
    (Math.abs(Number(card1Value) - Number(card2Value)) <= 2 &&
      card1Suit === card2Suit) // computer has suited connectors
  );
}

function computerMoveAfterBet() {
  fetch(`https://www.deckofcardsapi.com/api/deck/${deckId}/draw/?count=2`)
    .then((data) => data.json())
    .then(function (response) {
      computerCards = response.cards;
      alert(shouldComputerCall() ? "call" : "Fold");
      console.log(computerCards);
      // render();
    });
}

function bet() {
  // pot + betsize
  const betValue = Number(betSlider.value);
  pot += betValue;
  playerChips -= betValue;
  playerBetPlaced = true; //player has bet: state of game changes
  render();

  //villains react
  computerMoveAfterBet();
}

newGameButton.addEventListener("click", startGame);

betSlider.addEventListener("change", render);
betButton.addEventListener("click", bet);
initialize();
render();
