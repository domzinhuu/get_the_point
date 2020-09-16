function createMethodsUtils(state) {
  function getRandonPositionX() {
    const { width } = state.screen;
    return getRandonNumber(0, width);
  }

  function getRandonPositionY() {
    const { height } = state.screen;
    return getRandonNumber(0, height);
  }

  function getRandonFruitType(typeArray) {
    const typeIndex = getRandonNumber(0, typeArray.length - 1);

    return typeArray[typeIndex];
  }

  function getFruitPointsByType(type, fruitTypes) {
    const selectedType = fruitTypes[type];
    return selectedType;
  }

  function getRandonNumber(min, max) {
    const numberRand = Math.floor(Math.random() * (max - min) + min);
    return numberRand;
  }

  function generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (
      c
    ) {
      var r = (Math.random() * 16) | 0,
        v = c == "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  return {
    getRandonPositionX,
    getRandonPositionY,
    getRandonFruitType,
    getFruitPointsByType,
    getRandonNumber,
    generateUUID,
  };
}
export default createMethodsUtils;
