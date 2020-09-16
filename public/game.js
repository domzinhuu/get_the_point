import createUtils from "./utils.js";

function createGame() {
  let startGameInterval;
  let gameStarted = false;
  const observers = [];
  const state = {
    players: {},
    score: [],
    fruits: {
      types: {
        normal: 1,
        random: { min: -10, max: 5 },
        special: 10,
      },
    },
    screen: {
      width: 35,
      height: 30,
    },
  };

  const _fruitTypeArray = [
    "normal",
    "normal",
    "normal",
    "normal",
    "normal",
    "normal",
    "random",
    "random",
    "special",
    "special",
  ];

  const utils = createUtils(state);

  function subscribe(observerFunction) {
    observers.push(observerFunction);
  }

  function startGame() {
    state.score = state.score.map((item) => {
      item.score = 99;
      return item;
    });

    notifyAll({
      type: "update-score",
      scoreList: state.score,
    });
    gameStarted = true;
    startGameInterval = setInterval(() => {
      const fruitFrequency = utils.getRandonNumber(1000, 5000);

      setTimeout(() => {
        addFruit();
      }, fruitFrequency);
    }, 3000);
  }

  function stopGame() {
    clearInterval(startGameInterval);

    Object.keys(state.players).forEach((key) => {
      state.players[key].ready = false;
    });

    notifyAll({
      type: "remove-all-fruit",
    });
  }

  function notifyAll(command) {
    for (const observerFunction of observers) {
      observerFunction(command);
    }
  }

  function setState(newState) {
    Object.assign(state, newState);
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

    console.log(state.players);
    if (Object.keys(state.players).length > 1 && allReady) {
      startGame();
      notifyAll({
        type: "game-starting",
      });
    } else {
      notifyAll({
        type: "ready",
        playerId: command.playerId,
        ready: command.ready,
      });
    }
  }

  function addPlayer(command) {
    const playerId = command.playerId;
    const positionX = command.positionX || utils.getRandonPositionX();
    const positionY = command.positionY || utils.getRandonPositionY();
    const ready = command.ready;

    state.players[playerId] = {
      positionX,
      positionY,
      ready,
    };

    notifyAll({
      type: "add-player",
      playerId,
      positionX,
      positionY,
      ready,
    });

    state.score.push({ playerId, score: 0 });
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
    let fruit = {};

    if (command) {
      fruit.fruitType = command.fruitType;
      fruit.fruitId = command.fruitId;
      fruit.positionX = command.positionX;
      fruit.positionY = command.positionY;
      fruit.point = command.point;
    } else {
      fruit = mountDefaultFruit();
    }
    const canAddFruit = command ? command.gameStarted : gameStarted;
    if (canAddFruit) {
      state.fruits[fruit.fruitId] = fruit;
    }

    notifyAll({ ...fruit, type: "add-fruit", gameStarted: canAddFruit });
  }

  function removeFruit(command) {
    delete state.fruits[command.fruitId];
    notifyAll({
      type: "remove-fruit",
      fruitId: command.fruitId,
    });
  }

  function removeAllFruit() {
    const types = state.fruits.types;
    state.fruits = { types };
  }

  function addScore(command) {
    const player = state.score.find((p) => p.playerId === command.playerId);

    if (player) {
      const index = state.score.indexOf(player);
      state.score[index].score += command.point;
      state.score = state.score.sort((player1, player2) => {
        if (player1.score < player2.score) {
          return 1;
        } else {
          return -1;
        }
      });
      notifyAll({
        type: "update-score",
        scoreList: state.score,
      });

      const winnerPlayer = state.score.find((player) => player.score >= 50);
      console.log(winnerPlayer);
      if (winnerPlayer) {
        finishMatch(winnerPlayer);
      }
    }
  }

  function finishMatch(winnerPlayer) {
    gameStarted = false;
    stopGame();
    notifyAll({
      type: "finish-match",
      playerId: winnerPlayer.playerId,
    });
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
      r: () => {
        player.positionX = utils.getRandonPositionX();
        player.positionY = utils.getRandonPositionY();
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

    for (const fruitId in state.fruits) {
      if (state.fruits.hasOwnProperty(fruitId)) {
        const fruit = state.fruits[fruitId];

        if (
          player.positionY === fruit.positionY &&
          player.positionX === fruit.positionX
        ) {
          removeFruit({ fruitId });
          addScore({ playerId, point: fruit.point });
        }
      }
    }
  }

  function mountDefaultFruit() {
    const randomFruitType = utils.getRandonFruitType(_fruitTypeArray);

    const fruitPoint = utils.getFruitPointsByType(
      randomFruitType,
      state.fruits.types
    );

    return {
      fruitId: utils.generateUUID(),
      fruitType: randomFruitType,
      positionX: utils.getRandonPositionX(),
      positionY: utils.getRandonPositionY(),
      point: fruitPoint.min
        ? utils.getRandonNumber(fruitPoint.min, fruitPoint.max)
        : fruitPoint,
    };
  }

  return {
    startGame,
    setState,
    checkToStartGame,
    addPlayer,
    removePlayer,
    addFruit,
    removeFruit,
    removeAllFruit,
    movePlayer,
    checkForFruitColision,
    subscribe,
    state,
  };
}

export default createGame;
