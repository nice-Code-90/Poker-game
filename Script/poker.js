const newGameButton = document.querySelector(".js-new-game-button");
const potContainer = document.querySelector(".js-pot-container");

const playerCardsContainer = document.querySelector(
  ".js-player-cards-container"
);

const playerchipContainer = document.querySelector(".js-player-chip-container");
const playerStatusContainer = document.querySelector(
  ".js-player-status-container"
);
const betArea = document.querySelector(".js-bet-area");
const betSlider = document.querySelector("#bet-amount");
const betSliderValue = document.querySelector(".js-slider-value");
const betButton = document.querySelector(".js-bet-button");
const betPotButton = document.querySelector(".js-betpot");
const bet25Button = document.querySelector(".js-bet25");
const bet50Button = document.querySelector(".js-bet50");

const computerCardsContainer = document.querySelector(
  ".js-computer-cards-container"
);

const computerchipContainer = document.querySelector(
  ".js-computer-chip-container"
);
const computerStatusContainer = document.querySelector(
  ".js-computer-status-container"
);
const computerActionContainer = document.querySelector(".js-computer-action");

const communityCardsContainer = document.querySelector(".js-community-cards");

// program state

//using destructure array for initialize
let {
  deckID,
  playerCards,
  computerCards,
  communityCards, // flop-turn-river
  computerAction,
  playerChips,
  playerBets, // players bid on actual round
  playerStatus, //player status information(won, losed, draw, folded)
  computerChips,
  computerBets, // computers bid on actual round
  computerStatus, // computer status info
  playerBetPlaced, // player has bet
  timeoutIds, //setTimeout ID list
} = getInitialState();

function getPot() {
  return playerBets + computerBets;
}

function getInitialState() {
  return {
    deckID: null,
    playerCards: [],
    computerCards: [],
    communityCards: [],
    computerAction: null,
    playerChips: 100,
    playerBets: 0,
    playerStatus: "",
    computerChips: 100,
    computerBets: 0,
    computerStatus: "",
    playerBetPlaced: false,
    timeoutIds: [],
  };
}

function initialize() {
  for (let id of timeoutIds) {
    clearTimeout(id);
  }
  ({
    deckID,
    playerCards,
    computerCards,
    computerAction,
    communityCards,
    playerChips,
    playerBets,
    playerStatus,
    computerChips,
    computerBets,
    computerStatus,
    playerBetPlaced,
    timeoutIds,
  } = getInitialState());
  betSlider.value = 1;
}
//

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
    html += `<img src = "${card.image}" alt="${card.code}" class="card-image" />`;
  }

  container.innerHTML = html;
}

function renderAllCards() {
  renderCardsInContainer(playerCards, playerCardsContainer);
  renderCardsInContainer(computerCards, computerCardsContainer);
  renderCardsInContainer(communityCards, communityCardsContainer);
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
      <div class="chip-count">Pot: ${getPot()}</div>

    `;
}

function renderActions() {
  computerActionContainer.innerHTML = computerAction ?? ""; // ?? operator: if statement is false:
  // variable = ""
}
function renderStatusInfo() {
  playerStatusContainer.innerHTML = playerStatus;
  computerStatusContainer.innerHTML = computerStatus;
}

// rendering all datas at the same time. simplify of code > tiny speed loss
function render() {
  renderAllCards();
  renderChips();
  renderPot();
  renderSlider();
  renderActions();
  renderStatusInfo();
}

async function drawPlayerCards() {
  if (deckID == null) return;
  const data = await fetch(
    `https://www.deckofcardsapi.com/api/deck/${deckID}/draw/?count=2`
  );
  const response = await data.json();
  playerCards = response.cards;
}

function postBlinds() {
  playerChips -= 1;
  playerBets += 1;
  computerChips -= 2;
  computerBets += 2;
  render();
}

//starting new hand
async function startHand() {
  postBlinds(); // decrease SMallBlind and BigBlind from players
  const data = await fetch(
    "https://www.deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1"
  );
  const response = await data.json();

  deckID = response.deck_id;
  await drawPlayerCards();
  render();
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

function endHand(winner = null) {
  const id = setTimeout(() => {
    if (computerAction === ACTIONS.Fold || winner === STATUS.Player) {
      playerChips += getPot();
    } else if (winner === STATUS.Computer) {
      computerChips += getPot();
    } else if (winner === STATUS.Draw) {
      playerChips += playerBets;
      computerChips += computerBets;
    }
    playerBets = 0;
    computerBets = 0;
    render();
  }, 2000);
  timeoutIds.push(id); // adding timeoutIDs to state of program
}

const SHOWDOWN_API_PREFIX = "https://api.pokerapi.dev/v1/winner/texas_holdem";

function cardsToString(cards) {
  return cards
    .map((x) => (x.code[0] === "0" ? "1" + x.code : x.code))
    .toString();
}

async function getWinner() {
  //https://api.pokerapi.dev/v1/winner/texas_holdem?cc=AC,KD,QH,JS,7C&pc[]=10S,8C&pc[]=3S,2C&pc[]=QS,JH
  const cc = cardsToString(communityCards); //community cards
  const pc0 = cardsToString(playerCards);
  const pc1 = cardsToString(computerCards);
  const data = await fetch(
    `${SHOWDOWN_API_PREFIX}?cc=${cc}&pc[]=${pc0}&pc[]=${pc1}`
  );
  const response = await data.json();
  const winners = response.winners;
  if (winners.length === 2) {
    return WINNER.Draw;
  } else if (winners[0].cards === pc0) {
    return STATUS.Player;
  } else {
    return STATUS.Computer;
  }
}

async function showdown() {
  const data = await fetch(
    `https://www.deckofcardsapi.com/api/deck/${deckID}/draw/?count=5`
  );
  const response = await data.json();
  communityCards = response.cards;
  render();
  const winner = await getWinner();
  return winner;
}

async function computerMoveAfterBet() {
  const data = await fetch(
    `https://www.deckofcardsapi.com/api/deck/${deckID}/draw/?count=2`
  );
  const response = await data.json();
  if (getPot() === 4) {
    computerAction = ACTIONS.Check;
  } else if (shouldComputerCall(response.cards)) {
    computerAction = ACTIONS.Call;
  } else {
    computerAction = ACTIONS.Fold;
  }
  if (computerAction === ACTIONS.Call) {
    //player: bet (blinds + player bet)
    //computer: 2
    // Bet + 2 = Pot
    // computer payet 2$ as blinds, he should call Bet - 2$
    // Bet - 2 = Pot - 4

    const difference = playerBets - computerBets;
    computerChips -= difference;
    computerBets += difference;
    if (playerBets > computerChips + computerBets) {
      //Does computer has less chips than player-betsize?
      let chipsToReturnToPlayer = playerBets - computerChips - computerBets; // these chips mooving back to player
      playerBets -= chipsToReturnToPlayer; // decreasing player-bet to the amount of computerChips
      playerChips += chipsToReturnToPlayer;
    }
  }

  if (computerAction === ACTIONS.Check || ACTIONS.Call) {
    computerCards = response.cards;
    render();
    const winner = await showdown();
    if (winner === STATUS.Player) {
      playerStatus = STATUS.Player;
    } else if (winner === STATUS.Computer) {
      computerStatus = STATUS.Computer;
    } else if (winner === STATUS.Draw) {
      computerStatus = STATUS.Draw;
      playerStatus = STATUS.Draw;
    }
    endHand(winner);
  } else {
    // Computer Folded
    playerStatus = STATUS.Player;

    render();
    endHand();
  }
}

function bet() {
  const betValue = Number(betSlider.value);

  playerChips -= betValue;
  playerBetPlaced = true; //player has bet: state of game changes
  playerBets += betValue;
  render();

  //villains react
  computerMoveAfterBet();
}

function getPlayerPotBet() {
  let difference = computerBets - playerBets;
  return Math.min(playerChips, getPot() + difference * 2);
}

function setSliderValue(percentage) {
  let betsize = null;
  if (typeof percentage === "number") {
    betsize = Math.floor((playerChips * percentage) / 100);
  } else {
    betsize = getPlayerPotBet();
  }
  betSlider.value = betsize;
  render();
}

newGameButton.addEventListener("click", startGame);

//betSlider.addEventListener("change", render);
betSlider.addEventListener("input", render);
betPotButton.addEventListener("click", () => setSliderValue());
bet25Button.addEventListener("click", () => setSliderValue(25));
bet50Button.addEventListener("click", () => setSliderValue(50));

betButton.addEventListener("click", bet);
initialize();
render();
