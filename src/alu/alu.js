/**
 * Creates an arithmetic logic unit
 * @class
 */
class Alu {
  /**
   * @constructor
   * @param {ControlRegister} controlRegister
   */
  constructor(controlRegister) {
    this.cc = controlRegister;

    this.add8 = (reg1, reg2, c) => {
      if (c === undefined) {
        c = 0;
      }
      const result = (reg1 + reg2 + c);
      const masked = result & 0xff;
      const half = (reg1 & 0xf) + (reg2 & 0xf) + c;
      const signMask = (reg1 ^ reg2) ^ 0x80;
      this.cc.negative((result & 0x80) !== 0);
      this.cc.carry(result !== masked);
      this.cc.zero(masked === 0);
      this.cc.halfcarry(half > 0xf);
      this.cc.overflow(((signMask & (reg2 ^ masked)) & 0x80) !== 0);
      return masked;
    };

    this.add16 = (reg1, reg2) => {
      const result = (reg1 + reg2);
      const masked = result & 0xffff;
      const signMask = (reg1 ^ reg2) ^ 0x8000;
      this.cc.negative((result & 0x8000) !== 0);
      this.cc.carry(result !== masked);
      this.cc.zero(masked === 0);
      this.cc.overflow(((signMask & (reg2 ^ masked)) & 0x8000) !== 0);
      return masked;
    };

    this.sub8 = (reg1, reg2, c) => {
      if (c === undefined) {
        c = 0;
      }
      const result = reg1 - reg2 - c;
      const masked = result & 0xff;
      let signMask;
      if (c === 0) {
        signMask = (reg1 ^ reg2);
      } else {
        signMask = (reg1 ^ reg2) ^ 0x80;
      }
      this.cc.negative((result & 0x80) !== 0);
      this.cc.carry(result !== masked);
      this.cc.zero(masked === 0);
      this.cc.overflow(((signMask & (reg1 ^ masked)) & 0x80) !== 0);
      return masked;
    };

    this.sub16 = (reg1, reg2) => {
      const result = reg1 - reg2;
      const masked = result & 0xffff;
      const signMask = (reg1 ^ reg2);
      this.cc.negative((result & 0x8000) !== 0);
      this.cc.carry(result !== masked);
      this.cc.zero(masked === 0);
      this.cc.overflow(((signMask & (reg1 ^ masked)) & 0x8000) !== 0);
      return masked;
    };

    this.and = (reg1, value, test) => {
      if (test === undefined) test = true;
      const result = reg1 & value;
      if (test) {
        this.cc.negative((result & 0x80) !== 0);
        this.cc.overflow(false);
        this.cc.zero(result === 0);
      }
      return result;
    };
  }
}

module.exports = {Alu};
