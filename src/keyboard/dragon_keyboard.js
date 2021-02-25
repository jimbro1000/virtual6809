class Keyboard {
  constructor(map) {
    this.KEYBOARD_COLUMNS = 8;
    this.KEYBOARD_ROWS = 7;
    this.translationMap = map;
    if (map.length !== 8) {
      throw new EvalError("invalid keyboard map " + map);
    } else {
      let result = true;
      map.forEach((submap) => {
        result = result && (submap.length === 7);
        for(let index=0; index<this.KEYBOARD_ROWS; ++index) {
          if (typeof submap[index] === "string") {
            submap[index] = submap[index].charCodeAt(0);
          }
        }
      });
      if (!result) {
        throw new EvalError("invalid keyboard map " + map);
      }
    }
  }

  keypress(code) {
    let result = [];
    const blank = 0xff;
    for (let column = 0; column < this.KEYBOARD_COLUMNS; ++column) {
      let mask = 0x80;
      let rowResult = blank;
      for (let row = 0; row < this.KEYBOARD_ROWS; ++row) {
        mask = mask >> 1;
        if (code === this.translationMap[column][row]) {
          rowResult = rowResult ^ mask;
        }
      }
      result.push(rowResult);
    }
    return result;
  }
}

defaultMap = [
  [0x13,'X','P','H','@','8','0'],
  [0x19,'Y','Q','I','A','9','1'],
  [0x27,'Z','R','J','B',':','2'],
  [undefined,0x38,'S','K','C',';','3'],
  [undefined,0x40,'T','L','D',',','4'],
  [undefined,0x37,'U','M','E','-','5'],
  [undefined,0x39,'V','N','F','.','6'],
  [0x16,' ','W','O','G','/','7']
];

module.exports = {Keyboard, defaultMap};
