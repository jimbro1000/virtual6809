const {CpuRegister} = require('../../src/cpu/cpu_register');
const cpus = require('../../src/cpu/cpu_constants');
const {ControlRegister} = require('../../src/cpu/control_register');
const {WideRegister} = require('../../src/cpu/wide_register');

// eslint-disable-next-line valid-jsdoc
/** @class RegisterManager handles cpu registers */
class RegisterManager {
  /**
   * Creates an instance of RegisterManager.
   *
   * @constructor
   */
  constructor() {
    this.cc = new ControlRegister();
    const a = new CpuRegister(cpus.SHORT, 'A', this.cc);
    const b = new CpuRegister(cpus.SHORT, 'B', this.cc);
    this.registers = {
      'A': a,
      'B': b,
      'DP': new CpuRegister(cpus.SHORT, 'DP', this.cc),
      'CC': this.cc,
      'X': new CpuRegister(cpus.LONG, 'X', this.cc),
      'Y': new CpuRegister(cpus.LONG, 'Y', this.cc),
      'S': new CpuRegister(cpus.LONG, 'S', this.cc),
      'U': new CpuRegister(cpus.LONG, 'U', this.cc),
      'PC': new CpuRegister(cpus.LONG, 'PC', this.cc),
      // wide register D = A.B
      'D': new WideRegister('D', a, b),
      // internal registers
      'W': new CpuRegister(cpus.LONG, 'W', this.cc),
      'AD': new CpuRegister(cpus.LONG, 'AD', this.cc),
    };
  }

  /**
   * Get reference to existing register by name.
   *
   * @param {string} registerName
   * @return {CpuRegister}
   */
  get(registerName) {
    return this.registers[registerName];
  }
}

module.exports = {RegisterManager};
