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
      if (typeof(test) === 'undefined') test = true;
      const result = reg1 & value;
      if (test) {
        this.cc.negative((result & 0x80) !== 0);
        this.cc.overflow(false);
        this.cc.zero(result === 0);
      }
      return result;
    };

    this.or = (reg1, value, test) => {
      if (typeof(test) === 'undefined') test = true;
      const result = reg1 | value;
      if (test) {
        this.cc.negative((result & 0x80) !== 0);
        this.cc.overflow(false);
        this.cc.zero(result === 0);
      }
      return result;
    };

    this.eor = (reg1, value) => {
      const result = reg1 ^ value;
      this.cc.negative((result & 0x80) !== 0);
      this.cc.overflow(false);
      this.cc.zero(result === 0);
      return result;
    };

    this.shiftLeft = (reg1) => {
      const result = reg1 << 1;
      const maskedResult = result & 0xff;
      const carry = result !== maskedResult;
      const negative = (result & 0x80) !== 0;
      this.cc.carry(carry);
      this.cc.negative(negative);
      this.cc.zero(maskedResult === 0);
      this.cc.overflow( ( carry && !negative ) || ( !carry && negative ));
      return maskedResult;
    };

    this.shiftRight = (reg1) => {
      const carry = (reg1 & 0x01) !== 0;
      const msb = (reg1 & 0x80);
      const result = ((reg1 & 0xfe) >> 1) | msb;
      const negative = (result & 0x80) !== 0;
      this.cc.carry(carry);
      this.cc.negative(negative);
      this.cc.zero(result === 0);
      return result;
    };
  }
}

module.exports = {Alu};
