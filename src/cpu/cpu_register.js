const cpus = require('../../src/cpu/cpu_constants');

/* @class CpuRegister 8 or 16 bit cpu register */
// eslint-disable-next-line require-jsdoc
class CpuRegister {
  /**
   * Creates an instance of CpuRegister.
   *
   * @constructor
   * @param {number} size
   * @param {string} name
   * @param {ControlRegister} control
   */
  constructor(size, name, control) {
    this.size = size;
    this.name = name;
    this.value = 0;
    this.control = control;
    if (size === 8) {
      this.valueMask = 0xff;
      this.negativeMask = 0x80;
    } else {
      this.valueMask = 0xffff;
      this.negativeMask = 0x8000;
    }
  }

  /**
   * Sets or clears a single CC bit.
   *
   * @param {boolean} value
   * @param {number} bit mask of desired CC bit
   */
  cc(value, bit) {
    if (this.control !== undefined) {
      if (value) {
        this.control.set(bit);
      } else {
        this.control.clear(bit);
      }
    }
  }

  /**
   * Shorthand for controlling overflow bit.
   *
   * @param {boolean} value
   */
  overflow(value) {
    this.cc(value, cpus.OVERFLOW);
  }

  /**
   * Shorthand for controlling zero bit.
   *
   * @param {boolean} value
   */
  zero(value) {
    this.cc(value, cpus.ZERO);
  }

  /**
   * Shorthand for controlling negative bit.
   *
   * @param {boolean} value
   */
  negative(value) {
    this.cc(value, cpus.NEGATIVE);
  }

  /**
   * load and test new value for register.
   *
   * @param {number} value
   */
  load(value) {
    this.value = value & this.valueMask;
    this.testValue();
  }

  /**
   * returns and tests current value of register.
   *
   * @return {number} value
   */
  save() {
    this.testValue();
    return this.value;
  }

  /**
   * returns current value of register without testing.
   *
   * @return {number} value
   */
  fetch() {
    return this.value;
  }

  /**
   * sets value of register without testing.
   *
   * @param {number} value
   */
  set(value) {
    this.value = value & this.valueMask;
  }

  /**
   * tests current value of register.
   */
  testValue() {
    this.zero(this.value === 0);
    this.negative((this.value & this.negativeMask) > 0);
    this.overflow(false);
  }
}

module.exports = {CpuRegister};
