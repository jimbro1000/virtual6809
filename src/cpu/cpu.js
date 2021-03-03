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
    result['SUBWFROMOB'] = cpus.SUBWFROMOB;
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
    result['CLEAR'] = cpus.CLEAR;
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
    result[cpus.SUBWFROMOB] = this.sub_w_from_object;
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
    result[cpus.CLEAR] = this.clear_register;
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

  logOperandCodes(mnemonic, instructionCode) {
    let result = mnemonic + " code stack: ";
    for (let index=0; index<instructionCode.length; ++index) {
      result += instructionCode[index] + " ";
    }
    console.debug(result);
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
    console.debug("operand completed");
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
    const microcode = this.code.pop();
    const lambda = this.lambdas[microcode];
    // console.log("execute microcode " + microcode);
    if (typeof lambda === 'function') {
      lambda(this);
    } else {
      this.operandException(microcode);
    }
    if (this.code.length === 0) {
      this.clearInstruction();
    }
  }

  /**
   * report illegal microcode to console.
   * @param {number} code
   */
  operandException(code) {
    console.error("illegal microcode " + code + " at address " + this.PC.fetch());
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
    this.logOperandCodes(action.operation, action.code);
  }

  swap_internal_registers(cpu) {
    const temp = cpu.W.fetch();
    cpu.W.set(cpu.AD.fetch());
    cpu.AD.set(temp);
  };

  add_target_to_object(cpu) {
    cpu.W.set(cpu.object.fetch() + cpu.target.fetch());
  };

  add_pc_to_object(cpu) {
    cpu.object.load(
        cpu.alu1.add8(cpu.object.fetch(), cpu.fetchNextByte()));
  };

  add_pc_to_object_with_carry(cpu) {
    cpu.object.load(cpu.alu1.add8(
        cpu.object.fetch(), cpu.fetchNextByte(),
        (cpu.CC.save() & cpus.CARRY) === cpus.CARRY ? 1 : 0,
    ));
  };

  add_target_byte_to_object(cpu) {
    if (cpu.object.size === cpus.SHORT) {
      cpu.object.load(cpu.alu1.add8(cpu.object.fetch(),
          cpu.memory.read(cpu.target.fetch())));
    } else {
      cpu.object.load(
          cpu.alu1.add16(cpu.object.fetch(), cpu.target.fetch()));
    }
  };

  add_target_signed_byte_value_to_object_if_condition_met(cpu) {
    if (cpu.CC.test(cpu.condition)) {
      cpu.add_target_signed_byte_to_object(cpu);
    }
  };

  add_target_signed_word_value_to_object_if_condition_met(cpu) {
    if (cpu.CC.test(cpu.condition)) {
      cpu.add_target_signed_word_to_object(cpu);
      cpu.code.push(cpus.BUSY);
    }
  };

  add_target_signed_byte_to_object(cpu) {
    let byte = cpu.target.fetch();
    if (byte > 0x7f) {
      byte = byte - 0x100;
    }
    cpu.object.set(cpu.object.fetch() + byte);
  };

  add_target_signed_word_to_object(cpu) {
    let word = cpu.target.fetch();
    if (word > 0x7fff) {
      word = word - 0x10000;
    }
    cpu.object.set(cpu.object.fetch() + word);
  };

  add_target_to_object_with_carry(cpu) {
    cpu.object.load(cpu.alu1.add8(
        cpu.object.fetch(),
        cpu.memory.read(cpu.target.fetch()),
        (cpu.CC.save() & cpus.CARRY) === cpus.CARRY ? 1 : 0,
    ));
  };

  sub_pc_from_object(cpu) {
    cpu.object.load(
        cpu.alu1.sub8(cpu.object.fetch(), cpu.fetchNextByte()));
  };

  sub_pc_with_carry_from_object(cpu) {
    cpu.object.load(cpu.alu1.sub8(
        cpu.object.fetch(), cpu.fetchNextByte(cpu),
        (cpu.CC.save() & cpus.CARRY) === cpus.CARRY ? 1 : 0,
    ));
  };

  sub_target_value_from_object(cpu) {
    if (cpu.object.size === cpus.SHORT) {
      cpu.object.load(cpu.alu1.sub8(cpu.object.fetch(),
          cpu.memory.read(cpu.target.fetch())));
    } else {
      cpu.object.load(
          cpu.alu1.sub16(cpu.object.fetch(), cpu.target.fetch()));
    }
  };

  sub_w_from_object(cpu) {
    cpu.object.load(
        cpu.alu1.sub16(cpu.object.fetch(), cpu.W.fetch()));
  }

  sub_target_value_with_carry_from_object(cpu) {
    cpu.object.load(cpu.alu1.sub8(
        cpu.object.fetch(),
        cpu.memory.read(cpu.target.fetch()),
        (cpu.CC.save() & cpus.CARRY) === cpus.CARRY ? 1 : 0,
    ));
  };

  multiply(cpu) {
    cpu.registers.get('D').set(
        cpu.alu1.mul8(
            cpu.registers.get('A').fetch(), cpu.registers.get('B').fetch()
        )
    );
  };

  test_byte(cpu) {
    cpu.alu1.test8(cpu.object.fetch());
  };

  fetch_next_instruction_from_PC(cpu) {
    console.debug("fetch next instruction byte from " + cpu.PC.fetch().toString(16));
    const nextByte = cpu.fetchNextByte(cpu);
    cpu.operation |= nextByte;
    const action = cpu.instructions[cpu.operation];
    if (typeof action === 'undefined') {
      // eslint-disable-next-line no-throw-literal
      throw 'illegal instruction ' + cpu.operation;
    }
    if (action.mode === 'fetch') {
      cpu.operation = nextByte << 8;
      cpu.code = [cpus.FETCH];
    } else {
      cpu.interpretInstruction(action);
    }
  };

  transfer_w_to_object(cpu) {
    cpu.object.set(cpu.W.fetch());
    cpu.W.set(0);
  };

  transfer_w_to_target(cpu) {
    cpu.target.set(cpu.W.fetch());
    cpu.W.set(0);
  };

  transfer_object_to_target(cpu) {
    cpu.target.set(cpu.object.fetch());
  };

  transfer_target_to_object(cpu) {
    cpu.object.set(cpu.target.fetch());
  };

  build_direct_page_address_in_W(cpu) {
    cpu.W.set(
        (cpu.registers.get('DP').fetch() << 8) | cpu.fetchNextByte(cpu));
  };

  read_next_high_data_byte_from_PC(cpu) {
    cpu.W.set(cpu.fetchNextByte(cpu) << 8);
  };

  read_next_low_data_byte_from_PC(cpu) {
    cpu.object.load(cpu.W.fetch() | cpu.fetchNextByte(cpu));
  };

  read_next_high_data_byte_from_AD(cpu) {
    let AD = cpu.AD.fetch();
    const nextByte = cpu.memory.read(AD++);
    cpu.W.set(nextByte << 8);
    cpu.AD.set(AD);
  };

  read_next_low_data_byte_from_AD(cpu) {
    cpu.object.load(cpu.W.fetch() | cpu.memory.read(cpu.AD.fetch()));
  };

  read_next_low_data_byte_to_W_from_PC(cpu) {
    cpu.W.set(cpu.W.fetch() | cpu.fetchNextByte(cpu));
  };

  read_next_low_data_byte_to_W_from_AD(cpu) {
    cpu.W.set(cpu.W.fetch() | cpu.memory.read(cpu.AD.fetch()));
  };

  write_object_high_byte_to_AD(cpu) {
    let AD = cpu.AD.fetch();
    cpu.memory.write(AD++, (cpu.object.fetch() & 0xff00) >> 8);
    cpu.AD.set(AD);
  };

  write_object_low_byte_to_AD(cpu) {
    cpu.memory.write(cpu.AD.fetch(), cpu.object.save() & 0xff);
  };

  write_w_low_byte_to_AD(cpu) {
    cpu.memory.write(cpu.AD.fetch(), cpu.W.fetch() & 0xff);
  };

  busy_state(cpu) {
    // do nothing
  };

  read_and_compare_low_byte(cpu) {
    cpu.compare_low_byte(cpu, cpu.fetchNextByte(cpu));
  };

  read_ad_and_compare_low_byte(cpu) {
    cpu.compare_low_byte(cpu, cpu.memory.read(cpu.AD.fetch()));
  };

  compare_low_byte(cpu, w) {
    const o = cpu.object.fetch();
    cpu.compare_values(cpu, o, w, 0x80, 0x100, 0xff);
  };

  compare_w_with_word(cpu) {
    const w = cpu.W.fetch();
    const o = cpu.object.fetch();
    cpu.compare_values(cpu, o, w, 0x8000, 0x10000, 0xffff);
  };

  compare_values(cpu, o, w, msb_mask, ovb_mask, value_mask) {
    const mask = o ^ w;
    const result = o - w;
    const masked_result = result & value_mask;
    cpu.CC.overflow(((mask & (o ^ result)) & msb_mask) !== 0);
    cpu.CC.zero(masked_result === 0);
    cpu.CC.negative((masked_result & msb_mask) !== 0);
    cpu.CC.carry((result & ovb_mask) !== 0);
  }

  clear_register(cpu) {
    cpu.object.load(0);
    cpu.CC.carry(false);
  }

  inc_ob(cpu) {
    cpu.inc(cpu, cpu.object);
  };

  inc_w(cpu) {
    cpu.inc(cpu, cpu.W);
  };

  inc(cpu, register) {
    const o = register.fetch() & 0xff;
    const temp = o + 1;
    register.set(temp & 0xff);
    const w = register.fetch();
    cpu.CC.zero(w === 0);
    cpu.CC.negative((w & 0x80) !== 0);
    cpu.CC.overflow(w !== temp);
  };

  dec_ob(cpu) {
    cpu.dec(cpu, cpu.object);
  };

  dec_w(cpu) {
    cpu.dec(cpu, cpu.W);
  };

  dec(cpu, register) {
    const o = register.fetch() & 0xff;
    const temp = o - 1;
    register.set(temp);
    const w = register.fetch();
    cpu.CC.zero(w === 0);
    cpu.CC.negative((w & 0x80) !== 0);
    cpu.CC.overflow(w !== temp);
  };

  and_target_read(cpu) {
    if (cpu.target.name === 'PC') {
      cpu.read_next_low_data_byte_to_W_from_PC(cpu);
    } else {
      cpu.read_next_low_data_byte_to_W_from_AD(cpu);
    }
    cpu.and_ob(cpu);
  };

  and_control(cpu) {
    cpu.CC.value = cpu.alu1.and8(cpu.CC.value, cpu.W.fetch(), false);
  };

  and_ob(cpu) {
    cpu.object.set(cpu.alu1.and8(cpu.object.fetch(), cpu.W.fetch()));
  };

  or_target_read(cpu) {
    if (cpu.target.name === 'PC') {
      cpu.read_next_low_data_byte_to_W_from_PC(cpu);
    } else {
      cpu.read_next_low_data_byte_to_W_from_AD(cpu);
    }
    cpu.or_ob(cpu);
  };

  or_control(cpu) {
    cpu.CC.value = cpu.alu1.or8(cpu.CC.value, cpu.W.fetch(), false);
  }

  or_ob(cpu) {
    cpu.object.set(cpu.alu1.or8(cpu.object.fetch(), cpu.W.fetch()));
  }

  eor_target_read(cpu) {
    if (cpu.target.name === 'PC') {
      cpu.read_next_low_data_byte_to_W_from_PC(cpu);
    } else {
      cpu.read_next_low_data_byte_to_W_from_AD(cpu);
    }
    cpu.object.set(cpu.alu1.eor8(cpu.object.fetch(), cpu.W.fetch()));
  }

  shift_left(cpu) {
    cpu.object.set(cpu.alu1.shiftLeft8(cpu.object.fetch()));
  }

  rotate_left(cpu) {
    cpu.object.set(cpu.alu1.shiftLeft8(cpu.object.fetch(), true));
  }

  shift_right(cpu) {
    cpu.object.set(cpu.alu1.shiftRight8(cpu.object.fetch()));
  }

  rotate_right(cpu) {
    cpu.object.set(cpu.alu1.shiftRight8(cpu.object.fetch(), true));
  }

  read_and_bit_test(cpu) {
    const address = cpu.target.fetch();
    if (cpu.target === cpu.PC) {
      cpu.PC.set(address + 1);
    }
    cpu.alu1.and8(cpu.object.fetch(), cpu.memory.read(address));
  }

  complement_byte(cpu) {
    cpu.object.set(cpu.alu1.complement8(cpu.object.fetch()));
  }

  negate_byte(cpu) {
    cpu.object.set(cpu.alu1.negate8andTest(cpu.object.fetch()));
  }

  sign_extend(cpu) {
    if ((cpu.registers.get('B').fetch() & 0x80) !== 0) {
      cpu.registers.get('A').set(0xff);
      cpu.CC.negative(true);
    } else {
      cpu.registers.get('A').set(0x00);
      cpu.CC.negative(false);
    }
    cpu.CC.zero(cpu.registers.get('D').fetch() === 0);
  }

  decimal_adjust(cpu) {
    cpu.object.set(cpu.alu1.daa(cpu.object.fetch()));
  }

  exchange(cpu) {
    const id1 = (cpu.W.fetch() & 0xf0) >> 4;
    const id2 = cpu.W.fetch() & 0x0f;
    if ((id1 & 8) === (id2 & 8)) {
      const register1 = cpu.identifyRegister(id1);
      const register2 = cpu.identifyRegister(id2);
      const temporary = cpu.registers.get(register1).fetch();
      cpu.registers.get(register1).set(cpu.registers.get(register2).fetch());
      cpu.registers.get(register2).set(temporary);
    }
  }

  transfer(cpu) {
    const id1 = (cpu.W.fetch() & 0xf0) >> 4;
    const id2 = cpu.W.fetch() & 0x0f;
    if ((id1 & 8) === (id2 & 8)) {
      const register1 = cpu.identifyRegister(id1);
      const register2 = cpu.identifyRegister(id2);
      cpu.registers.get(register2).set(cpu.registers.get(register1).fetch());
    }
  }

  select_register(cpu, stackMask) {
    let register = cpu.stackOrder[stackMask];
    if (register === 'US') {
      if (cpu.object.name === 'U') {
        register = 'S';
      } else {
        register = 'U';
      }
    }
    return register;
  };

  push_reg_to_ad(cpu) {
    let mask = 0x80;
    let loop = true;
    let w = cpu.W.fetch();
    while (loop) {
      if ((mask & w) === mask) {
        cpu.W.set(w -= mask);
        if (w !== 0) {
          cpu.code.push(cpu.codes['PUSH']);
        }
        const register = cpu.select_register(cpu, mask);
        let address = cpu.target.fetch();
        const nextEntry = cpu.registers.get(register);
        const lowValue = nextEntry.fetch() & 0xff;
        cpu.memory.write(address--, lowValue);
        if (nextEntry.size === cpus.LONG) {
          cpu.code.push(cpu.codes['BUSY']);
          const highValue = (nextEntry.fetch() & 0xff00) >> 8;
          cpu.memory.write(address--, highValue);
        }
        cpu.target.set(address);
        loop = false;
      } else {
        mask = mask >> 1;
        loop = mask >= 1;
      }
    }
  };

  pull_reg_from_ad(cpu) {
    let mask = 0x01;
    let loop = true;
    let w = cpu.W.fetch();
    while (loop) {
      if ((mask & w) === mask) {
        cpu.W.set(w -= mask);
        if (w !== 0) {
          cpu.code.push(cpu.codes['PULL']);
        }
        const register = cpu.select_register(cpu, mask);
        let address = cpu.target.fetch();
        const nextEntry = cpu.registers.get(register);
        let pulledValue = 0;
        if (nextEntry.size === cpus.LONG) {
          cpu.code.push(cpu.codes['BUSY']);
          pulledValue += cpu.memory.read(++address) << 8;
        }
        pulledValue += cpu.memory.read(++address);
        nextEntry.set(pulledValue);
        cpu.target.set(address);
        loop = false;
      } else {
        mask = mask << 1;
        loop = mask <= 0x100;
      }
    }
  };

  push_pc_to_ad(cpu) {
    let address = cpu.registers.get('S').fetch();
    const value = cpu.PC.fetch();
    const lowValue = value & 0xff;
    cpu.memory.write(address--, lowValue);
    const highValue = (value & 0xff00) >> 8;
    cpu.memory.write(address--, highValue);
    cpu.registers.get('S').set(address);
  };

  pull_pc_from_ad(cpu) {
    let address = cpu.target.fetch();
    const highValue = cpu.memory.read(++address) << 8;
    const lowValue = cpu.memory.read(++address);
    cpu.PC.set(highValue | lowValue);
    cpu.target.set(address);
  };

  pull_and_test_cc(cpu) {
    let address = cpu.target.fetch();
    cpu.CC.value = cpu.memory.read(++address);
    cpu.target.set(address);
    if(cpu.CC.ifentireset()) {
      cpu.code.push(cpu.codes['PULL']);
      cpu.W.set(0x7e);
    }
  }

  push_pc_and_cc(cpu) {
    cpu.W.set(0x81);
    cpu.push_reg_to_ad(cpu);
  }

  set_entire_flag(cpu) {
    cpu.CC.entire(true);
    cpu.W.set(0xff);
  }

  vector_msb(cpu) {
    const msb = cpu.memory.read(cpu.vector);
    cpu.PC.set(msb << 8);
  }

  vector_lsb(cpu) {
    const lsb = cpu.memory.read(cpu.vector + 1);
    cpu.PC.set(cpu.PC.fetch() | lsb);
  }

  suspend_interrupts(cpu) {
    cpu.CC.irq((cpu.mask & cpus.IRQ) !== 0);
    cpu.CC.firq((cpu.mask & cpus.FIRQ) !== 0);
  }

  wait(cpu) {
    cpu.runState = cpus.WAITING;
  }

  sync(cpu) {
    cpu.runState = cpus.SYNCING;
  }

  calculate_index_to_ad(cpu) {
    const OFFSET_TYPE_MASK = 0x80;
    const OFFSET_MASK = 0x1f;
    const INDIRECT_MASK = 0x10;
    const postByte = cpu.W.fetch();
    cpu.W.set(0);
    const register = cpu.postbyte_to_register(cpu, postByte);
    const direct = (INDIRECT_MASK & postByte) !== INDIRECT_MASK;
    let offset = (postByte & OFFSET_MASK);
    if ((postByte & OFFSET_TYPE_MASK) === OFFSET_TYPE_MASK) {
      if (direct) {
        const mode = (postByte & OFFSET_MASK);
        switch (mode) {
          case 0:
            cpu.target.set(cpu.direct_increment(cpu, 1, register));
            break;
          case 1:
            cpu.target.set(cpu.direct_increment(cpu, 2, register));
            break;
          case 2:
            cpu.target.set(cpu.direct_decrement(cpu, 1, register));
            break;
          case 3:
            cpu.target.set(cpu.direct_decrement(cpu, 2, register));
            break;
          case 4:
            cpu.target.set(register.fetch());
            break;
          case 5:
            cpu.target.set(cpu.direct_byte_offset(cpu,
                cpu.registers.get('B').fetch(), register
            ));
            break;
          case 6:
            cpu.target.set(cpu.direct_byte_offset(cpu,
                cpu.registers.get('A').fetch(), register
            ));
            break;
          case 8:
            cpu.target.set(cpu.direct_byte_offset(cpu,
                cpu.fetchNextByte(cpu), register
            ));
            break;
          case 9:
            cpu.target.set(cpu.direct_word_offset(cpu,
                (cpu.fetchNextByte(cpu) << 8) + cpu.fetchNextByte(cpu), register
            ));
            break;
          case 11:
            cpu.target.set(cpu.direct_word_offset(cpu,
                cpu.registers.get('D').fetch(), register
            ));
            break;
          case 12:
            cpu.target.set(cpu.direct_byte_offset(cpu,
                cpu.fetchNextByte(cpu), cpu.PC
            ));
            break;
          case 13:
            cpu.target.set(cpu.direct_word_offset(cpu,
                (cpu.fetchNextByte(cpu) << 8) + cpu.fetchNextByte(cpu), cpu.PC
            ));
            cpu.code.push(cpu.codes['BUSY']);
        }
      } else {
        const mode = (postByte & OFFSET_MASK) - INDIRECT_MASK;
        switch (mode) {
          case 1:
            cpu.target.set(cpu.direct_increment(cpu, 2, register));
            break;
          case 3:
            cpu.target.set(cpu.direct_decrement(cpu, 2, register));
            break;
          case 4:
            cpu.target.set(register.fetch());
            break;
          case 5:
            cpu.target.set(cpu.direct_byte_offset(cpu,
                cpu.registers.get('B').fetch(), register
            ));
            break;
          case 6:
            cpu.target.set(cpu.direct_byte_offset(cpu,
                cpu.registers.get('A').fetch(), register
            ));
            break;
          case 8:
            cpu.target.set(cpu.direct_byte_offset(cpu,
                cpu.fetchNextByte(cpu), register
            ));
            break;
          case 9:
            cpu.target.set(cpu.direct_word_offset(cpu,
                (cpu.fetchNextByte(cpu) << 8) + cpu.fetchNextByte(cpu), register
            ));
            break;
          case 11:
            cpu.target.set(cpu.direct_word_offset(cpu,
                cpu.registers.get('D').fetch(), register
            ));
            break;
          case 12:
            cpu.target.set(cpu.direct_byte_offset(cpu,
                cpu.fetchNextByte(cpu), cpu.PC
            ));
            break;
          case 13:
            cpu.target.set(cpu.direct_word_offset(cpu,
                (cpu.fetchNextByte(cpu) << 8) + cpu.fetchNextByte(cpu), cpu.PC
            ));
            cpu.code.push(cpu.codes['BUSY']);
            break;
          case 15:
            cpu.target.set((cpu.fetchNextByte(cpu) << 8) + cpu.fetchNextByte(cpu));
            cpu.code.push(cpu.codes['BUSY']);
            cpu.code.push(cpu.codes['BUSY']);
            break;
        }
        cpu.code.push(cpu.codes['SWAPWAD']);
        cpu.code.push(cpu.codes['READADWLOW']);
        cpu.code.push(cpu.codes['READADHIGH']);
      }
    } else {
      cpu.target.set(cpu.direct_constant_offset(cpu, offset, register));
    }
  }

  direct_constant_offset(cpu, offset, register) {
    cpu.code.push(cpu.codes['BUSY']);
    return cpu.alu1.offsetEA5(offset, register.fetch());
  }

  direct_byte_offset(cpu, offset, register) {
    cpu.code.push(cpu.codes['BUSY']);
    return cpu.alu1.offsetEA8(offset, register.fetch());
  }

  direct_word_offset(cpu, offset, register) {
    cpu.code.push(cpu.codes['BUSY']);
    cpu.code.push(cpu.codes['BUSY']);
    cpu.code.push(cpu.codes['BUSY']);
    cpu.code.push(cpu.codes['BUSY']);
    return cpu.alu1.offsetEA16(offset, register.fetch());
  }

  direct_increment(cpu, step, register) {
    for (let counter = 0; counter <= step; ++counter) {
      cpu.code.push(cpu.codes['BUSY']);
    }
    const address = register.fetch();
    register.set(address + step);
    return address;
  }

  direct_decrement(cpu, step, register) {
    for (let counter = 0; counter <= step; ++counter) {
      cpu.code.push(cpu.codes['BUSY']);
    }
    const address = register.fetch() - step;
    register.set(address);
    return address;
  }

  postbyte_to_register(cpu, postByte) {
    const REGISTER_MASK = 0x60;
    const register = (postByte & REGISTER_MASK) >> 5;
    return cpu.registers.get(cpu.postbyteRegisters[register]);
  }

  check_cc(cpu, initial, complement, object, sum, masked) {
    cpu.CC.zero(masked === 0);
    cpu.CC.negative((masked & 0x80) !== 0);
    cpu.CC.overflow(sum !== masked);
    cpu.CC.carry(initial < object);
  };

  check_cc_w(cpu, initial, complement, object, sum, masked) {
    cpu.CC.zero(masked === 0);
    cpu.CC.negative((masked & 0x8000) !== 0);
    cpu.CC.overflow(sum !== masked);
    cpu.CC.carry(initial < object);
  };

  twos_complement(register, scale) {
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

  xor(value, scale) {
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
