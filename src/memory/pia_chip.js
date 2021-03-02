const {Chip} = require('../../src/memory/memory_chip.js');
const chips = require('../../src/memory/memory_constants.js');
const cpus = require('../../src/cpu/cpu_constants');
const {PiaRegister} = require('../../src/cpu/pia_register');

const DD_MASK = 0x04;

class Pia extends Chip {
  constructor(chipSize) {
    super(chips.MAPPED, chipSize);
    this.dataDirectionA = false;
    this.dataDirectionB = false;
    this.peripheralDataRegisterA = new PiaRegister('PDA');
    this.peripheralDataRegisterB = new PiaRegister('PDB');
    this.dataDirectionRegisterA = new PiaRegister('DDA');
    this.dataDirectionRegisterB = new PiaRegister('DDB');
    this.controlRegisterA = new PiaRegister('CRA');
    this.controlRegisterB = new PiaRegister('CRB');

    this.eventListeners = {
      'pda_write': [],
      'pdb_write': [],
      'dda_write': [],
      'ddb_write': [],
      'cra_write': [],
      'crb_write': [],
    }
  }

  bindListener(eventName, lambda, mask) {
    if (typeof lambda === 'function') {
      switch (eventName) {
        case 'pda_write':
          this.eventListeners.pda_write.push({'lambda': lambda, 'mask': mask});
          break;
        case 'pdb_write':
          this.eventListeners.pdb_write.push({'lambda': lambda, 'mask': mask});
          break;
        case 'dda_write':
          this.eventListeners.dda_write.push({'lambda': lambda, 'mask': mask});
          break;
        case 'ddb_write':
          this.eventListeners.ddb_write.push({'lambda': lambda, 'mask': mask});
          break;
        case 'cra_write':
          this.eventListeners.cra_write.push({'lambda': lambda, 'mask': mask});
          break;
        case 'crb_write':
          this.eventListeners.crb_write.push({'lambda': lambda, 'mask': mask});
          break;
      }
    }
  }

  notifyListeners(event, register) {
    const list = this.eventListeners[event];
    list.forEach((listener) => {
      const mask = listener.mask;
      if ((mask & register.getDelta()) !== 0) {
        listener.lambda(this);
      }
    });
  }

  whichRegister(CR,PD,DD) {
    return (CR.fetch() & DD_MASK) === DD_MASK? PD: DD;
  }

  getMemory(address) {
    const offset = address - this.base;
    const register = offset % 4;
    let result;
    switch(register) {
      case 0:
        result = this.readPda();
        break;
      case 1:
        result = this.readCra();
        break;
      case 2:
        result = this.readPdb();
        break;
      case 3:
        result = this.readCrb();
        break;
    }
    return result;
  }

  setMemory(address, byte) {
    const offset = address - this.base;
    const register = offset % 4;
    switch(register) {
      case 0:
        this.writePda(byte);
        break;
      case 1:
        this.writeCra(byte);
        break;
      case 2:
        this.writePdb(byte);
        break;
      case 3:
        this.writeCrb(byte);
        break;
    }
  }

  readPda() {
    const register = this.whichRegister(this.controlRegisterA,
        this.peripheralDataRegisterA, this.dataDirectionRegisterA);
    return register.fetch();
  }

  readPdb() {
    const register = this.whichRegister(this.controlRegisterB,
        this.peripheralDataRegisterB, this.dataDirectionRegisterB);
    return register.fetch();
  }

  readCra() {
    return this.controlRegisterA.fetch();
  }

  readCrb() {
    return this.controlRegisterB.fetch();
  }

  writePda(byte) {
    const register = this.whichRegister(this.controlRegisterA,
        this.peripheralDataRegisterA, this.dataDirectionRegisterA);
    register.set(byte);
    if (register.name === 'PDA') {
      this.notifyListeners('pda_write', register);
    } else {
      this.notifyListeners('dda_write', register);
    }
  }

  writePdb(byte) {
    const register = this.whichRegister(this.controlRegisterB,
        this.peripheralDataRegisterB, this.dataDirectionRegisterB);
    register.set(byte);
    if (register.name === 'PDB') {
      this.notifyListeners('pdb_write', register);
    } else {
      this.notifyListeners('ddb_write', register);
    }
  }

  writeCra(byte) {
    this.controlRegisterA.set(byte);
    this.notifyListeners('cra_write', this.controlRegisterA);
  }

  writeCrb(byte) {
    this.controlRegisterA.set(byte);
    this.notifyListeners('crb_write', this.controlRegisterB);
  }
}

module.exports = {Pia};