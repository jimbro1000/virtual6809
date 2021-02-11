const {CpuRegister} = require('../../src/cpu/cpu_register');
const cpus = require('../../src/cpu/cpu_constants');

/** @class WideRegister combines two 8bit registers */
class WideRegister extends CpuRegister {
  /**
   * Creates an instance of wide register
   *
   * @param {string} name of new combined register
   * @param {CpuRegister} registerA most significant byte register
   * @param {CpuRegister} registerB least significant byte register
   */
  constructor(name, registerA, registerB) {
    super(cpus.LONG, name, registerA.control_register);
    this.high_register = registerA;
    this.low_register = registerB;
  }

  /**
   * Load and test a new value for the register
   * @param {number} value
   */
  load(value) {
    this.set(value);
    this.testValue();
  }

  /**
   * Return and test an existing value for the register
   * @return {number}
   */
  save() {
    const result = this.fetch();
    this.testValue();
    return result;
  }

  /**
   * Return an existing value without testing
   * @return {number}
   */
  fetch() {
    this.value = (this.high_register.fetch() << 8) + this.low_register.fetch();
    return this.value;
  }

  /**
   * Load a new value to the register without testing
   * @param {number} value
   */
  set(value) {
    this.value = value & this.valueMask;
    const lowValue = value & 0xff;
    const highValue = (value & 0xff00) >> 8;
    this.high_register.set(highValue);
    this.low_register.set(lowValue);
  }
}

module.exports = {WideRegister};
