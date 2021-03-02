const {CpuRegister} = require('./cpu_register');
const cpus = require('../../src/cpu/cpu_constants');

class PiaRegister extends CpuRegister {
  constructor(name) {
    super(cpus.SHORT, name, undefined);
    this.delta = 0xff;
  }

  set(value) {
    const previous_value = this.value;
    super.set(value);
    this.delta = this.value ^ previous_value;
  }

  /**
   * Provide the bits changed by the most recent set operation
   * @return {number}
   */
  getDelta() {
    return this.delta;
  }
}

module.exports = {PiaRegister};