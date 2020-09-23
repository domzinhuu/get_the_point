import createUtils from "./utils.js";
import createFruit from "./fruit.js";
import createPlayer from "./player.js";

function createGame() {
  let startGameInterval;
  let gameStarted = false;
  const observers = [];
  const state = {
    acceptMoves: ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"],
    players: {},
    score: [],
    fruits: {},
    screen: {
      width: 35,
      height: 30,
    },
    voteOptions: ["10", "20", "30", "40", "50", "100"],
  };

  const utils = createUtils();

  function subscribe(observerFunction) {
    observers.push(observerFunction);
  }

  function startGame() {
    state.score = state.score.map((item) => {
      item.score = 0;
      return item;
    });

    notifyAll({
      type: "update-score",
      scoreList: state.score,
    });

    gameStarted = true;
    runFruitLoop(2000);
  }

  function stopGame() {
    clearInterval(startGameInterval);

    Object.keys(state.players).forEach((key) => {
      state.players[key].ready = false;
    });

    removeAllFruit();
    notifyAll({
      type: "remove-all-fruit",
      state,
    });
  }

  function clearRoom() {
    clearInterval(startGameInterval);
    gameStarted = false;
    state.players = {};
    state.fruits = [];
    state.fruits = {};

    notifyAll({
      type: "clear-game",
      state,
    });
  }

  function notifyAll(command) {
    for (const observerFunction of observers) {
      observerFunction(command);
    }
  }

  function setState(newState, propertieName) {
    if (propertieName) {
      Object.assign(state[propertieName], newState);
    } else {
      Object.assign(state, newState);
    }
  }

  function checkToStartGame(command) {
    state.players[command.playerId].ready = command.ready;
    const playerIds = Object.keys(state.players);
    let allReady = true;

    playerIds.forEach((key) => {
      if (state.players[key].ready) {
        return;
      }

      allReady = false;
    });

    if (totalPlayers() > 1 && allReady) {
      startGame();
      state.pointToWin = parseInt(getThePointToWin(), 10);

      resetPlayerPart("vote");

      notifyAll({
        type: "game-starting",
        state: state,
      });
    } else {
      notifyAll({
        type: "ready",
        playerId: command.playerId,
        ready: command.ready,
        players: state.players,
      });
    }
  }

  function playerVoted(command) {
    state.players[command.playerId].vote = command.vote;
    notifyAll({
      type: "player-voted",
      state,
    });
  }

  function addPlayer(command) {
    let player = null;
    const { width, height } = state.screen;

    if (!command.player) {
      player = createPlayer(command.playerId, width, height);
      player.name = command.playerName;
    } else {
      player = command.player;
    }

    state.players[command.playerId] = player;

    notifyAll({
      type: "add-player",
      playerId: command.playerId,
      player,
    });

    state.score.push({
      playerId: command.playerId,
      playerName: command.playerName,
      score: 0,
    });
    notifyAll({
      type: "update-score",
      scoreList: state.score,
    });
  }

  function removePlayer(command) {
    delete state.players[command.playerId];
    notifyAll({
      type: "remove-player",
      playerId: command.playerId,
    });

    const playerScore = state.score.find(
      (item) => item.playerId === command.playerId
    );

    const index = state.score.indexOf(playerScore);
    state.score.splice(index, 1);

    notifyAll({
      type: "update-score",
      scoreList: state.score,
    });
  }

  function addFruit(command) {
    let fruit = null;
    const { width, height } = state.screen;

    if (!command) {
      fruit = createFruit(width, height);
    } else {
      fruit = command.fruit;
    }

    const canAddFruit = command ? command.gameStarted : gameStarted;

    if (canAddFruit) {
      state.fruits[fruit.fruitId] = fruit;
    }

    notifyAll({ type: "update-fruit", fruits: state.fruits });
  }

  function removeFruit(command) {
    delete state.fruits[command.fruitId];
    if (gameStarted) {
      const fruitFrequency = utils.getRandonNumber(1000, 5000);
      setTimeout(() => {
        addFruit();
      }, fruitFrequency);
    }
  }

  function removeAllFruit() {
    state.fruits = {};
  }

  function addScore(command) {
    const player = state.score.find((p) => p.playerId === command.playerId);

    if (player) {
      const index = state.score.indexOf(player);
      state.score[index].score += command.point;
      reorderScore();

      notifyAll({
        type: "update-score",
        scoreList: state.score,
      });

      checkForTheWinner();
    }
  }

  function movePlayer(command) {
    notifyAll(command);

    const acceptMoves = {
      ArrowUp: (player) => {
        player.positionY = Math.max(player.positionY - 1, 0);
      },
      ArrowLeft: (player) => {
        player.positionX = Math.max(player.positionX - 1, 0);
      },
      ArrowDown: (player) => {
        player.positionY = Math.min(
          player.positionY + 1,
          state.screen.height - 1
        );
      },
      ArrowRight: (player) => {
        player.positionX = Math.min(
          player.positionX + 1,
          state.screen.width - 1
        );
      },
    };

    const { keyPressed } = command;
    const player = state.players[command.playerId];
    const moveFunction = acceptMoves[keyPressed];

    if (player && moveFunction) {
      moveFunction(player);
      checkForFruitColision(command.playerId);
    }
  }

  function checkForFruitColision(playerId) {
    const player = state.players[playerId];

    Object.keys(state.fruits).forEach((key) => {
      const fruit = state.fruits[key];

      if (
        fruit &&
        player.positionY === fruit.positionY &&
        player.positionX === fruit.positionX
      ) {
        addScore({ playerId, point: fruit.point });
        removeFruit({ fruitId: key });
      }
    });
  }

  function finishMatch(winnerPlayer) {
    gameStarted = false;
    stopGame();
    notifyAll({
      type: "finish-match",
      playerId: winnerPlayer.playerId,
    });
  }

  // Private functions
  function checkForTheWinner() {
    const winnerPlayer = state.score.find(
      (player) => player.score >= state.pointToWin
    );

    if (winnerPlayer) {
      winnerPlayer.playerName = state.players[winnerPlayer.playerId].name;
      finishMatch(winnerPlayer);
    }
  }

  function reorderScore() {
    state.score = state.score.sort((player1, player2) => {
      if (player1.score < player2.score) {
        return 1;
      } else {
        return -1;
      }
    });
  }

  function runFruitLoop(period) {
    if (gameStarted) {
      const fruitFrequency = utils.getRandonNumber(1000, 3000);
      setTimeout(() => {
        addFruit();
      }, fruitFrequency);
    }
  }

  function resetPlayerPart(field) {
    Object.keys(state.players).forEach((key) => {
      {
        delete state.players[key][field];
      }
    });
  }

  function totalPlayers() {
    return Object.keys(state.players).length;
  }

  function getThePointToWin() {
    const votes = {};
    let votesArray = [];

    Object.keys(state.players).forEach((key) => {
      const vote = state.players[key].vote;
      if (votes[vote]) {
        votes[vote]++;
      } else {
        votes[vote] = 1;
      }
    });

    Object.keys(votes).forEach((key) => {
      votesArray.push({ key, value: votes[key] });
    });

    votesArray = votesArray.sort((a, b) => {
      if (a.value - b.value) {
        return 1;
      } else {
        return -1;
      }
    });

    return votesArray[votesArray.length - 1].key;
  }

  return {
    startGame,
    clearRoom,
    setState,
    checkToStartGame,
    addPlayer,
    removePlayer,
    removeAllFruit,
    movePlayer,
    checkForFruitColision,
    subscribe,
    playerVoted,
    state,
  };
}

export default createGame;
