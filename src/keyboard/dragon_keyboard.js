class Keyboard {
  constructor(map) {
    this.KEYBOARD_COLUMNS = 8;
    this.KEYBOARD_ROWS = 7;
    this.translationMap = map;
    this.rolloverMap = this.blankMap();
    if (map.length !== 8) {
      throw new EvalError("invalid keyboard map " + map);
    } else {
      let result = true;
      map.forEach((subMap) => {
        result = result && (subMap.length === 7);
        for(let index=0; index<this.KEYBOARD_ROWS; ++index) {
          if (typeof subMap[index] === "string") {
            subMap[index] = subMap[index].charCodeAt(0);
          }
        }
      });
      if (!result) {
        throw new EvalError("invalid keyboard map " + map);
      }
    }
  }

  blankMap() {
    let blank = [];
    for (let index = 0; index < this.KEYBOARD_COLUMNS; ++index) {
      blank.push(0xff);
    }
    return blank;
  }

  keypress(codeSet) {
    this.rolloverMap = this.blankMap();
    codeSet.forEach((code) => {
      this.keypressSingle(code);
    })
  }

  keypressSingle(code) {
    for (let column = 0; column < this.KEYBOARD_COLUMNS; ++column) {
      let mask = 0x80;
      let rowResult = this.rolloverMap[column];
      for (let row = 0; row < this.KEYBOARD_ROWS; ++row) {
        mask = mask >> 1;
        if (code === this.translationMap[column][row]) {
          rowResult = rowResult ^ mask;
        }
      }
      this.rolloverMap[column] = rowResult;
    }
  }
}

class KeyboardHandler {
  constructor(map) {
    this.keyboard = new Keyboard(map);
    this.keys = new Set()
    this.mapSet = this.buildKeySet(map);
  }

  buildKeySet(map) {
    let result = new Set();
    map.forEach((submap) => {
      submap.forEach((key) => {
        if (typeof key !== 'undefined') {
          if (typeof key === 'string') {
            result.add(key.charCodeAt(0));
          } else {
            result.add(key);
          }
        }
      });
    });
    return result;
  }

  keydown(event) {
    if (this.mapSet.has(event.code)) {
      this.keys.add(event.code);
    }
    this.keyboard.keypress(this.keys);
  }

  keyup(event) {
    if (this.keys.has(event.code)) {
      this.keys.delete(event.code);
    }
    this.keyboard.keypress(this.keys);
  }

  getRollover() {
    return this.keyboard.rolloverMap;
  }
}

defaultMap = [
  [0x13,'X','P','H','@','8','0'],
  [0x19,'Y','Q','I','a','9','1'],
  [0x27,'Z','R','J','B',':','2'],
  [undefined,0x38,'S','K','C',';','3'],
  [undefined,0x40,'T','L','D',',','4'],
  [undefined,0x37,'U','M','E','-','5'],
  [undefined,0x39,'V','N','F','.','6'],
  [0x16,' ','W','O','G','/','7'],
];

module.exports = {Keyboard, KeyboardHandler, defaultMap};
