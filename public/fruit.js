import createUtils from "./utils.js";

const utils = createUtils();
const fruitTypeArray = [
  { type: "normal", point: 1 },
  { type: "normal", point: 1 },
  { type: "normal", point: 1 },
  { type: "normal", point: 1 },
  { type: "normal", point: 1 },
  { type: "random", point: -5 },
  { type: "random", point: -5 },
  { type: "random", point: -5 },
  { type: "special", point: 5 },
  { type: "special", point: 5 },
];

function createFruit(width, height) {
  const randomFruitType = getRandonFruitType();

  return {
    fruitId: utils.generateUUID(),
    fruitType: randomFruitType.type,
    positionX: utils.getRandonPositionX(width),
    positionY: utils.getRandonPositionY(height),
    point: randomFruitType.point,
  };
}

function getRandonFruitType() {
  const index = utils.getRandonNumber(0, fruitTypeArray.length);
  return fruitTypeArray[index];
}

export default createFruit;
