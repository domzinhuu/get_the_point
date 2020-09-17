function createMethodsUtils() {
  function getRandonPositionX(maxValue) {
    return getRandonNumber(0, maxValue);
  }

  function getRandonPositionY(maxValue) {
    return getRandonNumber(0, maxValue);
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
    getRandonNumber,
    generateUUID,
  };
}
export default createMethodsUtils;
