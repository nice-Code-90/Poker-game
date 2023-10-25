const newGameButton = document.querySelector(".js-new-game-button");
const potContainer = document.querySelector(".js-pot-container");
const betArea = document.querySelector(".js-bet-area");
const betSlider = document.querySelector("#bet-amount");
const betSliderValue = document.querySelector(".js-slider-value");
const betButton = document.querySelector(".js-bet-button");

const playerCardsContainer = document.querySelector(
  ".js-player-cards-container"
);

const playerchipContainer = document.querySelector(".js-player-chip-container");
const computerCardsContainer = document.querySelector(
  ".js-computer-cards-container"
);

const computerchipContainer = document.querySelector(
  ".js-computer-chip-container"
);
const computerActionContainer = document.querySelector(".js-computer-action");

// program state

//using destructure array for initialize
let {
  deckID,
  playerCards,
  computerCards,
  computerAction,
  playerChips,
  playerBets, // players bid on actual round
  computerChips,
  computerBets, // computers bid on actual round
  playerBetPlaced, // player has bet
  pot,
} = getInitialState();

function getInitialState() {
  return {
    deckID: null,
    playerCards: [],
    computerCards: [],
    computerAction: null,
    playerChips: 100,
    playerBets: 0,
    computerChips: 100,
    computerBets: 0,
    playerBetPlaced: false,
    pot: 0,
  };
}

function initialize() {
  ({
    deckID,
    playerCards,
    computerCards,
    computerAction,
    playerChips,
    playerBets,
    computerChips,
    computerBets,
    playerBetPlaced,
    pot,
  } = getInitialState());
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
function renderCardsInContainer(cards, container) {
  let html = "";

  for (let card of cards) {
    html += `<img src = "${card.image}" alt="${card.code}" />`;
  }

  container.innerHTML = html;
}

function renderAllCards() {
  renderCardsInContainer(playerCards, playerCardsContainer);
  renderCardsInContainer(computerCards, computerCardsContainer);
}

function renderChips() {
  playerchipContainer.innerHTML = `
  <div class="chip-count">Player: ${playerChips} $</div>

  `;
  computerchipContainer.innerHTML = `
<div class="chip-count">Computer: ${computerChips} $</div>`;
}

function renderPot() {
  potContainer.innerHTML = `
      <div class="chip-count">Pot: ${pot}</div>

    `;
}

function renderActions() {
  computerActionContainer.innerHTML = computerAction ?? ""; // ?? operator: if statement is false:
  // variable = ""
}

// rendering all datas at the same time. simplify of code > tiny speed loss
function render() {
  renderAllCards();
  renderChips();
  renderPot();
  renderSlider();
  renderActions();
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
  playerBets += 1;
  computerChips -= 2;
  computerBets += 2;
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

function shouldComputerCall(computerCards) {
  if (computerCards.length !== 2) return false;
  const card1Code = computerCards[0].code; // e.g AC, 0H ...
  const card2Code = computerCards[1].code;
  const card1Value = card1Code[0];
  const card2Value = card2Code[0];
  const card1Suit = card1Code[1];
  const card2Suit = card2Code[1];

  return (
    card1Value === card2Value || // computer has a pair
    ["J", "Q", "K", "A", "0"].includes(card1Value) || // computer has a Highcard (>T)
    ["J", "Q", "K", "A", "0"].includes(card2Value) ||
    (Math.abs(Number(card1Value) - Number(card2Value)) <= 2 &&
      card1Suit === card2Suit) // computer has suited connectors
  );
}

function computerMoveAfterBet() {
  fetch(`https://www.deckofcardsapi.com/api/deck/${deckId}/draw/?count=2`)
    .then((data) => data.json())
    .then(function (response) {
      if (pot === 4) {
        computerAction = "Check";
        computerCards = response.cards;
      } else if (shouldComputerCall(response.cards)) {
        computerAction = "Call";
        computerCards = response.cards;
        //player: bet (blinds + player bet)
        //computer: 2
        // Bet + 2 = Pot
        // computer payet 2$ as blinds, he should call Bet - 2$
        // Bet - 2 = Pot - 4
        const difference = playerBets - computerBets;
        computerChips -= difference;
        computerBets += difference;
        pot += difference;
      } else {
        computerAction = "Fold";
      }
      render();
    });
}

function bet() {
  // pot + betsize
  const betValue = Number(betSlider.value);
  pot += betValue;
  playerChips -= betValue;
  playerBetPlaced = true; //player has bet: state of game changes
  playerBets += betValue;
  render();

  //villains react
  computerMoveAfterBet();
}

newGameButton.addEventListener("click", startGame);

betSlider.addEventListener("change", render);
betButton.addEventListener("click", bet);
initialize();
render();
