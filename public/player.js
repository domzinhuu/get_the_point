import createUtils from "./utils.js";

function createPlayer(playerId, width, height) {
  const utils = createUtils();
  const positionX = utils.getRandonPositionX(width);
  const positionY = utils.getRandonPositionY(height);
  const ready = false;

  return {
    playerId,
    positionX,
    positionY,
    ready,
  };
}

export default createPlayer;
