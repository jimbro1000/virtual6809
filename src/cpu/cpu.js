const {CpuRegister} = require('../../src/cpu/cpu_register');
const {RegisterManager} = require('../../src/cpu/register_manager');
const cpus = require('../../src/cpu/cpu_constants');
const {instructions} = require('../../src/cpu/instructions');
const {Alu} = require('../../src/alu/alu');

// eslint-disable-next-line valid-jsdoc
/** @class Cpu representing a 6809 central processor */
class Cpu {
  /**
   * Creates an instance of Cpu.
   *
   * @constructor
   * @param {MemoryManager} memoryManager addressable memory space.
   */
  constructor(memoryManager) {
    this.registers = new RegisterManager();
    this.memory = memoryManager;
    this.instructions = instructions;
    this.PC = this.registers.get('PC');
    this.W = this.registers.get('W');
    this.AD = this.registers.get('AD');
    this.CC = this.registers.get('CC');
    this.alu1 = new Alu(this.CC);
    this.operation = null;
    this.object = this.PC;
    this.target = null;
    this.codes = this.mapCodeNameToCode();
    this.lambdas = this.mapCodeToLambda();
    this.stackOrder = this.mapStackOrder();
    this.registerIds = this.mapRegisterIdentifier();
    this.interruptLines = this.mapInterruptLines();
    this.postbyteRegisters = this.mapPostbyteToRegister();
    this.code = [cpus.TFRWTOOB, cpus.READWLOW, cpus.READHIGH];
    this.PC.set(0xfffe);
    this.runState = cpus.RUNNING;
    this.interruptQueue = [];
  }

  /**
   * Create map of string microcodes to cpu constants
   * @return {{}} map
   */
  mapCodeNameToCode() {
    const result = {};
    result['DIRECT'] = cpus.DIRECT;
    result['READHIGH'] = cpus.READHIGH;
    result['READLOW'] = cpus.READLOW;
    result['WRITEHIGH'] = cpus.WRITEHIGH;
    result['WRITELOW'] = cpus.WRITELOW;
    result['WRITEWLOW'] = cpus.WRITEWLOW;
    result['READADHIGH'] = cpus.READADHIGH;
    result['READADLOW'] = cpus.READADLOW;
    result['READADWLOW'] = cpus.READADWLOW;
    result['TFRWTOOB'] = cpus.TFRWTOOB;
    result['TFRWTOTG'] = cpus.TFRWTOTG;
    result['TFROBTOTG'] = cpus.TFROBTOTG;
    result['TFRTGTOOB'] = cpus.TFRTGTOOB;
    result['BUSY'] = cpus.BUSY;
    result['ADDTGTOOB'] = cpus.ADDTGTOOB;
    result['READWLOW'] = cpus.READWLOW;
    result['READLOWCOMPARE'] = cpus.READLOWCOMPARE;
    result['READADLOWCOMPARE'] = cpus.READADLOWCOMPARE;
    result['COMPAREW'] = cpus.COMPAREW;
    result['INCOB'] = cpus.INCOB;
    result['DECOB'] = cpus.DECOB;
    result['INCW'] = cpus.INCW;
    result['DECW'] = cpus.DECW;
    result['PUSH'] = cpus.PUSH;
    result['PULL'] = cpus.PULL;
    result['PUSHPC'] = cpus.PUSHPC;
    result['PULLPC'] = cpus.PULLPC;
    result['ADDPCTOOB'] = cpus.ADDPCTOOB;
    result['ADDCPCTOOB'] = cpus.ADDCPCTOOB;
    result['ADDTGBTOOB'] = cpus.ADDTGBTOOB;
    result['ADDTGSTOOBIF'] = cpus.ADDTGSTOOBIF;
    result['ADDTGSWTOOBIF'] = cpus.ADDTGSWTOOBIF;
    result['ADDCTGTOOB'] = cpus.ADDCTGTOOB;
    result['SUBPCFROMOB'] = cpus.SUBPCFROMOB;
    result['SUBCPCFROMOB'] = cpus.SUBCPCFROMOB;
    result['SUBTGFROMOB'] = cpus.SUBTGFROMOB;
    result['SUBCTGFROMOB'] = cpus.SUBCTGFROMOB;
    result['SWAPWAD'] = cpus.SWAPWAD;
    result['READAND'] = cpus.READAND;
    result['ANDCC'] = cpus.ANDCC;
    result['READOR'] = cpus.READOR;
    result['ORCC'] = cpus.ORCC;
    result['READEOR'] = cpus.READEOR;
    result['SHIFTLEFT'] = cpus.SHIFTLEFT;
    result['SHIFTRIGHT'] = cpus.SHIFTRIGHT;
    result['ROTATELEFT'] = cpus.ROTATELEFT;
    result['ROTATERIGHT'] = cpus.ROTATERIGHT;
    result['BITTEST'] = cpus.BITTEST;
    result['COMPLEMENT'] = cpus.COMPLEMENT;
    result['NEGATE'] = cpus.NEGATE;
    result['EXCHANGE'] = cpus.EXCHANGE;
    result['TRANSFER'] = cpus.TRANSFER;
    result['SIGNEXTEND'] = cpus.SIGNEXTEND;
    result['MULTIPLY'] = cpus.MULTIPLY;
    result['TESTOB'] = cpus.TESTOB;
    result['DECIMALADJUST'] = cpus.DECIMALADJUST;
    result['PUSHIR'] = cpus.PUSHIR;
    result['PULLCC'] = cpus.PULLCC;
    result['SETENTIRE'] = cpus.SETENTIRE;
    result['VECTORHIGH'] = cpus.VECTORHIGH;
    result['VECTORLOW'] = cpus.VECTORLOW;
    result['MASKIF'] = cpus.MASKIF;
    result['WAIT'] = cpus.WAIT;
    result['SYNC'] = cpus.SYNC;
    result['INDEX'] = cpus.INDEX;
    return result;
  }

  /**
   * Create map of cpu microcodes to cpu lambdas
   * @return {{}} map
   */
  mapCodeToLambda() {
    const result = {};
    result[cpus.NEXT] = this.fetch_next_instruction_from_PC;
    result[cpus.FETCH] = this.fetch_next_instruction_from_PC;
    result[cpus.DIRECT] = this.build_direct_page_address_in_W;
    result[cpus.READHIGH] = this.read_next_high_data_byte_from_PC;
    result[cpus.READLOW] = this.read_next_low_data_byte_from_PC;
    result[cpus.READWLOW] = this.read_next_low_data_byte_to_W_from_PC;
    result[cpus.WRITEHIGH] = this.write_object_high_byte_to_AD;
    result[cpus.WRITELOW] = this.write_object_low_byte_to_AD;
    result[cpus.WRITEWLOW] = this.write_w_low_byte_to_AD;
    result[cpus.READADHIGH] = this.read_next_high_data_byte_from_AD;
    result[cpus.READADLOW] = this.read_next_low_data_byte_from_AD;
    result[cpus.READADWLOW] = this.read_next_low_data_byte_to_W_from_AD;
    result[cpus.SWAPWAD] = this.swap_internal_registers;
    result[cpus.TFRWTOOB] = this.transfer_w_to_object;
    result[cpus.TFRWTOTG] = this.transfer_w_to_target;
    result[cpus.TFROBTOTG] = this.transfer_object_to_target;
    result[cpus.TFRTGTOOB] = this.transfer_target_to_object;
    result[cpus.BUSY] = this.busy_state;
    result[cpus.ADDTGTOOB] = this.add_target_to_object;
    result[cpus.ADDPCTOOB] = this.add_pc_to_object;
    result[cpus.ADDCPCTOOB] = this.add_pc_to_object_with_carry;
    result[cpus.ADDTGBTOOB] = this.add_target_byte_to_object;
    result[cpus.ADDTGSTOOBIF] =
        this.add_target_signed_byte_value_to_object_if_condition_met;
    result[cpus.ADDTGSWTOOBIF] =
        this.add_target_signed_word_value_to_object_if_condition_met;
    result[cpus.ADDCTGTOOB] = this.add_target_to_object_with_carry;
    result[cpus.SUBPCFROMOB] = this.sub_pc_from_object;
    result[cpus.SUBCPCFROMOB] = this.sub_pc_with_carry_from_object;
    result[cpus.SUBTGFROMOB] = this.sub_target_value_from_object;
    result[cpus.SUBCTGFROMOB] = this.sub_target_value_with_carry_from_object;
    result[cpus.READLOWCOMPARE] = this.read_and_compare_low_byte;
    result[cpus.READADLOWCOMPARE] = this.read_ad_and_compare_low_byte;
    result[cpus.COMPAREW] = this.compare_w_with_word;
    result[cpus.INCOB] = this.inc_ob;
    result[cpus.DECOB] = this.dec_ob;
    result[cpus.INCW] = this.inc_w;
    result[cpus.DECW] = this.dec_w;
    result[cpus.PUSH] = this.push_reg_to_ad;
    result[cpus.PULL] = this.pull_reg_from_ad;
    result[cpus.PUSHPC] = this.push_pc_to_ad;
    result[cpus.PULLPC] = this.pull_pc_from_ad;
    result[cpus.READAND] = this.and_target_read;
    result[cpus.ANDCC] = this.and_control;
    result[cpus.READOR] = this.or_target_read;
    result[cpus.ORCC] = this.or_control;
    result[cpus.READEOR] = this.eor_target_read;
    result[cpus.SHIFTLEFT] = this.shift_left;
    result[cpus.SHIFTRIGHT] = this.shift_right;
    result[cpus.ROTATELEFT] = this.rotate_left;
    result[cpus.ROTATERIGHT] = this.rotate_right;
    result[cpus.BITTEST] = this.read_and_bit_test;
    result[cpus.COMPLEMENT] = this.complement_byte;
    result[cpus.NEGATE] = this.negate_byte;
    result[cpus.EXCHANGE] = this.exchange;
    result[cpus.TRANSFER] = this.transfer;
    result[cpus.SIGNEXTEND] = this.sign_extend;
    result[cpus.MULTIPLY] = this.multiply;
    result[cpus.TESTOB] = this.test_byte;
    result[cpus.DECIMALADJUST] = this.decimal_adjust;
    result[cpus.PUSHIR] = this.push_pc_and_cc;
    result[cpus.PULLCC] = this.pull_and_test_cc;
    result[cpus.SETENTIRE] = this.set_entire_flag;
    result[cpus.VECTORHIGH] = this.vector_msb;
    result[cpus.VECTORLOW] = this.vector_lsb;
    result[cpus.MASKIF] = this.suspend_interrupts;
    result[cpus.WAIT] = this.wait;
    result[cpus.SYNC] = this.sync;
    result[cpus.INDEX] = this.calculate_index_to_ad;
    return result;
  }

  mapInterruptLines() {
    const result = [];
    result['reset'] = cpus.vRESET;
    result['nmi'] = cpus.vNMI;
    result['irq'] = cpus.vIRQ;
    result['firq'] = cpus.vFIRQ;
    result['swi'] = cpus.vSWI;
    result['swi2'] = cpus.vSWI2;
    result['swi3'] = cpus.vSWI3;
    return result;
  }

  /**
   * Create ordered list of cpus in stackable order
   * @return {[]} stacking list
   */
  mapStackOrder() {
    const result = [];
    result[0x80] = 'PC';
    result[0x40] = 'US';
    result[0x20] = 'Y';
    result[0x10] = 'X';
    result[0x8] = 'DP';
    result[0x4] = 'B';
    result[0x2] = 'A';
    result[0x1] = 'CC';
    return result;
  };

  /**
   * Create ordered list of register identifiers
   * @return {[]} register list
   */
  mapRegisterIdentifier() {
    const result = [];
    result[0] = 'D';
    result[1] = 'X';
    result[2] = 'Y';
    result[3] = 'U';
    result[4] = 'S';
    result[5] = 'PC';
    result[8] = 'A';
    result[9] = 'B';
    result[10] = 'CC';
    result[11] = 'DP';
    return result;
  }

  /**
   * Create ordered list of postbyte registers.
   * @return {[]} register list
   */
  mapPostbyteToRegister() {
    const result = [];
    result[0] = 'X';
    result[1] = 'Y';
    result[2] = 'U';
    result[3] = 'S';
    return result;
  }

  /**
   * Populate the execution stack with micro-codes.
   * translates string codes to cpu codes
   * @param {[]} instructionCode list
   */
  populateCodeStack(instructionCode) {
    this.code = [];
    for (let index = 0; index < instructionCode.length; index++) {
      const operation = this.codes[instructionCode[index]];
      if (typeof operation === 'undefined') {
        throw new Error ("unknown operation " + instructionCode[index]);
      } else {
        this.code.unshift(this.codes[instructionCode[index]]);
      }
    }
  }

  /**
   * populate the named register
   * @param {string|CpuRegister} register
   * @param {number} literalValue
   */
  setRegisterLiteral(register, literalValue) {
    if (typeof register === 'string') {
      register = this.registers.get(register);
    }
    if (register instanceof CpuRegister) {
      register.load(literalValue);
    }
  }

  /**
   * populate the low byte of the named register
   * @param {string|CpuRegister} register
   * @param {number} literalValue
   */
  setRegisterLiteralLow(register, literalValue) {
    if (typeof register === 'string') {
      register = this.registers.get(register);
    }
    if (register instanceof CpuRegister && register.size === cpus.LONG) {
      const partial = register.fetch() & 0xff00;
      const result = partial | literalValue;
      register.load(result);
    }
  }

  /**
   * populate the high byte of the named register
   * @param {string|CpuRegister} register
   * @param {number} literalValue
   */
  setRegisterLiteralHigh(register, literalValue) {
    if (typeof register === 'string') {
      register = this.registers.get(register);
    }
    if (register instanceof CpuRegister && register.size === cpus.LONG) {
      const partial = register.fetch() & 0x00ff;
      const result = partial | (literalValue << 8);
      register.load(result);
    }
  }

  /**
   * fetch next byte from pc address and advance.
   * @return {number}
   */
  fetchNextByte() {
    let address = this.PC.fetch();
    const value = this.memory.read(address++);
    this.PC.set(address);
    return value;
  }

  /**
   * reset temporary registers for next instruction.
   */
  clearInstruction() {
    this.object = null;
    this.target = null;
    this.W.set(0);
    this.AD.set(0);
    this.code = [cpus.NEXT];
    this.operation = 0;
    this.condition = '';
    this.vector = 0xfffe;
  }

  /**
   * perform a single cpu clock cycle.
   */
  cycle() {
    if (this.interruptQueue.length > 0 && this.code[0] === cpus.NEXT) {
      const interrupt = this.interruptQueue.shift();
      if (this.interruptUnmasked(interrupt.name)) {
        this.serviceInterrupt(interrupt);
        this.runState = cpus.RUNNING;
      } else {
        if (this.runState === cpus.SYNCING) {
          this.runState = cpus.RUNNING;
        }
      }
    } else if (this.runState === cpus.RUNNING) {
      this.executeNext();
    }
  }

  /**
   * Check if interrupt can happen.
   * @param {string} bit
   * @returns {boolean}
   */
  interruptUnmasked(bit) {
    let unmasked;
    switch (bit) {
      case 'irq':
        unmasked = this.CC.ifirqclear();
        break;
      case 'firq':
        unmasked = this.CC.iffirqclear();
        break;
      default:
        unmasked = true;
        break;
    }
    return unmasked;
  }

  /**
   * execute next instruction.
   */
  executeNext() {
    const lambda = this.lambdas[this.code.pop()];
    lambda();
    if (this.code.length === 0) {
      this.clearInstruction();
    }
  }

  /**
   * evaluate register id to find register name.
   * @param {number} id 4bit identifier of register
   * @returns {string} register name
   */
  identifyRegister(id) {
    return this.registerIds[id];
  }

  /**
   * queue a new interrupt.
   * @param {string} line
   */
  callInterrupt(line) {
    const interrupt = this.interruptLines[line];
    if (typeof interrupt !== 'undefined') {
      this.interruptQueue.push(interrupt);
    }
  }

  /**
   * process queued interrupt.
   * @param {object} interrupt
   */
  serviceInterrupt(interrupt) {
    let operation = 'fastVectorFromRun';
    if (this.runState === cpus.WAITING) {
      operation = 'vectorFromWait';
    } else if (interrupt.entire) {
      operation = 'vectorFromRun';
    }
    const action = this.instructions[operation];
    action.vector = interrupt.vector;
    action.mask = interrupt.flags;
    this.interpretInstruction(action);
  }

  /**
   * transform operation object into cpu state and code stack.
   * @param {object} action
   */
  interpretInstruction(action) {
    if (typeof action.object !== 'undefined') {
      this.object = this.registers.get(action.object);
    }
    if (typeof action.target !== 'undefined') {
      this.target = this.registers.get(action.target);
    }
    if (typeof action.condition !== 'undefined') {
      this.condition = action.condition;
    }
    if (typeof action.vector !== 'undefined') {
      this.vector = action.vector;
    }
    if (typeof action.mask !== 'undefined') {
      this.mask = action.mask;
    }
    this.populateCodeStack(action.code);
  }

  swap_internal_registers = () => {
    const temp = this.W.fetch();
    this.W.set(this.AD.fetch());
    this.AD.set(temp);
  };

  add_target_to_object = () => {
    this.W.set(this.object.fetch() + this.target.fetch());
  };

  add_pc_to_object = () => {
    this.object.load(
        this.alu1.add8(this.object.fetch(), this.fetchNextByte()));
  };

  add_pc_to_object_with_carry = () => {
    this.object.load(this.alu1.add8(
        this.object.fetch(), this.fetchNextByte(),
        (this.CC.save() & cpus.CARRY) === cpus.CARRY ? 1 : 0,
    ));
  };

  add_target_byte_to_object = () => {
    if (this.object.size === cpus.SHORT) {
      this.object.load(this.alu1.add8(this.object.fetch(),
          this.memory.read(this.target.fetch())));
    } else {
      this.object.load(
          this.alu1.add16(this.object.fetch(), this.target.fetch()));
    }
  };

  add_target_signed_byte_value_to_object_if_condition_met = () => {
    if (this.CC.test(this.condition)) {
      this.add_target_signed_byte_to_object();
    }
  };

  add_target_signed_word_value_to_object_if_condition_met = () => {
    if (this.CC.test(this.condition)) {
      this.add_target_signed_word_to_object();
      this.code.push(cpus.BUSY);
    }
  };

  add_target_signed_byte_to_object = () => {
    let byte = this.target.fetch();
    if (byte > 0x7f) {
      byte = byte - 0x100;
    }
    this.object.set(this.object.fetch() + byte);
  };

  add_target_signed_word_to_object = () => {
    let word = this.target.fetch();
    if (word > 0x7fff) {
      word = word - 0x10000;
    }
    this.object.set(this.object.fetch() + word);
  };

  add_target_to_object_with_carry = () => {
    this.object.load(this.alu1.add8(
        this.object.fetch(),
        this.memory.read(this.target.fetch()),
        (this.CC.save() & cpus.CARRY) === cpus.CARRY ? 1 : 0,
    ));
  };

  sub_pc_from_object = () => {
    this.object.load(
        this.alu1.sub8(this.object.fetch(), this.fetchNextByte()));
  };

  sub_pc_with_carry_from_object = () => {
    this.object.load(this.alu1.sub8(
        this.object.fetch(), this.fetchNextByte(),
        (this.CC.save() & cpus.CARRY) === cpus.CARRY ? 1 : 0,
    ));
  };

  sub_target_value_from_object = () => {
    if (this.object.size === cpus.SHORT) {
      this.object.load(this.alu1.sub8(this.object.fetch(),
          this.memory.read(this.target.fetch())));
    } else {
      this.object.load(
          this.alu1.sub16(this.object.fetch(), this.target.fetch()));
    }
  };

  sub_target_value_with_carry_from_object = () => {
    this.object.load(this.alu1.sub8(
        this.object.fetch(),
        this.memory.read(this.target.fetch()),
        (this.CC.save() & cpus.CARRY) === cpus.CARRY ? 1 : 0,
    ));
  };

  multiply = () => {
    this.registers.get('D').set(
        this.alu1.mul8(
            this.registers.get('A').fetch(), this.registers.get('B').fetch()
        )
    );
  };

  test_byte = () => {
    this.alu1.test8(this.object.fetch());
  };

  fetch_next_instruction_from_PC = () => {
    const nextByte = this.fetchNextByte();
    this.operation |= nextByte;
    const action = this.instructions[this.operation];
    if (typeof action === 'undefined') {
      // eslint-disable-next-line no-throw-literal
      throw 'illegal instruction ' + this.operation;
    }
    if (action.mode === 'fetch') {
      this.operation = nextByte << 8;
      this.code = [cpus.FETCH];
    } else {
      this.interpretInstruction(action);
    }
  };

  transfer_w_to_object = () => {
    this.object.set(this.W.fetch());
    this.W.set(0);
  };

  transfer_w_to_target = () => {
    this.target.set(this.W.fetch());
    this.W.set(0);
  };

  transfer_object_to_target = () => {
    this.target.set(this.object.fetch());
  };

  transfer_target_to_object = () => {
    this.object.set(this.target.fetch());
  };

  build_direct_page_address_in_W = () => {
    this.W.set(
        (this.registers.get('DP').fetch() << 8) | this.fetchNextByte());
  };

  read_next_high_data_byte_from_PC = () => {
    this.W.set(this.fetchNextByte() << 8);
  };

  read_next_low_data_byte_from_PC = () => {
    this.object.load(this.W.fetch() | this.fetchNextByte());
  };

  read_next_high_data_byte_from_AD = () => {
    let AD = this.AD.fetch();
    const nextByte = this.memory.read(AD++);
    this.W.set(nextByte << 8);
    this.AD.set(AD);
  };

  read_next_low_data_byte_from_AD = () => {
    this.object.load(this.W.fetch() | this.memory.read(this.AD.fetch()));
  };

  read_next_low_data_byte_to_W_from_PC = () => {
    this.W.set(this.W.fetch() | this.fetchNextByte());
  };

  read_next_low_data_byte_to_W_from_AD = () => {
    this.W.set(this.W.fetch() | this.memory.read(this.AD.fetch()));
  };

  write_object_high_byte_to_AD = () => {
    let AD = this.AD.fetch();
    this.memory.write(AD++, (this.object.fetch() & 0xff00) >> 8);
    this.AD.set(AD);
  };

  write_object_low_byte_to_AD = () => {
    this.memory.write(this.AD.fetch(), this.object.save() & 0xff);
  };

  write_w_low_byte_to_AD = () => {
    this.memory.write(this.AD.fetch(), this.W.fetch() & 0xff);
  };

  busy_state = () => {
    // do nothing
  };

  read_and_compare_low_byte = () => {
    this.compare_low_byte(this.fetchNextByte());
  };

  read_ad_and_compare_low_byte = () => {
    this.compare_low_byte(this.memory.read(this.AD.fetch()));
  };

  compare_low_byte = (n) => {
    this.W.set(n);
    this.twos_complement(this.W, cpus.SHORT);
    const w = this.W.fetch();
    const o = this.object.fetch();
    const temp = w + o;
    const masked = temp & 0xff;
    this.check_cc(n, w, o, temp, masked);
  };

  compare_w_with_word = () => {
    const n = this.W.fetch();
    this.twos_complement(this.W, cpus.LONG);
    const w = this.W.fetch();
    const o = this.object.fetch();
    const temp = w + o;
    const masked = temp & 0xffff;
    this.check_cc(n, w, o, temp, masked);
  };

  inc_ob = () => {
    this.inc(this.object);
  };

  inc_w = () => {
    this.inc(this.W);
  };

  inc = (register) => {
    const o = register.fetch() & 0xff;
    const temp = o + 1;
    register.set(temp & 0xff);
    const w = register.fetch();
    this.CC.zero(w === 0);
    this.CC.negative((w & 0x80) !== 0);
    this.CC.overflow(w !== temp);
  };

  dec_ob = () => {
    this.dec(this.object);
  };

  dec_w = () => {
    this.dec(this.W);
  };

  dec = (register) => {
    const o = register.fetch() & 0xff;
    const temp = o - 1;
    register.set(temp);
    const w = register.fetch();
    this.CC.zero(w === 0);
    this.CC.negative((w & 0x80) !== 0);
    this.CC.overflow(w !== temp);
  };

  and_target_read = () => {
    if (this.target.name === 'PC') {
      this.read_next_low_data_byte_to_W_from_PC();
    } else {
      this.read_next_low_data_byte_to_W_from_AD();
    }
    this.and_ob();
  };

  and_control = () => {
    this.CC.value = this.alu1.and8(this.CC.value, this.W.fetch(), false);
  };

  and_ob = () => {
    this.object.set(this.alu1.and8(this.object.fetch(), this.W.fetch()));
  };

  or_target_read = () => {
    if (this.target.name === 'PC') {
      this.read_next_low_data_byte_to_W_from_PC();
    } else {
      this.read_next_low_data_byte_to_W_from_AD();
    }
    this.or_ob();
  };

  or_control = () => {
    this.CC.value = this.alu1.or8(this.CC.value, this.W.fetch(), false);
  }

  or_ob = () => {
    this.object.set(this.alu1.or8(this.object.fetch(), this.W.fetch()));
  }

  eor_target_read = () => {
    if (this.target.name === 'PC') {
      this.read_next_low_data_byte_to_W_from_PC();
    } else {
      this.read_next_low_data_byte_to_W_from_AD();
    }
    this.object.set(this.alu1.eor8(this.object.fetch(), this.W.fetch()));
  }

  shift_left = () => {
    this.object.set(this.alu1.shiftLeft8(this.object.fetch()));
  }

  rotate_left = () => {
    this.object.set(this.alu1.shiftLeft8(this.object.fetch(), true));
  }

  shift_right = () => {
    this.object.set(this.alu1.shiftRight8(this.object.fetch()));
  }

  rotate_right = () => {
    this.object.set(this.alu1.shiftRight8(this.object.fetch(), true));
  }

  read_and_bit_test = () => {
    const address = this.target.fetch();
    if (this.target === this.PC) {
      this.PC.set(address + 1);
    }
    this.alu1.and8(this.object.fetch(), this.memory.read(address));
  }

  complement_byte = () => {
    this.object.set(this.alu1.complement8(this.object.fetch()));
  }

  negate_byte = () => {
    this.object.set(this.alu1.negate8andTest(this.object.fetch()));
  }

  sign_extend = () => {
    if ((this.registers.get('B').fetch() & 0x80) !== 0) {
      this.registers.get('A').set(0xff);
      this.CC.negative(true);
    } else {
      this.registers.get('A').set(0x00);
      this.CC.negative(false);
    }
    this.CC.zero(this.registers.get('D').fetch() === 0);
  }

  decimal_adjust = () => {
    this.object.set(this.alu1.daa(this.object.fetch()));
  }

  exchange = () => {
    const id1 = (this.W.fetch() & 0xf0) >> 4;
    const id2 = this.W.fetch() & 0x0f;
    if ((id1 & 8) === (id2 & 8)) {
      const register1 = this.identifyRegister(id1);
      const register2 = this.identifyRegister(id2);
      const temporary = this.registers.get(register1).fetch();
      this.registers.get(register1).set(this.registers.get(register2).fetch());
      this.registers.get(register2).set(temporary);
    }
  }

  transfer = () => {
    const id1 = (this.W.fetch() & 0xf0) >> 4;
    const id2 = this.W.fetch() & 0x0f;
    if ((id1 & 8) === (id2 & 8)) {
      const register1 = this.identifyRegister(id1);
      const register2 = this.identifyRegister(id2);
      this.registers.get(register2).set(this.registers.get(register1).fetch());
    }
  }

  select_register = (stackMask) => {
    let register = this.stackOrder[stackMask];
    if (register === 'US') {
      if (this.object.name === 'U') {
        register = 'S';
      } else {
        register = 'U';
      }
    }
    return register;
  };

  push_reg_to_ad = () => {
    let mask = 0x80;
    let loop = true;
    let w = this.W.fetch();
    while (loop) {
      if ((mask & w) === mask) {
        this.W.set(w -= mask);
        if (w !== 0) {
          this.code.push(this.codes['PUSH']);
        }
        const register = this.select_register(mask);
        let address = this.target.fetch();
        const nextEntry = this.registers.get(register);
        const lowValue = nextEntry.fetch() & 0xff;
        this.memory.write(address--, lowValue);
        if (nextEntry.size === cpus.LONG) {
          this.code.push(this.codes['BUSY']);
          const highValue = (nextEntry.fetch() & 0xff00) >> 8;
          this.memory.write(address--, highValue);
        }
        this.target.set(address);
        loop = false;
      } else {
        mask = mask >> 1;
        loop = mask >= 1;
      }
    }
  };

  pull_reg_from_ad = () => {
    let mask = 0x01;
    let loop = true;
    let w = this.W.fetch();
    while (loop) {
      if ((mask & w) === mask) {
        this.W.set(w -= mask);
        if (w !== 0) {
          this.code.push(this.codes['PULL']);
        }
        const register = this.select_register(mask);
        let address = this.target.fetch();
        const nextEntry = this.registers.get(register);
        let pulledValue = 0;
        if (nextEntry.size === cpus.LONG) {
          this.code.push(this.codes['BUSY']);
          pulledValue += this.memory.read(++address) << 8;
        }
        pulledValue += this.memory.read(++address);
        nextEntry.set(pulledValue);
        this.target.set(address);
        loop = false;
      } else {
        mask = mask << 1;
        loop = mask <= 0x100;
      }
    }
  };

  push_pc_to_ad = () => {
    let address = this.registers.get('S').fetch();
    const value = this.PC.fetch();
    const lowValue = (value & 0xff00) >> 8;
    this.memory.write(address--, lowValue);
    const highValue = value & 0xff;
    this.memory.write(address--, highValue);
    this.registers.get('S').set(address);
  };

  pull_pc_from_ad = () => {
    let address = this.target.fetch();
    const highValue = this.memory.read(++address) << 8;
    const lowValue = this.memory.read(++address);
    this.PC.set(highValue | lowValue);
    this.target.set(address);
  };

  pull_and_test_cc = () => {
    let address = this.target.fetch();
    this.CC.value = this.memory.read(++address);
    this.target.set(address);
    if(this.CC.ifentireset()) {
      this.code.push(this.codes['PULL']);
      this.W.set(0x7e);
    }
  }

  push_pc_and_cc = () => {
    this.W.set(0x81);
    this.push_reg_to_ad();
  }

  set_entire_flag = () => {
    this.CC.entire(true);
    this.W.set(0xff);
  }

  vector_msb = () => {
    const msb = this.memory.read(this.vector);
    this.PC.set(msb << 8);
  }

  vector_lsb = () => {
    const lsb = this.memory.read(this.vector + 1);
    this.PC.set(this.PC.fetch() | lsb);
  }

  suspend_interrupts = () => {
    this.CC.irq((this.mask & cpus.IRQ) !== 0);
    this.CC.firq((this.mask & cpus.FIRQ) !== 0);
  }

  wait = () => {
    this.runState = cpus.WAITING;
  }

  sync = () => {
    this.runState = cpus.SYNCING;
  }

  calculate_index_to_ad = () => {
    const OFFSET_TYPE_MASK = 0x80;
    const OFFSET_MASK = 0x1f;
    const INDIRECT_MASK = 0x10;
    const postByte = this.W.fetch();
    const register = this.postbyte_to_register(postByte);
    const direct = (INDIRECT_MASK & postByte) !== INDIRECT_MASK;
    let offset = (postByte & OFFSET_MASK);
    if ((postByte & OFFSET_TYPE_MASK) === OFFSET_TYPE_MASK) {
      if (direct) {
        const mode = (postByte & OFFSET_MASK);
        switch (mode) {
          case 0:
            this.AD.set(this.direct_increment(1, register));
            break;
          case 1:
            this.AD.set(this.direct_increment(2, register));
            break;
          case 2:
            this.AD.set(this.direct_decrement(1, register));
            break;
          case 3:
            this.AD.set(this.direct_decrement(2, register));
            break;
          case 4:
            this.AD.set(register.fetch());
            break;
          case 5:
            this.AD.set(this.direct_byte_offset(
                this.registers.get('B').fetch(), register
            ));
            break;
          case 6:
            this.AD.set(this.direct_byte_offset(
                this.registers.get('A').fetch(), register
            ));
            break;
          case 8:
            this.AD.set(this.direct_byte_offset(
                this.fetchNextByte(), register
            ));
            break;
          case 9:
            this.AD.set(this.direct_word_offset(
                (this.fetchNextByte() << 8) + this.fetchNextByte(), register
            ));
            break;
          case 11:
            this.AD.set(this.direct_word_offset(
                this.registers.get('D').fetch(), register
            ));
            break;
          case 12:
            this.AD.set(this.direct_byte_offset(
                this.fetchNextByte(), this.PC
            ));
            break;
          case 13:
            this.AD.set(this.direct_word_offset(
                (this.fetchNextByte() << 8) + this.fetchNextByte(), this.PC
            ));
            this.code.push(this.codes['BUSY']);
        }
      }
    } else {
      this.AD.set(this.direct_constant_offset(offset, register));
    }
  }

  direct_constant_offset = (offset, register) => {
    this.code.push(this.codes['BUSY']);
    return this.alu1.offsetEA5(offset, register.fetch());
  }

  direct_byte_offset = (offset, register) => {
    this.code.push(this.codes['BUSY']);
    return this.alu1.offsetEA8(offset, register.fetch());
  }

  direct_word_offset = (offset, register) => {
    this.code.push(this.codes['BUSY']);
    this.code.push(this.codes['BUSY']);
    this.code.push(this.codes['BUSY']);
    this.code.push(this.codes['BUSY']);
    return this.alu1.offsetEA16(offset, register.fetch());
  }

  direct_increment = (step, register) => {
    for (let counter = 0; counter <= step; ++counter) {
      this.code.push(this.codes['BUSY']);
    }
    const address = register.fetch();
    register.set(address + step);
    return address;
  }

  direct_decrement = (step, register) => {
    for (let counter = 0; counter <= step; ++counter) {
      this.code.push(this.codes['BUSY']);
    }
    const address = register.fetch() - step;
    register.set(address);
    return address;
  }

  postbyte_to_register = (postByte) => {
    const REGISTER_MASK = 0x60;
    const register = (postByte & REGISTER_MASK) >> 5;
    return this.registers.get(this.postbyteRegisters[register]);
  }

  check_cc = (initial, complement, object, sum, masked) => {
    this.CC.zero(masked === 0);
    this.CC.negative((masked & 0x80) !== 0);
    this.CC.overflow(sum !== masked);
    this.CC.carry(initial < object);
  };

  twos_complement = (register, scale) => {
    let value = register.fetch();
    let mask = 0xffff;
    if (scale === cpus.SHORT) {
      mask = 0xff;
    }
    value = value & mask;
    value = this.xor(value, scale);
    value += 1;
    register.set(value);
  };

  xor = (value, scale) => {
    let mask = 0x01;
    let result = 0;
    for (let index = 0; index < scale; index++) {
      if ((value & mask) === 0) {
        result |= mask;
      }
      mask = mask << 1;
    }
    return result;
  };
}

module.exports = {Cpu};
