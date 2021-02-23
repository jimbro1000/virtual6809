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

    /**
     * add two 8 bit values, optionally with a carry bit.
     *
     * @param {number} reg1 register value 1
     * @param {number} reg2 register value 2
     * @param {number} c optional carry bit c
     * @return {number} sum result
     */
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

    /**
     * add two 16 bit values.
     *
     * @param {number} reg1 register value 1
     * @param {number} reg2 register value 2
     * @return {number} sum result
     */
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

    /**
     * subtract two 8 bit values, optionally with a carry bit.
     *
     * @param {number} reg1 register value 1
     * @param {number} reg2 register value 2
     * @param {number} c optional carry bit c
     * @return {number} subtraction result
     */
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

    /**
     * subtract two 16 bit values.
     *
     * @param {number} reg1 register value 1
     * @param {number} reg2 register value 2
     * @return {number} subtraction result
     */
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

    /**
     * multiply two 8 bit values into 16 bit value.
     *
     * @param {number} reg1 register value 1
     * @param {number} reg2 register value 2
     * @return {number} multiplication result
     */
    this.mul8 = (reg1, reg2) => {
      const result = reg1 * reg2;
      this.cc.carry((result & 0x80) === 0x80);
      this.cc.zero(result === 0);
      return result;
    };

    /**
     * logically AND two 8 bit values.
     *
     * @param {number} reg1 register value 1
     * @param {number} reg2 register value 2
     * @param {boolean} test switch to apply condition tests
     * @return {number} and result
     */
    this.and8 = (reg1, reg2, test) => {
      if (typeof(test) === 'undefined') test = true;
      const result = reg1 & reg2;
      if (test) {
        this.test8(result);
      }
      return result;
    };

    /**
     * logically OR two 8 bit values.
     *
     * @param {number} reg1 register value 1
     * @param {number} reg2 register value 2
     * @param {boolean} test switch to apply condition tests
     * @return {number} or result
     */
    this.or8 = (reg1, reg2, test) => {
      if (typeof(test) === 'undefined') test = true;
      const result = reg1 | reg2;
      if (test) {
        this.test8(result);
      }
      return result;
    };

    /**
     * logically ExclusiveOR two 8 bit values.
     *
     * @param {number} reg1 register value 1
     * @param {number} reg2 register value 2
     * @return {number} eor result
     */
    this.eor8 = (reg1, reg2) => {
      const result = reg1 ^ reg2;
      this.test8(result);
      return result;
    };

    /**
     * logically shift 8 bit value left.
     * Optionally rotate instead of shift
     *
     * @param {number} reg1 register value
     * @param {boolean} rotate switch
     * @return {number} shift result
     */
    this.shiftLeft8 = (reg1, rotate) => {
      if (typeof(rotate) === 'undefined') {
        rotate = false;
      }
      const result = (reg1 << 1) + (rotate && this.cc.ifcarryset(this.cc) ? 1 : 0);
      const maskedResult = result & 0xff;
      const carry = result !== maskedResult;
      const negative = (result & 0x80) !== 0;
      this.cc.carry(carry);
      this.cc.negative(negative);
      this.cc.zero(maskedResult === 0);
      this.cc.overflow( ( carry && !negative ) || ( !carry && negative ));
      return maskedResult;
    };

    /**
     * logically shift 8 bit value right.
     * Optionally rotate instead of shift
     *
     * @param {number} reg1 register value
     * @param {boolean} rotate switch
     * @return {number} shift result
     */
    this.shiftRight8 = (reg1, rotate) => {
      if (typeof(rotate) === 'undefined') {
        rotate = false;
      }
      const carry = (reg1 & 0x01) !== 0;
      const msb = rotate ? (this.cc.ifcarryset(this.cc) ? 0x80 : 0) : (reg1 & 0x80);
      const result = ((reg1 & 0xfe) >> 1) | msb;
      const negative = (result & 0x80) !== 0;
      this.cc.carry(carry);
      this.cc.negative(negative);
      this.cc.zero(result === 0);
      return result;
    };

    /**
     * logically rotate 8 bit value left.
     *
     * @param {number} reg1 register value
     * @return {number} rotate result
     */
    this.rotateLeft8 = (reg1) => {
      return this.shiftLeft8(reg1, true);
    };

    /**
     * logically rotate 8 bit value right.
     *
     * @param {number} reg1 register value
     * @return {number} rotate result
     */
    this.rotateRight8 = (reg1) => {
      return this.shiftRight8(reg1, true);
    };

    /**
     * ones complement 8 bit value.
     *
     * @param {number} reg1 register value
     * @return {number} complement result
     */
    this.complement8 = (reg1) => {
      const mask = 0xff;
      reg1 = this.eor8(reg1, mask);
      this.cc.carry(true);
      this.cc.zero(reg1 === 0);
      this.cc.negative( (reg1 & 0x80) !== 0);
      this.cc.overflow(false);
      return reg1;
    };

    /**
     * twos complement 8 bit value.
     * Does not test result
     *
     * @param {number} reg1 register value
     * @return {number} complement result
     */
    this.negate8 = (reg1) => {
      reg1 = (0x100 - reg1) & 0xff;
      return reg1;
    };

    /**
     * twos complement 8 bit value.
     * Tests result for CC
     *
     * @param {number} reg1 register value
     * @return {number} complement result
     */
    this.negate8andTest = (reg1) => {
      this.cc.carry(reg1 !== 0);
      this.cc.overflow(reg1 === 0x80);
      reg1 = this.negate8(reg1);
      this.cc.zero(reg1 === 0);
      this.cc.negative( (reg1 & 0x80) !== 0);
      return reg1;
    };

    /**
     * twos complement 5 bit value.
     * note: does not modify CC
     *
     * @param {number} reg1
     * @return {number} complement result
     */
    this.negate5 = (reg1) => {
      reg1 = (0x20 - reg1) & 0x1f;
      return reg1;
    };

    /**
     * twos complement 16 bit value.
     * note: does not modify CC
     *
     * @param {number} reg1
     * @return {number} complement result
     */
    this.negate16 = (reg1) => {
      reg1 = (0x10000 - reg1) & 0xffff;
      return reg1;
    };

    /**
     * test 8 bit value.
     *
     * @param {number} reg1 register value
     */
    this.test8 = (reg1) => {
      this.cc.negative((reg1 & 0x80) !== 0);
      this.cc.zero(reg1 === 0);
      this.cc.overflow(false);
    };

    /**
     * digital adjust 8 bit value.
     *
     * @param {number} reg1 register value
     * @return {number} adjusted value
     */
    this.daa = (reg1) => {
      let highNibble = reg1 >> 4;
      let lowNibble = reg1 & 0xf;
      if (this.cc.ifcarryset(this.cc) || (highNibble > 9) ||
          (highNibble > 8 && lowNibble > 9)) {
        highNibble += 6;
      }
      if (this.cc.ifhalfcarry() || (lowNibble > 9)) {
        lowNibble += 6;
        highNibble += 1;
      }
      this.cc.carry((highNibble & 0x0f) !== highNibble);
      const result = ((highNibble & 0x0f) << 4) | (lowNibble & 0xf);
      this.cc.negative((result & 0x80) !== 0);
      this.cc.zero(result === 0);
      return result;
    };

    /**
     * Calculates 16 bit value from signed offset and register value.
     * @param {number} offset signed value (5 bit)
     * @param {number} reg1 register value
     * @return {number} calculated value
     */
    this.offsetEA5 = (offset, reg1) => {
      const signMask = 0x10;
      let result;
      const negative = (signMask & offset) === signMask;
      if (negative) {
        result = reg1 - this.negate5(offset);
      } else {
        result = reg1 + offset;
      }
      return result & 0xffff;
    };

    /**
     * Calculates 16 bit value from signed offset and register value.
     * @param {number} offset signed value (8 bit)
     * @param {number} reg1 register value
     * @return {number} calculated value
     */
    this.offsetEA8 = (offset, reg1) => {
      const signMask = 0x80;
      let result;
      const negative = (signMask & offset) === signMask;
      if (negative) {
        result = reg1 - this.negate8(offset);
      } else {
        result = reg1 + offset;
      }
      return result & 0xffff;
    };

    /**
     * Calculates 16 bit value from signed offset and register value.
     * @param {number} offset signed value (16 bit)
     * @param {number} reg1 register value
     * @return {number} calculated value
     */
    this.offsetEA16 = (offset, reg1) => {
      const signMask = 0x8000;
      let result;
      const negative = (signMask & offset) === signMask;
      if (negative) {
        result = reg1 - this.negate16(offset);
      } else {
        result = reg1 + offset;
      }
      return result & 0xffff;
    };
  }
}

module.exports = {Alu};
