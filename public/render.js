function renderScreen(
  gameScreen,
  game,
  requestAnimationFrame,
  currentPlayerId
) {
  const context = gameScreen.getContext("2d");
  context.fillStyle = "white";
  context.globalAlpha = 1;
  context.clearRect(0, 0, game.state.screen.width, game.state.screen.height);
  Object.keys(game.state.players).forEach((key) => {
    const player = game.state.players[key];

    if (player) {
      context.fillStyle = "black";
      context.globalAlpha = 0.1;
      context.fillRect(player.positionX, player.positionY, 1, 1);
    }
  });

  Object.keys(game.state.fruits).forEach((key) => {
    const fruit = game.state.fruits[key];

    context.fillStyle =
      fruit.fruitType === "random"
        ? "#977EF2"
        : fruit.fruitType === "special"
        ? "#F25C05"
        : "green";
    context.globalAlpha = 1;
    context.fillRect(fruit.positionX, fruit.positionY, 1, 1);
  });

  const currentPlayer = game.state.players[currentPlayerId];

  if (currentPlayer) {
    context.fillStyle = "blue";
    context.globalAlpha = 1;
    context.fillRect(currentPlayer.positionX, currentPlayer.positionY, 1, 1);
  }

  requestAnimationFrame(() => {
    renderScreen(gameScreen, game, requestAnimationFrame, currentPlayerId);
  });
}

export default renderScreen;
