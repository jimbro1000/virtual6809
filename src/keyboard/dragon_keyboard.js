class Keyboard {
  constructor(map, pia) {
    this.KEYBOARD_COLUMNS = 8;
    this.KEYBOARD_ROWS = 7;
    this.translationMap = map;
    this.rolloverMap = this.blankMap();
    this.pia = pia;
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
    if (typeof this.pia !== 'undefined') {
      this.pia.bindListener('pdb_write', this.readRow(), 0x7f);
    }
  }

  readRow() {
    const columnSelect = this.pia.readPdb();
    let column;
    switch(columnSelect) {
      case 0x40:
        column = 0;
        break;
      case 0x20:
        column = 1;
        break;
      case 0x10:
        column = 2;
        break;
      case 0x8:
        column = 3;
        break;
      case 0x4:
        column = 4;
        break;
      case 0x2:
        column = 5;
        break;
      default:
        column = 6;
    }
    this.pia.writePda(this.rolloverMap[column]);
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
    if (this.mapSet.has(event.keyCode)) {
      this.keys.add(event.keyCode);
    }
    this.keyboard.keypress(this.keys);
  }

  keyup(event) {
    if (this.keys.has(event.keyCode)) {
      this.keys.delete(event.keyCode);
    }
    this.keyboard.keypress(this.keys);
  }

  getRollover() {
    return this.keyboard.rolloverMap;
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
  [0x16,0x20,'W','O','G','/','7'],
];

module.exports = {Keyboard, KeyboardHandler, defaultMap};
