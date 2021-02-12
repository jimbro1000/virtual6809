const {factory} = require('../../src/memory/memory_factory');
const each = require('jest-each').default;
const {Cpu} = require('../../src/cpu/cpu');
const cpus = require('../../src/cpu/cpu_constants');

/**
 * Cycle processor to complete a single instruction.
 *
 * @param {Cpu} subject
 * @return {number} cycles used
 */
function runToNext(subject) {
  let cycles = 0;
  do {
    subject.cycle();
    cycles++;
  } while (subject.code[0] !== cpus.NEXT);
  return cycles;
}

describe('6809 cpu', () => {
  describe('address mode translation', () => {
    describe('literal mode', () => {
      let subject;
      beforeEach(() => {
        subject = new Cpu(undefined);
      });
      it('loads a fixed literal short value into a register', () => {
        const value = 100;
        const register = subject.registers.get('A');
        subject.subject_register = register;
        subject.setRegisterLiteral(register, value);
        expect(register.fetch()).toBe(value);
      });

      each(
          [[0xff42, 0x20, 0xff20], [0xffff, 0x00, 0xff00]],
      ).it(
          'loads a fixed literal short value into the low byte of a register',
          (initial, value, expected) => {
            const register = subject.registers.get('X');
            register.set(initial);
            subject.subject_register = register;
            subject.setRegisterLiteralLow(register, value);
            expect(register.fetch()).toBe(expected);
          });

      each(
          [[0xff42, 0x20, 0x2042], [0xffff, 0x00, 0x00ff]],
      ).it(
          'loads a fixed literal short value into the high byte of a register',
          (initial, value, expected) => {
            const register = subject.registers.get('X');
            register.set(initial);
            subject.subject_register = register;
            subject.setRegisterLiteralHigh(register, value);
            expect(register.fetch()).toBe(expected);
          });

      it(
          'has a helper to load a short value into a register by name',
          () => {
            const register = subject.registers.get('A');
            register.set(0);
            subject.setRegisterLiteral('A', 20);
            expect(subject.registers.get('A').fetch()).toBe(20);
          });

      it(
          'helper to load a short value into the low byte a register by name',
          () => {
            const register = subject.registers.get('X');
            register.set(65535);
            subject.setRegisterLiteralLow('X', 0x55);
            expect(subject.registers.get('X').fetch()).toBe(0xff55);
          });

      it(
          'helper to load a short value into the high byte a register by name',
          () => {
            const register = subject.registers.get('X');
            register.set(65535);
            subject.setRegisterLiteralHigh('X', 0x55);
            expect(subject.registers.get('X').fetch()).toBe(0x55ff);
          });
    });
  });

  describe('cpu bootstrap', () => {
    it('initiates with loading a vector from $0xfffe', () => {
      const subject = new Cpu(undefined);
      const codeStack = [cpus.TFRWTOOB, cpus.READWLOW, cpus.READHIGH];
      expect(subject.PC.fetch()).toBe(0xfffe);
      expect(subject.code).toEqual(codeStack);
    });
  });

  describe('cpu operation', () => {
    let subject;
    beforeEach(() => {
      subject = new Cpu(factory('D64'));
      subject.clearInstruction();
    });

    const loadMemory = (address, bytes) => {
      for (let index = 0; index < bytes.length; ++index) {
        subject.memory.write(address + index, bytes[index]);
      }
    };

    /**
     * Helper to prepare memory and cpu for a test
     *
     * @param {number} address
     * @param {Object[]} code
     * @param {string} register
     * @param {number} value
     */
    function prepareTest(address, code, register, value) {
      loadMemory(address, code);
      subject.registers.get('PC').set(address);
      subject.registers.get(register).set(value);
    }

    /**
     * Helper to prepare memory and cpu for a memory content test
     *
     * @param {number} address to load code
     * @param {Object[]} code code to be loaded
     * @param {number} value pre-condition value
     * @param {number} atAddress address for pre-condition value
     * @param {string} register register to set
     */
    function prepareWordComparison(
        address, code, value, atAddress, register) {
      prepareTest(address, code, register, value);
      subject.memory.write(atAddress, (value & 0xff00) >> 8);
      subject.memory.write(atAddress + 1, value & 0xff);
    }

    /**
     * Helper to prepare memory and cpu for a memory content test
     *
     * @param {number} address to load code
     * @param {Object[]} code code to be loaded
     * @param {number} value pre-condition value
     * @param {number} atAddress address for pre-condition value
     * @param {string} register register to set
     */
    function prepareByteComparison(
        address, code, value, atAddress, register) {
      prepareTest(address, code, register, value);
      subject.memory.write(atAddress, value & 0xff);
    }

    /**
     * Helper to compare a block of memory
     *
     * @param {number} address to check code
     * @param {Object[]} code code to be checked against
     * @return {boolean}
     */
    function compareMemory(address, code) {
      let result = true;
      for (let index = 0; index < code.length; index++) {
        result = result &&
            (subject.memory.read(address + index) === code[index]);
      }
      return result;
    }

    each([
      [0x0, 'A', [0x86, 0x20], 0x20, 2], [0x0, 'A', [0x86, 0xff], 0xff, 2],
      [0x0, 'B', [0xc6, 0x22], 0x22, 2], [0x0, 'B', [0xc6, 0xf0], 0xf0, 2],
    ]).it(
        'processes a load instruction from memory into an 8 bit register',
        (address, registerName, code, expected, cycles) => {
          prepareTest(address, code, registerName, 0);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get(registerName).fetch()).
              toBe(expected);
        });

    each([
      [0x0, 'A', 0x01, [0x96, 0x20], 0x21, 0x0120, 4],
      [0x0, 'A', 0x01, [0x96, 0xff], 0x55, 0x01ff, 4],
      [0x0, 'B', 0x01, [0xd6, 0x22], 0x22, 0x0122, 4],
      [0x0, 'B', 0x01, [0xd6, 0xf0], 0xf0, 0x01f0, 4],
    ]).it(
        'processes load instruction from direct memory into an 8 bit register',
        (
            address, registerName, page, code, expected, atAddress,
            cycles) => {
          prepareByteComparison(address, code, expected, atAddress,
              registerName);
          subject.registers.get('DP').set(page);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get(registerName).fetch()).
              toBe(expected);
        });

    each([
      [0x0, 'A', [0xb6, 0x01, 0x20], 0x21, 0x0120, 5],
      [0x0, 'A', [0xb6, 0x01, 0xff], 0x55, 0x01ff, 5],
      [0x0, 'B', [0xf6, 0x01, 0x22], 0x22, 0x0122, 5],
      [0x0, 'B', [0xf6, 0x01, 0xf0], 0xf0, 0x01f0, 5],
    ]).it(
        'processes load from extended memory into an 8 bit register',
        (address, registerName, code, expected, atAddress, cycles) => {
          prepareByteComparison(address, code, expected, atAddress,
              registerName);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get(registerName).fetch()).
              toBe(expected);
        });

    each([
      [0x0, 'X', [0x8e, 0x20, 0x55], 0x2055, 3],
      [0x0, 'X', [0x8e, 0xff, 0x01], 0xff01, 3],
      [0x0, 'Y', [0x10, 0x8e, 0x20, 0x55], 0x2055, 4],
      [0x0, 'Y', [0x10, 0x8e, 0xff, 0x01], 0xff01, 4],
      [0x0, 'S', [0x10, 0xce, 0x20, 0x55], 0x2055, 4],
      [0x0, 'S', [0x10, 0xce, 0xff, 0x01], 0xff01, 4],
      [0x0, 'U', [0xce, 0x20, 0x55], 0x2055, 3],
      [0x0, 'U', [0xce, 0xff, 0x01], 0xff01, 3],
      [0x0, 'D', [0xcc, 0x55, 0xaa], 0x55aa, 3],
    ]).it(
        'processes a load instruction from memory into a 16bit register',
        (address, registerName, code, expected, cycles) => {
          prepareTest(address, code, registerName, 0);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get(registerName).fetch()).
              toBe(expected);
        });

    each([
      [0x0, 'X', 0x20, [0x9e, 0x55], 0x10, 0x2055, 5],
      [0x0, 'X', 0x0f, [0x9e, 0x01], 0x55, 0x0f01, 5],
      [0x0, 'Y', 0x20, [0x10, 0x9e, 0x55], 0x20, 0x2055, 6],
      [0x0, 'Y', 0x0f, [0x10, 0x9e, 0x01], 0xaa, 0x0f01, 6],
      [0x0, 'S', 0x20, [0x10, 0xde, 0x55], 0x40, 0x2055, 6],
      [0x0, 'S', 0x0f, [0x10, 0xde, 0x01], 0xaa, 0x0f01, 6],
      [0x0, 'U', 0x20, [0xde, 0x55], 0x80, 0x2055, 5],
      [0x0, 'U', 0x0f, [0xde, 0x01], 0x55, 0x0f01, 5],
      [0x0, 'D', 0x0f, [0xdc, 0x10], 0x5555, 0x0f10, 5],
    ]).it(
        'processes a load instruction from direct memory into a 16bit register',
        (
            address, registerName, page, code, expected, atAddress,
            cycles) => {
          prepareWordComparison(address, code, expected, atAddress,
              registerName);
          subject.registers.get('DP').set(page);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get(registerName).fetch()).
              toBe(expected);
        });

    each([
      [0x0, 'X', [0xbe, 0x20, 0x55], 0x2055, [0x00, 0x10], 0x10, 6],
      [0x0, 'X', [0xbe, 0x0f, 0x01], 0x0f01, [0x00, 0x55], 0x55, 6],
      [0x0, 'Y', [0x10, 0xbe, 0x20, 0x55], 0x2055, [0x00, 0x20], 0x20, 7],
      [0x0, 'Y', [0x10, 0xbe, 0x0f, 0x01], 0x0f01, [0x00, 0xaa], 0xaa, 7],
      [0x0, 'S', [0x10, 0xfe, 0x20, 0x55], 0x2055, [0x01, 0x40], 0x0140, 7],
      [0x0, 'S', [0x10, 0xfe, 0x0f, 0x01], 0x0f01, [0x00, 0xaa], 0xaa, 7],
      [0x0, 'U', [0xfe, 0x20, 0x55], 0x2055, [0x80, 0x80], 0x8080, 6],
      [0x0, 'U', [0xfe, 0x0f, 0x01], 0x0f01, [0x00, 0x55], 0x55, 6],
      [0x0, 'D', [0xfc, 0x0f, 0x10], 0x0f10, [0x55, 0x55], 0x5555, 6],
    ]).it(
        'processes load from extended memory into a 16bit register',
        (
            address, registerName, code, atAddress, value, expected,
            cycles) => {
          loadMemory(address, code);
          loadMemory(atAddress, value);
          subject.registers.get('PC').set(address);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get(registerName).fetch()).
              toBe(expected);
        });

    it('processes a sequence of load instructions', () => {
      const code = [0x8e, 0x55, 0x20, 0x86, 0xff];
      loadMemory(0, code);
      subject.registers.get('PC').set(0);
      subject.registers.get('A').set(0);
      subject.registers.get('X').set(0);
      let cycleCount = code.length;
      while (cycleCount > 0) {
        subject.cycle();
        cycleCount--;
      }
      expect(subject.registers.get('X').fetch()).toBe(0x5520);
      expect(subject.registers.get('A').fetch()).toBe(0xff);
    });

    each([
      [0x0, 'A', [0xb7, 0x20, 0x00], 0x10, 0x2000, 5],
      [0x0, 'A', [0xb7, 0x20, 0x00], 0xff, 0x2000, 5],
      [0x0, 'B', [0xf7, 0x22, 0x00], 0xff, 0x2200, 5],
      [0x0, 'B', [0xf7, 0x10, 0x10], 0xf0, 0x1010, 5],
    ]).it(
        'processes a store instruction to memory from an 8 bit register',
        (address, registerName, code, expected, atAddress, cycles) => {
          prepareTest(address, code, registerName, expected);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.memory.read(atAddress)).toBe(expected);
        });

    each([
      [0x0, 'A', 0x20, [0x97, 0x00], 0x10, 0x2000, 4],
      [0x0, 'A', 0x20, [0x97, 0x00], 0xff, 0x2000, 4],
      [0x0, 'B', 0x22, [0xd7, 0x00], 0xff, 0x2200, 4],
      [0x0, 'B', 0x10, [0xd7, 0x10], 0xf0, 0x1010, 4],
    ]).it(
        'processes store to direct page memory from an 8 bit register',
        (
            address, registerName, page, code, expected, atAddress,
            cycles) => {
          prepareTest(address, code, registerName, expected);
          subject.registers.get('DP').set(page);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.memory.read(atAddress)).toBe(expected);
        });

    each([
      [0x0, 'X', [0xbf, 0x20, 0x00], 0x1020, 0x2000, 6],
      [0x0, 'X', [0xbf, 0x20, 0x00], 0xffff, 0x2000, 6],
      [0x0, 'Y', [0x10, 0xbf, 0x22, 0x00], 0xff55, 0x2200, 7],
      [0x0, 'Y', [0x10, 0xbf, 0x10, 0x10], 0xf0ff, 0x1010, 7],
      [0x0, 'S', [0x10, 0xff, 0x20, 0x00], 0x1020, 0x2000, 7],
      [0x0, 'S', [0x10, 0xff, 0x20, 0x00], 0xfff0, 0x2000, 7],
      [0x0, 'U', [0xff, 0x22, 0x00], 0xff55, 0x2200, 6],
      [0x0, 'U', [0xff, 0x10, 0x10], 0xf0ff, 0x1010, 6],
      [0x0, 'D', [0xfd, 0x10, 0x20], 0x5555, 0x1020, 6],
    ]).it(
        'processes a store instruction to memory from a 16 bit register',
        (address, registerName, code, expected, atAddress, cycles) => {
          prepareTest(address, code, registerName, expected);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          const actual = subject.memory.read(atAddress) << 8 |
              subject.memory.read(atAddress + 1);
          expect(actual).toBe(expected);
        });

    each([
      [0x0, 'X', 0x20, [0x9f, 0x00], 0x1020, 0x2000, 5],
      [0x0, 'X', 0x20, [0x9f, 0x00], 0xffff, 0x2000, 5],
      [0x0, 'Y', 0x22, [0x10, 0x9f, 0x00], 0xff55, 0x2200, 6],
      [0x0, 'Y', 0x10, [0x10, 0x9f, 0x10], 0xf0ff, 0x1010, 6],
      [0x0, 'S', 0x20, [0x10, 0xdf, 0x00], 0x1020, 0x2000, 6],
      [0x0, 'S', 0x20, [0x10, 0xdf, 0x00], 0xfff0, 0x2000, 6],
      [0x0, 'U', 0x22, [0xdf, 0x00], 0xff55, 0x2200, 5],
      [0x0, 'U', 0x10, [0xdf, 0x10], 0xf0ff, 0x1010, 5],
      [0x0, 'D', 0x10, [0xdd, 0xfe], 0xaaaa, 0x10fe, 5],
    ]).it(
        'processes store to direct page memory from 16 bit register',
        (
            address, registerName, page, code, expected, atAddress,
            cycles) => {
          prepareTest(address, code, registerName, expected);
          subject.registers.get('DP').set(page);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          const actual = subject.memory.read(atAddress) << 8 |
              subject.memory.read(atAddress + 1);
          expect(actual).toBe(expected);
        });

    it('process a nop instruction', () => {
      const code = [0x12];
      loadMemory(0x0000, code);
      subject.registers.get('PC').set(0x0000);
      const cycleCount = runToNext(subject);
      expect(cycleCount).toBe(2);
      expect(subject.registers.get('PC').fetch()).toBe(0x0001);
      // expect(subject.mode).toBe(cpus.NEXT);
    });

    it('process an extended jmp to reload the program counter', () => {
      const code = [0x7e, 0x80, 0x00];
      loadMemory(0x0000, code);
      subject.registers.get('PC').set(0x0000);
      const cycleCount = runToNext(subject);
      expect(cycleCount).toBe(4);
      expect(subject.registers.get('PC').fetch()).toBe(0x8000);
    });

    it('ABX adds B unsigned to X', () => {
      const code = [0x3a];
      loadMemory(0x0000, code);
      subject.registers.get('PC').set(0x0000);
      subject.registers.get('B').set(0xff);
      subject.registers.get('X').set(0x1000);
      const cycleCount = runToNext(subject);
      expect(cycleCount).toBe(3);
      expect(subject.registers.get('PC').fetch()).toBe(0x0001);
      expect(subject.registers.get('X').fetch()).toBe(0x10ff);
    });

    each([
      [0x0, 'A', 0x20, [0x81, 0x20], 0x6, 2],
      [0x0, 'A', 0x20, [0x81, 0x21], 0x8, 2],
      [0x0, 'A', 0x20, [0x81, 0x1f], 0x3, 2],
      [0x0, 'B', 0x55, [0xc1, 0x55], 0x6, 2]],
    ).it(
        'Compares an 8 bit register against immediate memory',
        (address, register, value, code, expected, cycles) => {
          prepareTest(address, code, register, value);
          const ccMask = cpus.ZERO | cpus.NEGATIVE | cpus.OVERFLOW |
              cpus.CARRY;
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.CC.save() & ccMask).toBe(expected);
        });

    each([
      [0x0, 'A', 0x20, 0x10, [0x91, 0x20], 0x6, 0x1020, 4],
      [0x0, 'B', 0x55, 0x11, [0xd1, 0x55], 0x6, 0x1155, 4]],
    ).it(
        'Compares an 8 bit register against direct memory',
        (
            address, register, value, page, code, expected, atAddress,
            cycles) => {
          prepareByteComparison(address, code, value, atAddress,
              register);
          subject.registers.get('DP').set(page);
          const ccMask = cpus.ZERO | cpus.NEGATIVE | cpus.OVERFLOW |
              cpus.CARRY;
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.CC.save() & ccMask).toBe(expected);
        });

    each([
      [0x0, 'A', 0x20, [0xb1, 0x10, 0x20], 0x6, 0x1020, 5],
      [0x0, 'B', 0x55, [0xf1, 0x11, 0xaa], 0x6, 0x11aa, 5]],
    ).it(
        'Compares an 8 bit register against extended memory',
        (address, register, value, code, expected, atAddress, cycles) => {
          prepareByteComparison(address, code, value, atAddress,
              register);
          const ccMask = cpus.ZERO | cpus.NEGATIVE | cpus.OVERFLOW |
              cpus.CARRY;
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.CC.save() & ccMask).toBe(expected);
        });

    each([
      [0x0000, 'X', [0x8c, 0x55, 0xaa], 0x55aa, 0x06, 4],
      [0x0000, 'Y', [0x10, 0x8c, 0x55, 0xaa], 0x55aa, 0x06, 5],
      [0x0000, 'S', [0x11, 0x8c, 0x55, 0xaa], 0x55aa, 0x06, 5],
      [0x0000, 'U', [0x11, 0x83, 0x55, 0xaa], 0x55aa, 0x06, 5],
    ]).it(
        'Compares a 16 bit register against immediate memory',
        (address, register, code, value, expected, cycles) => {
          prepareTest(address, code, register, value);
          const ccMask = cpus.ZERO | cpus.NEGATIVE | cpus.OVERFLOW |
              cpus.CARRY;
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.CC.save() & ccMask).toBe(expected);
        });

    each([
      [0x0000, 'X', 0x10, [0x9c, 0xaa], 0x55aa, 0x10aa, 0x06, 6],
      [0x0000, 'Y', 0x11, [0x10, 0x9c, 0xaa], 0x55aa, 0x11aa, 0x06, 7],
      [0x0000, 'S', 0x12, [0x11, 0x9c, 0xaa], 0x55aa, 0x12aa, 0x06, 7],
      [0x0000, 'U', 0x13, [0x11, 0x93, 0xaa], 0x55aa, 0x13aa, 0x06, 7],
    ]).it(
        'Compares a 16 bit register against direct memory',
        (
            address, register, page, code, value, atAddress, expected,
            cycles) => {
          prepareWordComparison(address, code, value, atAddress,
              register);
          subject.registers.get('DP').set(page);
          const ccMask = cpus.ZERO | cpus.NEGATIVE | cpus.OVERFLOW |
              cpus.CARRY;
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.CC.save() & ccMask).toBe(expected);
        });

    each([
      [0x0000, 'X', [0xbc, 0x10, 0xaa], 0x55aa, 0x10aa, 0x06, 7],
      [0x0000, 'Y', [0x10, 0xbc, 0x11, 0xaa], 0x55aa, 0x11aa, 0x06, 8],
      [0x0000, 'S', [0x11, 0xbc, 0x12, 0xaa], 0x55aa, 0x12aa, 0x06, 8],
      [0x0000, 'U', [0x11, 0xb3, 0x13, 0xaa], 0x55aa, 0x13aa, 0x06, 8],
    ]).it(
        'Compares a 16 bit register against direct memory',
        (address, register, code, value, atAddress, expected, cycles) => {
          prepareWordComparison(address, code, value, atAddress,
              register);
          const ccMask = cpus.ZERO | cpus.NEGATIVE | cpus.OVERFLOW |
              cpus.CARRY;
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.CC.save() & ccMask).toBe(expected);
        });

    each([
      [0x0000, 'A', [0x4c], 0x00, 0x01, 2, 0x00],
      [0x0000, 'A', [0x4c], 0xff, 0x00, 2, cpus.ZERO | cpus.OVERFLOW],
      [0x0000, 'B', [0x5c], 0x00, 0x01, 2, 0x00],
      [0x0000, 'B', [0x5c], 0x7f, 0x80, 2, cpus.NEGATIVE],
    ]).it(
        'increments a register',
        (address, register, code, value, expected, cycles, ccFlags) => {
          prepareTest(address, code, register, value);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get(register).fetch()).toBe(expected);
          expect(subject.CC.save() & ccFlags).toBe(ccFlags);
        });

    each([
      [0x0000, [0x7c, 0x20, 0x01], 0x00, 0x2001, 0x01, 6, 0x00],
      [
        0x0000,
        [0x7c, 0x20, 0x02],
        0xff,
        0x2002,
        0x00,
        6,
        cpus.ZERO | cpus.OVERFLOW],
    ]).it(
        'increments a byte in extended memory',
        (address, code, value, atAddress, expected, cycles, ccFlags) => {
          loadMemory(address, code);
          subject.memory.write(atAddress, value);
          subject.registers.get('PC').set(address);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.memory.read(atAddress)).toBe(expected);
          expect(subject.CC.save() & ccFlags).toBe(ccFlags);
        });

    each([
      [0x0000, 'A', [0x4a], 0x02, 0x01, 2, 0x00],
      [0x0000, 'A', [0x4a], 0x00, 0xff, 2, cpus.NEGATIVE],
      [0x0000, 'B', [0x5a], 0x02, 0x01, 2, 0x00],
      [0x0000, 'B', [0x5a], 0x01, 0x00, 2, cpus.ZERO],
    ]).it('decrements a register',
        (address, register, code, value, expected, cycles, ccFlags) => {
          prepareTest(address, code, register, value);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get(register).fetch()).toBe(expected);
          expect(subject.CC.save() & ccFlags).toBe(ccFlags);
        });

    each([
      [0x0000, [0x7a, 0x20, 0x01], 0x02, 0x2001, 0x01, 6, 0x00],
      [0x0000, [0x7a, 0x20, 0x02], 0x01, 0x2002, 0x00, 6, cpus.ZERO],
    ]).it(
        'decrements a byte in extended memory',
        (address, code, value, atAddress, expected, cycles, ccFlags) => {
          loadMemory(address, code);
          subject.memory.write(atAddress, value);
          subject.registers.get('PC').set(address);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.memory.read(atAddress)).toBe(expected);
          expect(subject.CC.save() & ccFlags).toBe(ccFlags);
        });

    it('pushes registers to the S stack', () => {
      const code = [0x34, 0x87];
      const result = [0x00, 0x40, 0x80, 0x00, 0x02];
      const address = 0x0000;
      const register = 'S';
      const atAddress = 0x3fff;
      const resultAddress = 0x3ffa;
      subject.registers.get('A').set(0x40);
      subject.registers.get('B').set(0x80);
      subject.registers.get('PC').set(address);
      loadMemory(address, code);
      subject.registers.get(register).set(atAddress);
      const cycles = 10;
      const cycleCount = runToNext(subject);
      expect(cycleCount).toBe(cycles);
      expect(subject.registers.get(register).fetch()).toBe(resultAddress);
      expect(compareMemory(resultAddress + 1, result)).toBeTruthy();
    });

    it('pushes U register to the S stack', () => {
      const code = [0x34, 0x40];
      const result = [0x2f, 0xff];
      const address = 0x0000;
      const register = 'S';
      const atAddress = 0x3fff;
      const resultAddress = 0x3ffd;
      subject.registers.get('U').set(0x2fff);
      subject.registers.get('PC').set(address);
      loadMemory(address, code);
      subject.registers.get(register).set(atAddress);
      const cycles = 7;
      const cycleCount = runToNext(subject);
      expect(cycleCount).toBe(cycles);
      expect(subject.registers.get(register).fetch()).toBe(resultAddress);
      expect(compareMemory(resultAddress + 1, result)).toBeTruthy();
    });

    it('pushes registers to the U stack', () => {
      const code = [0x36, 0x85];
      const stackResult = [0x00, 0x55, 0x01, 0x02];
      const pcAddress = 0x0100;
      const register = 'U';
      const atAddress = 0x3eff;
      const resultAddress = 0x3efb;
      subject.registers.get('B').set(0x55);
      loadMemory(pcAddress, code);
      subject.registers.get('PC').set(pcAddress);
      subject.registers.get(register).set(atAddress);
      const cycles = 9;
      const cycleCount = runToNext(subject);
      expect(cycleCount).toBe(cycles);
      expect(subject.registers.get(register).fetch()).toBe(resultAddress);
      expect(compareMemory(resultAddress + 1, stackResult)).toBeTruthy();
    });

    it('pushes S register to the U stack', () => {
      const code = [0x36, 0x40];
      const stackresult = [0x2f, 0xff];
      const pcAddress = 0x0000;
      const register = 'U';
      const atAddress = 0x3fff;
      const resultAddress = 0x3ffd;
      subject.registers.get('S').set(0x2fff);
      loadMemory(pcAddress, code);
      subject.registers.get('PC').set(pcAddress);
      subject.registers.get(register).set(atAddress);
      const cycles = 7;
      const cycleCount = runToNext(subject);
      expect(cycleCount).toBe(cycles);
      expect(subject.registers.get(register).fetch()).toBe(resultAddress);
      expect(compareMemory(resultAddress + 1, stackresult)).toBeTruthy();
    });

    it('pulls registers from the S stack', () => {
      const code = [0x35, 0x87];
      const stackContent = [0x09, 0x40, 0x80, 0x01, 0x02];
      const address = 0x0000;
      const register = 'S';
      const finalAddress = 0x3fff;
      const initialAddress = 0x3ffa;
      loadMemory(address, code);
      loadMemory(initialAddress, stackContent);
      subject.registers.get(register).set(initialAddress);
      subject.registers.get('PC').set(address);
      const cycles = 10;
      const cycleCount = runToNext(subject);
      expect(cycleCount).toBe(cycles);
      expect(subject.registers.get(register).fetch()).toBe(finalAddress);
      expect(subject.registers.get('A').fetch()).toBe(0x40);
      expect(subject.registers.get('B').fetch()).toBe(0x80);
      expect(subject.registers.get('PC').fetch()).toBe(0x0102);
      expect(subject.CC.fetch()).toBe(0x09);
    });

    it('jumps to subroutine at direct address', () => {
      const pcAddress = 0x0000;
      const code = [0x9d, 0x20];
      const stackAddress = 0x3fff;
      const expectedAddress = 0x0520;
      loadMemory(pcAddress, code);
      subject.registers.get('PC').set(pcAddress);
      subject.registers.get('DP').set(0x05);
      subject.registers.get('S').set(stackAddress);
      const cycles = 7;
      const cycleCount = runToNext(subject);
      expect(cycleCount).toBe(cycles);
      expect(subject.registers.get('PC').fetch()).toBe(expectedAddress);
      expect(subject.registers.get('S').fetch()).toBe(stackAddress - 2);
    });

    it('jumps to subroutine at extended address', () => {
      const pcAddress = 0x0000;
      const code = [0xbd, 0x06, 0x20];
      const stackAddress = 0x3fff;
      const expectedAddress = 0x0620;
      loadMemory(pcAddress, code);
      subject.registers.get('PC').set(pcAddress);
      subject.registers.get('S').set(stackAddress);
      const cycles = 8;
      const cycleCount = runToNext(subject);
      expect(cycleCount).toBe(cycles);
      expect(subject.registers.get('PC').fetch()).toBe(expectedAddress);
      expect(subject.registers.get('S').fetch()).toBe(stackAddress - 2);
    });

    it('returns from subroutine', () => {
      const pcAddress = 0x0000;
      const code = [0x39];
      const stack = [0x00, 0x80];
      const stackAddress = 0x3ffd;
      const expectedAddress = 0x8000;
      loadMemory(pcAddress, code);
      loadMemory(stackAddress + 1, stack);
      subject.registers.get('PC').set(pcAddress);
      subject.registers.get('S').set(stackAddress);
      const cycles = 5;
      const cycleCount = runToNext(subject);
      expect(cycleCount).toBe(cycles);
      expect(subject.registers.get('PC').fetch()).toBe(expectedAddress);
      expect(subject.registers.get('S').fetch()).toBe(stackAddress + 2);
    });

    each(
        [
          [0x0000, 'A', [0x8b, 0x55], 0xaa, 0xff, 2],
          [0x0000, 'A', [0x8b, 0x56], 0xab, 0x01, 2],
          [0x0000, 'A', [0xbb, 0x00, 0x03, 0xaa], 0x55, 0xff, 5],
          [0x0000, 'B', [0xcb, 0x55], 0x23, 0x78, 2],
          [0x0000, 'B', [0xfb, 0x00, 0x03, 0x80], 0x08, 0x88, 5],
          [0x0000, 'D', [0xc3, 0xaa, 0xaa], 0x5500, 0xffaa, 4],
          [0x0000, 'D', [0xf3, 0x00, 0x03, 0x80, 0x08], 0x0880, 0x8888, 7],
        ],
    ).it('adds the referenced value to the object register', (
        pcAddress, register, code, initialValue, expectedValue, cycles,
    ) => {
      loadMemory(pcAddress, code);
      subject.registers.get('PC').set(pcAddress);
      subject.registers.get(register).set(initialValue);
      const cycleCount = runToNext(subject);
      expect(cycleCount).toBe(cycles);
      expect(subject.registers.get(register).fetch()).toBe(expectedValue);
    });

    each(
        [
          [0x0000, 'A', [0x9b, 0x02, 0x55], 0x00, 0xaa, 0xff, 4],
          [0x0000, 'B', [0xdb, 0x02, 0x55], 0x00, 0xaa, 0xff, 4],
          [0x0000, 'D', [0xd3, 0x02, 0x55, 0x55], 0x00, 0xaaaa, 0xffff, 6],
        ],
    ).it(
        'adds the referenced direct page value to the object register', (
            pcAddress, register, code, dpValue, initialValue, expectedValue,
            cycles,
        ) => {
          loadMemory(pcAddress, code);
          subject.registers.get('PC').set(pcAddress);
          subject.registers.get(register).set(initialValue);
          subject.registers.get('DP').set(dpValue);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get(register).fetch()).toBe(expectedValue);
        });

    each(
        [
          [0x0000, 'A', [0x89, 0x55], 0xaa, 0x00, true, 2],
          [0x0000, 'B', [0xc9, 0xaa], 0x01, 0xac, true, 2],
          [0x0000, 'A', [0x89, 0x55], 0xaa, 0xff, false, 2],
          [0x0000, 'A', [0xb9, 0x00, 0x03, 0x80], 0x88, 0x09, true, 5],
          [0x0000, 'B', [0xf9, 0x00, 0x03, 0x80], 0x88, 0x09, true, 5],
        ],
    ).it(
        'adds the referenced byte and carry with the object register', (
            pcAddress, register, code, initialValue, expectedValue, cf,
            cycles,
        ) => {
          loadMemory(pcAddress, code);
          subject.registers.get('PC').set(pcAddress);
          subject.registers.get(register).set(initialValue);
          subject.registers.get('CC').carry(cf);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get(register).fetch()).toBe(expectedValue);
        });

    each(
        [
          [0x0000, 'A', [0x99, 0x02, 0x55], 0x00, 0x01, 0x57, true, 4],
          [0x0000, 'B', [0xd9, 0x02, 0x56], 0x00, 0x01, 0x58, true, 4],
        ],
    ).it(
        'adds referenced direct page value with the object register and carry',
        (
            pcAddress, register, code, dpValue, initialValue,
            expectedValue, cf, cycles,
        ) => {
          loadMemory(pcAddress, code);
          subject.registers.get('PC').set(pcAddress);
          subject.registers.get(register).set(initialValue);
          subject.registers.get('DP').set(dpValue);
          subject.registers.get('CC').carry(cf);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get(register).fetch()).
              toBe(expectedValue);
        });

    each(
        [
          [0x0000, 'A', [0x80, 0x55], 0xff, 0xaa, 2],
          [0x0000, 'A', [0x80, 0x56], 0x01, 0xab, 2],
          [0x0000, 'A', [0xb0, 0x00, 0x03, 0xaa], 0xff, 0x55, 5],
          [0x0000, 'B', [0xc0, 0x55], 0x78, 0x23, 2],
          [0x0000, 'B', [0xf0, 0x00, 0x03, 0x80], 0x88, 0x08, 5],
        ],
    ).
        it('subtracts the referenced byte from the object register', (
            pcAddress, register, code, initialValue, expectedValue, cycles,
        ) => {
          loadMemory(pcAddress, code);
          subject.registers.get('PC').set(pcAddress);
          subject.registers.get(register).set(initialValue);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get(register).fetch()).toBe(expectedValue);
        });

    each(
        [
          [0x0000, 'D', [0x83, 0x55, 0x55], 0xffff, 0xaaaa, 4],
          [0x0000, 'D', [0x83, 0x56, 0x57], 0x0100, 0xaaa9, 4],
          [0x0000, 'D', [0xb3, 0x00, 0x03, 0x80, 0x08], 0x8888, 0x0880, 7],
        ],
    ).
        it('subtracts the immediate word from the object register', (
            pcAddress, register, code, initialValue, expectedValue, cycles,
        ) => {
          loadMemory(pcAddress, code);
          subject.registers.get('PC').set(pcAddress);
          subject.registers.get(register).set(initialValue);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get(register).fetch()).toBe(expectedValue);
        });

    each(
        [
          [0x0000, 'A', [0x90, 0x02, 0x55], 0x00, 0xff, 0xaa, 4],
          [0x0000, 'B', [0xd0, 0x02, 0xaa], 0x00, 0xff, 0x55, 4],
          [0x0000, 'D', [0x93, 0x02, 0x55, 0xaa], 0x00, 0xffff, 0xaa55, 6],
        ],
    ).it('subtracts referenced direct page value from the object register',
        (
            pcAddress, register, code, dpValue, initialValue,
            expectedValue, cycles,
        ) => {
          loadMemory(pcAddress, code);
          subject.registers.get('PC').set(pcAddress);
          subject.registers.get(register).set(initialValue);
          subject.registers.get('DP').set(dpValue);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get(register).fetch()).
              toBe(expectedValue);
        });

    each(
        [
          [0x0000, 'A', [0x82, 0x55], 0xff, 0xa9, true, 2],
          [0x0000, 'B', [0xc2, 0x56], 0x01, 0xaa, true, 2],
          [0x0000, 'A', [0x82, 0x55], 0xff, 0xaa, false, 2],
          [0x0000, 'A', [0xb2, 0x00, 0x03, 0x80], 0x88, 0x07, true, 5],
          [0x0000, 'B', [0xf2, 0x00, 0x03, 0x80], 0x88, 0x07, true, 5],
        ],
    ).it(
        'subtracts the referenced byte and carry from the object register', (
            pcAddress, register, code, initialValue, expectedValue, cf,
            cycles,
        ) => {
          loadMemory(pcAddress, code);
          subject.registers.get('PC').set(pcAddress);
          subject.registers.get(register).set(initialValue);
          subject.registers.get('CC').carry(cf);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get(register).fetch()).toBe(expectedValue);
        });

    each(
        [
          [0x0000, 'A', [0x92, 0x02, 0x55], 0x00, 0xff, 0xa9, true, 4],
          [0x0000, 'B', [0xd2, 0x02, 0x56], 0x00, 0x01, 0xaa, true, 4],
        ],
    ).it(
        'subtracts the referenced direct page value from the object register',
        (
            pcAddress, register, code, dpValue, initialValue,
            expectedValue, cf, cycles,
        ) => {
          loadMemory(pcAddress, code);
          subject.registers.get('PC').set(pcAddress);
          subject.registers.get(register).set(initialValue);
          subject.registers.get('DP').set(dpValue);
          subject.registers.get('CC').carry(cf);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get(register).fetch()).
              toBe(expectedValue);
        });

    each([
      [0x0000, [0x20, 0x10], 0x0012, 3], [0x0020, [0x20, 0xfe], 0x0020, 3],
    ]).it('BRA always branches by the given signed amount',
        (address, code, expected, cycles) => {
          loadMemory(address, code);
          subject.registers.get('PC').set(address);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get('PC').fetch()).toBe(expected);
        });

    each([
      [0x0000, [0x24, 0x10], 0x0012, false, 3],
      [0x0020, [0x24, 0xfe], 0x0022, true, 3],
    ]).it('BCC branches by the given signed amount if carry flag is clear',
        (address, code, expected, cf, cycles) => {
          loadMemory(address, code);
          subject.registers.get('PC').set(address);
          subject.registers.get('CC').carry(cf);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get('PC').fetch()).toBe(expected);
        });

    each([
      [0x0000, [0x25, 0x10], 0x0012, true, 3],
      [0x0020, [0x25, 0xfe], 0x0022, false, 3],
    ]).it('BCS branches by the given signed amount if carry flag is set',
        (address, code, expected, cf, cycles) => {
          loadMemory(address, code);
          subject.registers.get('PC').set(address);
          subject.registers.get('CC').carry(cf);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get('PC').fetch()).toBe(expected);
        });

    each([
      [0x0000, [0x27, 0x10], 0x0012, true, 3],
      [0x0020, [0x27, 0xfe], 0x0022, false, 3],
    ]).it('BEQ branches by the given signed amount if zero flag is set',
        (address, code, expected, zf, cycles) => {
          loadMemory(address, code);
          subject.registers.get('PC').set(address);
          subject.registers.get('CC').zero(zf);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get('PC').fetch()).toBe(expected);
        });

    each([
      [0x0000, [0x2c, 0x10], 0x0002, true, false, 3],
      [0x0020, [0x2c, 0xfe], 0x0022, false, true, 3],
      [0x0020, [0x2c, 0xfe], 0x0020, true, true, 3],
      [0x0000, [0x2c, 0x12], 0x0014, false, false, 3],
    ]).it(
        'BGE branches by given signed amount if negative eor overflow is false',
        (address, code, expected, nf, vf, cycles) => {
          loadMemory(address, code);
          subject.registers.get('PC').set(address);
          subject.registers.get('CC').negative(nf);
          subject.registers.get('CC').overflow(vf);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get('PC').fetch()).toBe(expected);
        });

    each([
      [0x0000, [0x2e, 0x10], 0x0012, true, false, false, 3],
      [0x0020, [0x2e, 0xfe], 0x0020, false, true, false, 3],
      [0x0020, [0x2e, 0xfe], 0x0022, false, true, true, 3],
    ]).it(
        'BGT branches by given signed amount if greater than',
        (address, code, expected, nf, vf, zf, cycles) => {
          loadMemory(address, code);
          subject.registers.get('PC').set(address);
          subject.registers.get('CC').negative(nf);
          subject.registers.get('CC').overflow(vf);
          subject.registers.get('CC').zero(zf);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get('PC').fetch()).toBe(expected);
        });

    each([
      [0x0000, [0x22, 0x10], 0x0012, false, false, 3],
      [0x0020, [0x22, 0xfe], 0x0022, true, false, 3],
      [0x0020, [0x22, 0xfe], 0x0022, false, true, 3],
    ]).it(
        'BHI branches by given signed amount if zero and carry are both false',
        (address, code, expected, cf, zf, cycles) => {
          loadMemory(address, code);
          subject.registers.get('PC').set(address);
          subject.registers.get('CC').carry(cf);
          subject.registers.get('CC').zero(zf);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get('PC').fetch()).toBe(expected);
        });

    each([
      [0x0000, [0x2f, 0x10], 0x0012, true, false, true, 3],
      [0x0020, [0x2f, 0xfe], 0x0020, false, true, true, 3],
      [0x0020, [0x2f, 0xfe], 0x0022, false, true, false, 3],
    ]).it(
        'BLE branches by given signed amount if less or equal',
        (address, code, expected, nf, vf, zf, cycles) => {
          loadMemory(address, code);
          subject.registers.get('PC').set(address);
          subject.registers.get('CC').negative(nf);
          subject.registers.get('CC').overflow(vf);
          subject.registers.get('CC').zero(zf);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get('PC').fetch()).toBe(expected);
        });

    each([
      [0x0000, [0x23, 0x10], 0x0012, false, true, 3],
      [0x0020, [0x23, 0xfe], 0x0020, true, false, 3],
      [0x0020, [0x23, 0xfe], 0x0022, false, false, 3],
      [0x0020, [0x23, 0xfe], 0x0020, true, true, 3],
    ]).it('BLS branches by the given signed amount if zero or carry are true',
        (address, code, expected, cf, zf, cycles) => {
          loadMemory(address, code);
          subject.registers.get('PC').set(address);
          subject.registers.get('CC').carry(cf);
          subject.registers.get('CC').zero(zf);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get('PC').fetch()).toBe(expected);
        });

    each([
      [0x0000, [0x2d, 0x10], 0x0012, true, false, 3],
      [0x0020, [0x2d, 0xfe], 0x0020, false, true, 3],
      [0x0020, [0x2d, 0xfe], 0x0022, true, true, 3],
      [0x0000, [0x2d, 0x12], 0x0002, false, false, 3],
    ]).it(
        'BLT branches by given signed amount if negative eor overflow is true',
        (address, code, expected, nf, vf, cycles) => {
          loadMemory(address, code);
          subject.registers.get('PC').set(address);
          subject.registers.get('CC').negative(nf);
          subject.registers.get('CC').overflow(vf);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get('PC').fetch()).toBe(expected);
        });

    each([
      [0x0000, [0x2b, 0x10], 0x0012, true, 3],
      [0x0020, [0x2b, 0xfe], 0x0022, false, 3],
    ]).it(
        'BMI branches by the given signed amount if negative is true',
        (address, code, expected, nf, cycles) => {
          loadMemory(address, code);
          subject.registers.get('PC').set(address);
          subject.registers.get('CC').negative(nf);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get('PC').fetch()).toBe(expected);
        });

    each([
      [0x0000, [0x26, 0x10], 0x0012, false, 3],
      [0x0020, [0x26, 0xfe], 0x0022, true, 3],
    ]).it(
        'BNE branches by the given signed amount if zero is false',
        (address, code, expected, zf, cycles) => {
          loadMemory(address, code);
          subject.registers.get('PC').set(address);
          subject.registers.get('CC').zero(zf);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get('PC').fetch()).toBe(expected);
        });

    each([
      [0x0000, [0x2a, 0x10], 0x0012, false, 3],
      [0x0020, [0x2a, 0xfe], 0x0022, true, 3],
    ]).it(
        'BPL branches by the given signed amount if negative is false',
        (address, code, expected, nf, cycles) => {
          loadMemory(address, code);
          subject.registers.get('PC').set(address);
          subject.registers.get('CC').negative(nf);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get('PC').fetch()).toBe(expected);
        });

    each([
      [0x0000, [0x28, 0x10], 0x0012, false, 3],
      [0x0020, [0x28, 0xfe], 0x0022, true, 3],
    ]).it(
        'BVC branches by the given signed amount if overflow is false',
        (address, code, expected, vf, cycles) => {
          loadMemory(address, code);
          subject.registers.get('PC').set(address);
          subject.registers.get('CC').overflow(vf);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get('PC').fetch()).toBe(expected);
        });

    each([
      [0x0000, [0x29, 0x10], 0x0012, true, 3],
      [0x0020, [0x29, 0xfe], 0x0022, false, 3],
    ]).it(
        'BVS branches by the given signed amount if overflow is false',
        (address, code, expected, vf, cycles) => {
          loadMemory(address, code);
          subject.registers.get('PC').set(address);
          subject.registers.get('CC').overflow(vf);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get('PC').fetch()).toBe(expected);
        });

    each([
      [0x0000, [0x21, 0x10], 0x0002, 3],
    ]).it(
        'BRN never branches by the given signed amount',
        (address, code, expected, cycles) => {
          loadMemory(address, code);
          subject.registers.get('PC').set(address);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get('PC').fetch()).toBe(expected);
        });

    each([
      [0x0000, [0x8D, 0x7f], 0x4000, 0x0081, 7],
    ]).it(
        'BSR Always branches by the given signed amount AND pushes pc to stack',
        (address, code, stack, expected, cycles) => {
          loadMemory(address, code);
          subject.registers.get('PC').set(address);
          subject.registers.get('S').set(stack);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get('PC').fetch()).toBe(expected);
          expect(subject.registers.get('S').fetch()).toBe(stack - 2);
        });

    each([
      [0x0000, [0x16, 0x10, 0x00], 0x1003, 5],
      [0x0200, [0x16, 0xfe, 0xff], 0x0102, 5],
    ]).it('LBRA always branches by the given signed amount',
        (address, code, expected, cycles) => {
          loadMemory(address, code);
          subject.registers.get('PC').set(address);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get('PC').fetch()).toBe(expected);
        });

    each([
      [0x0000, [0x10, 0x21, 0x10, 0x00], 0x0004, 5],
      [0x0200, [0x10, 0x21, 0xfe, 0xff], 0x0204, 5],
    ]).it('LBRN always branches by the given signed amount',
        (address, code, expected, cycles) => {
          loadMemory(address, code);
          subject.registers.get('PC').set(address);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get('PC').fetch()).toBe(expected);
        });

    each([
      [0x0000, [0x10, 0x24, 0x00, 0x10], 0x0014, false, 6],
      [0x0020, [0x10, 0x24, 0xff, 0xfd], 0x0024, true, 5],
    ]).it(
        'LBCC branches by given signed word if carry clear',
        (address, code, expected, cf, cycles) => {
          loadMemory(address, code);
          subject.registers.get('PC').set(address);
          subject.registers.get('CC').carry(cf);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get('PC').fetch()).toBe(expected);
        });

    each([
      [0x0000, [0x10, 0x25, 0x00, 0x10], 0x0014, true, 6],
      [0x0020, [0x10, 0x25, 0xff, 0xfd], 0x0024, false, 5],
    ]).it(
        'LBCS branches by given signed word if carry set and uses extra cycle',
        (address, code, expected, cf, cycles) => {
          loadMemory(address, code);
          subject.registers.get('PC').set(address);
          subject.registers.get('CC').carry(cf);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get('PC').fetch()).toBe(expected);
        });

    each([
      [0x0000, [0x10, 0x27, 0x00, 0x10], 0x0014, true, 6],
      [0x0020, [0x10, 0x27, 0xff, 0xfe], 0x0024, false, 5],
      [0x0020, [0x10, 0x27, 0xff, 0xfc], 0x0020, true, 6],
    ]).it('LBEQ branches by given signed word if zero set and uses extra cycle',
        (address, code, expected, zf, cycles) => {
          loadMemory(address, code);
          subject.registers.get('PC').set(address);
          subject.registers.get('CC').zero(zf);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get('PC').fetch()).toBe(expected);
        });

    each([
      [0x0000, [0x10, 0x2c, 0x00, 0x12], 0x0004, true, false, 5],
      [0x0020, [0x10, 0x2c, 0xff, 0xfc], 0x0024, false, true, 5],
      [0x0020, [0x10, 0x2c, 0xff, 0xfc], 0x0020, true, true, 6],
      [0x0000, [0x10, 0x2c, 0x00, 0x10], 0x0014, false, false, 6],
    ]).it(
        'LBGE branches by given signed word if greater or equal',
        (address, code, expected, nf, vf, cycles) => {
          loadMemory(address, code);
          subject.registers.get('PC').set(address);
          subject.registers.get('CC').negative(nf);
          subject.registers.get('CC').overflow(vf);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get('PC').fetch()).toBe(expected);
        });

    each([
      [0x0000, [0x10, 0x2e, 0x00, 0x10], 0x0014, true, false, false, 6],
      [0x0020, [0x10, 0x2e, 0xff, 0xfc], 0x0020, false, true, false, 6],
      [0x0020, [0x10, 0x2e, 0xff, 0xfe], 0x0024, false, true, true, 5],
    ]).it(
        'LBGT branches by given signed word if greater than',
        (address, code, expected, nf, vf, zf, cycles) => {
          loadMemory(address, code);
          subject.registers.get('PC').set(address);
          subject.registers.get('CC').negative(nf);
          subject.registers.get('CC').overflow(vf);
          subject.registers.get('CC').zero(zf);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get('PC').fetch()).toBe(expected);
        });

    each([
      [0x0000, [0x10, 0x22, 0x00, 0x10], 0x0014, false, false, 6],
      [0x0020, [0x10, 0x22, 0xff, 0xfe], 0x0024, true, false, 5],
      [0x0020, [0x10, 0x22, 0xff, 0xfe], 0x0024, false, true, 5],
    ]).it(
        'LBHI branches by given signed amount if zero and carry are both false',
        (address, code, expected, cf, zf, cycles) => {
          loadMemory(address, code);
          subject.registers.get('PC').set(address);
          subject.registers.get('CC').carry(cf);
          subject.registers.get('CC').zero(zf);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get('PC').fetch()).toBe(expected);
        });

    each([
      [0x0000, [0x10, 0x2f, 0x00, 0x10], 0x0014, true, false, true, 6],
      [0x0020, [0x10, 0x2f, 0xff, 0xfc], 0x0020, false, true, true, 6],
      [0x0020, [0x10, 0x2f, 0xff, 0xfe], 0x0024, false, true, false, 5],
    ]).it(
        'LBLE branches by given signed amount if less or equal',
        (address, code, expected, nf, vf, zf, cycles) => {
          loadMemory(address, code);
          subject.registers.get('PC').set(address);
          subject.registers.get('CC').negative(nf);
          subject.registers.get('CC').overflow(vf);
          subject.registers.get('CC').zero(zf);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get('PC').fetch()).toBe(expected);
        });

    each([
      [0x0000, [0x10, 0x23, 0x00, 0x10], 0x0014, false, true, 6],
      [0x0020, [0x10, 0x23, 0xff, 0xfc], 0x0020, true, false, 6],
      [0x0020, [0x10, 0x23, 0xff, 0xfc], 0x0024, false, false, 5],
      [0x0020, [0x10, 0x23, 0xff, 0xfc], 0x0020, true, true, 6],
    ]).it(
        'LBLS branches by the given signed amount if zero or carry are true',
        (address, code, expected, cf, zf, cycles) => {
          loadMemory(address, code);
          subject.registers.get('PC').set(address);
          subject.registers.get('CC').carry(cf);
          subject.registers.get('CC').zero(zf);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get('PC').fetch()).toBe(expected);
        });

    each([
      [0x0000, [0x10, 0x2d, 0x00, 0x10], 0x0014, true, false, 6],
      [0x0020, [0x10, 0x2d, 0xff, 0xfc], 0x0020, false, true, 6],
      [0x0020, [0x10, 0x2d, 0xff, 0xfc], 0x0024, true, true, 5],
      [0x0000, [0x10, 0x2d, 0x00, 0x10], 0x0004, false, false, 5],
    ]).it(
        'LBLT branches by given signed word if negative eor overflow is true',
        (address, code, expected, nf, vf, cycles) => {
          loadMemory(address, code);
          subject.registers.get('PC').set(address);
          subject.registers.get('CC').negative(nf);
          subject.registers.get('CC').overflow(vf);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get('PC').fetch()).toBe(expected);
        });

    each([
      [0x0000, [0x10, 0x2b, 0x00, 0x10], 0x0014, true, 6],
      [0x0020, [0x10, 0x2b, 0xff, 0xfe], 0x0024, false, 5],
    ]).it(
        'LBMI branches by the given signed amount if negative is true',
        (address, code, expected, nf, cycles) => {
          loadMemory(address, code);
          subject.registers.get('PC').set(address);
          subject.registers.get('CC').negative(nf);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get('PC').fetch()).toBe(expected);
        });

    each([
      [0x0000, [0x10, 0x26, 0x01, 0x10], 0x0114, false, 6],
      [0x0020, [0x10, 0x26, 0xff, 0xfe], 0x0024, true, 5],
    ]).it(
        'LBNE branches by the given signed amount if zero is false',
        (address, code, expected, zf, cycles) => {
          loadMemory(address, code);
          subject.registers.get('PC').set(address);
          subject.registers.get('CC').zero(zf);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get('PC').fetch()).toBe(expected);
        });

    each([
      [0x0000, [0x10, 0x2a, 0x01, 0x10], 0x0114, false, 6],
      [0x0020, [0x10, 0x2a, 0xff, 0xfe], 0x0024, true, 5],
    ]).it(
        'LBPL branches by the given signed amount if negative is false',
        (address, code, expected, nf, cycles) => {
          loadMemory(address, code);
          subject.registers.get('PC').set(address);
          subject.registers.get('CC').negative(nf);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get('PC').fetch()).toBe(expected);
        });

    each([
      [0x0000, [0x10, 0x28, 0x01, 0x10], 0x0114, false, 6],
      [0x0020, [0x10, 0x28, 0xff, 0xfe], 0x0024, true, 5],
    ]).it(
        'LBVC branches by the given signed word if overflow is false',
        (address, code, expected, vf, cycles) => {
          loadMemory(address, code);
          subject.registers.get('PC').set(address);
          subject.registers.get('CC').overflow(vf);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get('PC').fetch()).toBe(expected);
        });

    each([
      [0x0000, [0x10, 0x29, 0x01, 0x10], 0x0114, true, 6],
      [0x0020, [0x10, 0x29, 0xff, 0xfe], 0x0024, false, 5],
    ]).it(
        'LBVS branches by the given signed word if overflow is false',
        (address, code, expected, vf, cycles) => {
          loadMemory(address, code);
          subject.registers.get('PC').set(address);
          subject.registers.get('CC').overflow(vf);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get('PC').fetch()).toBe(expected);
        });

    each([
      [0x0000, [0x17, 0x01, 0x7f], 0x4000, 0x0182, 9],
    ]).it(
        'LBSR Always branches by the given signed word AND pushes pc to stack',
        (address, code, stack, expected, cycles) => {
          loadMemory(address, code);
          subject.registers.get('PC').set(address);
          subject.registers.get('S').set(stack);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get('PC').fetch()).toBe(expected);
          expect(subject.registers.get('S').fetch()).toBe(stack - 2);
        });

    each([
      [0x0000, [0x84, 0xaa], 'A', 0xff, 0xaa, 2],
      [0x0000, [0xb4, 0x00, 0x03, 0x55], 'A', 0xaa, 0x00, 5],
      [0x0000, [0xc4, 0x55], 'B', 0xaa, 0x00, 2],
      [0x0000, [0xf4, 0x00, 0x03, 0x55], 'B', 0xff, 0x55, 5],
    ]).it(
        'ANDs a register and a value bitwise',
        (address, code, register, initial, expected, cycles) => {
          loadMemory(address, code);
          subject.registers.get(register).set(initial);
          subject.registers.get('PC').set(address);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get(register).fetch()).toBe(expected);
        });

    each([
      [0x0000, [0x1c, 0x55], 0xaa, 0x00, 3],
    ]).it(
        'ANDs the CC register and a value bitwise',
        (address, code, initial, expected, cycles) => {
          loadMemory(address, code);
          subject.CC.value = initial;
          subject.registers.get('PC').set(address);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.CC.value).toBe(expected);
        });

    each([
      [0x0000, [0x94, 0x02, 0xaa], 'A', 0x00, 0xff, 0xaa, 4],
      [0x0000, [0xd4, 0x02, 0x55], 'B', 0x00, 0xaa, 0x00, 4],
    ]).it(
        'ANDs a register and a direct page referenced value bitwise',
        (address, code, register, dp, initial, expected, cycles) => {
          loadMemory(address, code);
          subject.registers.get(register).set(initial);
          subject.registers.get('PC').set(address);
          subject.registers.get('DP').set(dp);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get(register).fetch()).toBe(expected);
        });

    each([
      [0x0000, [0x8a, 0xaa], 'A', 0x00, 0xaa, 2],
      [0x0000, [0xba, 0x00, 0x03, 0x55], 'A', 0xaa, 0xff, 5],
      [0x0000, [0xca, 0x55], 'B', 0xaa, 0xff, 2],
      [0x0000, [0xfa, 0x00, 0x03, 0x05], 'B', 0xa0, 0xa5, 5],
    ]).it(
        'ORs a register and a value bitwise',
        (address, code, register, initial, expected, cycles) => {
          loadMemory(address, code);
          subject.registers.get(register).set(initial);
          subject.registers.get('PC').set(address);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get(register).fetch()).toBe(expected);
        });

    each([
      [0x0000, [0x1a, 0x55], 0xaa, 0xff, 3],
    ]).it(
        'ORs the CC register and a value bitwise',
        (address, code, initial, expected, cycles) => {
          loadMemory(address, code);
          subject.CC.value = initial;
          subject.registers.get('PC').set(address);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.CC.value).toBe(expected);
        });

    each([
      [0x0000, [0x9a, 0x02, 0xaa], 'A', 0x00, 0xa5, 0xaf, 4],
      [0x0000, [0xda, 0x02, 0x55], 'B', 0x00, 0xaa, 0xff, 4],
    ]).it(
        'ORs a register and a direct page referenced value bitwise',
        (address, code, register, dp, initial, expected, cycles) => {
          loadMemory(address, code);
          subject.registers.get(register).set(initial);
          subject.registers.get('PC').set(address);
          subject.registers.get('DP').set(dp);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get(register).fetch()).toBe(expected);
        });

    each([
      [0x0000, [0x88, 0xaa], 'A', 0x0a, 0xa0, 2],
      [0x0000, [0xb8, 0x00, 0x03, 0x55], 'A', 0xaa, 0xff, 5],
      [0x0000, [0xc8, 0x55], 'B', 0xaa, 0xff, 2],
      [0x0000, [0xf8, 0x00, 0x03, 0xaa], 'B', 0xa5, 0x0f, 5],
    ]).it(
        'EORs a register and a value bitwise',
        (address, code, register, initial, expected, cycles) => {
          loadMemory(address, code);
          subject.registers.get(register).set(initial);
          subject.registers.get('PC').set(address);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get(register).fetch()).toBe(expected);
        });

    each([
      [0x0000, [0x98, 0x02, 0xaa], 'A', 0x00, 0xa5, 0x0f, 4],
      [0x0000, [0xd8, 0x02, 0x55], 'B', 0x00, 0xa5, 0xf0, 4],
    ]).it(
        'EORs a register and a direct page referenced value bitwise',
        (address, code, register, dp, initial, expected, cycles) => {
          loadMemory(address, code);
          subject.registers.get(register).set(initial);
          subject.registers.get('PC').set(address);
          subject.registers.get('DP').set(dp);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get(register).fetch()).toBe(expected);
        });

    it('shifts a direct memory address left 1 bit', () => {
      const address = 0x0000;
      const code = [0x08, 0x02, 0x55];
      const atAddress = 0x0002;
      const dp = 0;
      const expected = 0xaa;
      const cycles = 6;
      loadMemory(address, code);
      subject.registers.get('PC').set(address);
      subject.registers.get('DP').set(dp);
      const cycleCount = runToNext(subject);
      expect(cycleCount).toBe(cycles);
      expect(subject.memory.read(atAddress)).toBe(expected);
    });

    it('shifts an extended memory address left 1 bit', () => {
      const address = 0x0000;
      const code = [0x78, 0x00, 0x03, 0x55];
      const atAddress = 0x0003;
      const expected = 0xaa;
      const cycles = 7;
      loadMemory(address, code);
      subject.registers.get('PC').set(address);
      const cycleCount = runToNext(subject);
      expect(cycleCount).toBe(cycles);
      expect(subject.memory.read(atAddress)).toBe(expected);
    });

    each(
        [
          [0x0000, [0x48], 'A', 0x55, 0xaa, 2],
          [0x0000, [0x58], 'B', 0x55, 0xaa, 2],
        ],
    ).it('shifts a register left 1 bit',
        (address, code, register, initialValue, expectedValue, cycles) => {
          loadMemory(address, code);
          subject.registers.get('PC').set(address);
          subject.registers.get(register).set(initialValue);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get(register).fetch()).toBe(expectedValue);
        });

    it('shifts a direct memory address right 1 bit', () => {
      const address = 0x0000;
      const code = [0x07, 0x02, 0xaa];
      const atAddress = 0x0002;
      const dp = 0;
      const expected = 0xd5;
      const cycles = 6;
      loadMemory(address, code);
      subject.registers.get('PC').set(address);
      subject.registers.get('DP').set(dp);
      const cycleCount = runToNext(subject);
      expect(cycleCount).toBe(cycles);
      expect(subject.memory.read(atAddress)).toBe(expected);
    });

    it('shifts an extended memory address right 1 bit', () => {
      const address = 0x0000;
      const code = [0x77, 0x00, 0x03, 0xaa];
      const atAddress = 0x0003;
      const expected = 0xd5;
      const cycles = 7;
      loadMemory(address, code);
      subject.registers.get('PC').set(address);
      const cycleCount = runToNext(subject);
      expect(cycleCount).toBe(cycles);
      expect(subject.memory.read(atAddress)).toBe(expected);
    });

    each(
        [
          [0x0000, [0x47], 'A', 0xaa, 0xd5, 2],
          [0x0000, [0x57], 'B', 0xaa, 0xd5, 2],
        ],
    ).it('shifts a register right 1 bit',
        (address, code, register, initialValue, expectedValue, cycles) => {
          loadMemory(address, code);
          subject.registers.get('PC').set(address);
          subject.registers.get(register).set(initialValue);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get(register).fetch()).toBe(expectedValue);
        });

    it('rotates a direct memory address left 1 bit', () => {
      const address = 0x0000;
      const code = [0x09, 0x02, 0x55];
      const atAddress = 0x0002;
      const dp = 0;
      const expected = 0xaa;
      const cycles = 6;
      loadMemory(address, code);
      subject.registers.get('PC').set(address);
      subject.registers.get('DP').set(dp);
      const cycleCount = runToNext(subject);
      expect(cycleCount).toBe(cycles);
      expect(subject.memory.read(atAddress)).toBe(expected);
    });

    it('rotates an extended memory address left 1 bit', () => {
      const address = 0x0000;
      const code = [0x79, 0x00, 0x03, 0x55];
      const atAddress = 0x0003;
      const expected = 0xaa;
      const cycles = 7;
      loadMemory(address, code);
      subject.registers.get('PC').set(address);
      const cycleCount = runToNext(subject);
      expect(cycleCount).toBe(cycles);
      expect(subject.memory.read(atAddress)).toBe(expected);
    });

    each(
        [
          [0x0000, [0x49], 'A', 0x55, 0xaa, 2],
          [0x0000, [0x59], 'B', 0x55, 0xaa, 2],
        ],
    ).it('rotates a register left 1 bit',
        (address, code, register, initialValue, expectedValue, cycles) => {
          loadMemory(address, code);
          subject.registers.get('PC').set(address);
          subject.registers.get(register).set(initialValue);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get(register).fetch()).toBe(expectedValue);
        });

    it('rotates a direct memory address right 1 bit', () => {
      const address = 0x0000;
      const code = [0x06, 0x02, 0xaa];
      const atAddress = 0x0002;
      const dp = 0;
      const expected = 0x55;
      const cycles = 6;
      loadMemory(address, code);
      subject.registers.get('PC').set(address);
      subject.registers.get('DP').set(dp);
      const cycleCount = runToNext(subject);
      expect(cycleCount).toBe(cycles);
      expect(subject.memory.read(atAddress)).toBe(expected);
    });

    it('rotates an extended memory address right 1 bit', () => {
      const address = 0x0000;
      const code = [0x76, 0x00, 0x03, 0xaa];
      const atAddress = 0x0003;
      const expected = 0x55;
      const cycles = 7;
      loadMemory(address, code);
      subject.registers.get('PC').set(address);
      const cycleCount = runToNext(subject);
      expect(cycleCount).toBe(cycles);
      expect(subject.memory.read(atAddress)).toBe(expected);
    });

    each(
        [
          [0x0000, [0x46], 'A', 0xaa, 0x55, 2],
          [0x0000, [0x56], 'B', 0xaa, 0x55, 2],
        ],
    ).it('rotates a register right 1 bit',
        (address, code, register, initialValue, expectedValue, cycles) => {
          loadMemory(address, code);
          subject.registers.get('PC').set(address);
          subject.registers.get(register).set(initialValue);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get(register).fetch()).toBe(expectedValue);
        });

    each(
        [
          [0x0000, [0x85, 0x55], 'A', 0xaa, cpus.ZERO, 2],
          [0x0000, [0x85, 0x80], 'A', 0xf0, cpus.NEGATIVE, 2],
          [0x0000, [0xc5, 0x4e], 'B', 0xaa, 0x00, 2],
          [0x0000, [0xb5, 0x00, 0x03, 0x55], 'A', 0xaa, cpus.ZERO, 5],
          [0x0000, [0xf5, 0x00, 0x03, 0x80], 'B', 0xf0, cpus.NEGATIVE, 5],
        ],
    ).it('masks a register against a value',
        (address, code, register, initialValue, expectedFlags, cycles) => {
          loadMemory(address, code);
          subject.registers.get('PC').set(address);
          subject.registers.get(register).set(initialValue);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get('CC').value).toBe(expectedFlags);
        });

    each(
        [
          [0x0000, [0x95, 0x02, 0x80], 'A', 0xf0, 0x00, cpus.NEGATIVE, 4],
          [0x0000, [0xd5, 0x02, 0x80], 'B', 0xf0, 0x00, cpus.NEGATIVE, 4],
        ],
    ).it('masks a register against a direct page value',
        (address, code, register, initialValue, dp, expectedFlags, cycles) => {
          loadMemory(address, code);
          subject.registers.get('PC').set(address);
          subject.registers.get('DP').set(dp);
          subject.registers.get(register).set(initialValue);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get('CC').value).toBe(expectedFlags);
        });

    each(
        [
          [0x0000, [0x43], 'A', 0xaa, 0x55, 2],
          [0x0000, [0x53], 'B', 0xff, 0x00, 2],
        ],
    ).it('performs ones complement on a given register',
        (address, code, register, initialValue, expectedValue, cycles) => {
          loadMemory(address, code);
          subject.registers.get('PC').set(address);
          subject.registers.get(register).set(initialValue);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get(register).fetch()).toBe(expectedValue);
        });

    each(
        [
          [0x0000, [0x03, 0x02, 0xaa], 0x0002, 0, 0x55, 6],
          [0x0000, [0x73, 0x00, 0x03, 0xaa], 0x0003, 0, 0x55, 7],
        ],
    ).it('performs ones complement on a given memory address',
        (address, code, atAddress, dp, expectedValue, cycles) => {
          loadMemory(address, code);
          subject.registers.get('PC').set(address);
          subject.registers.get('DP').set(dp);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.memory.read(atAddress)).toBe(expectedValue);
        });

    each(
        [
          [0x0000, [0x40], 'A', 0xaa, 0x56, 2],
          [0x0000, [0x50], 'B', 0xff, 0x01, 2],
        ],
    ).it('performs twos complement on a register',
        (address, code, register, initialValue, expectedValue, cycles) => {
          loadMemory(address, code);
          subject.registers.get('PC').set(address);
          subject.registers.get(register).set(initialValue);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get(register).fetch()).toBe(expectedValue);
        });

    each(
        [
          [0x0000, [0x00, 0x02, 0xaa], 0x0002, 0, 0x56, 6],
          [0x0000, [0x70, 0x00, 0x03, 0xaa], 0x0003, 0, 0x56, 7],
        ],
    ).it('performs twos complement on a given memory address',
        (address, code, atAddress, dp, expectedValue, cycles) => {
          loadMemory(address, code);
          subject.registers.get('PC').set(address);
          subject.registers.get('DP').set(dp);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.memory.read(atAddress)).toBe(expectedValue);
        });

    each(
        [
          [0x0000, [0x1e, 0x12], 'X', 'Y', 0x8000, 0x0001, 8],
          [0x0000, [0x1e, 0x8b], 'A', 'DP', 0x55, 0xaa, 8],
        ],
    ).it('exchanges the value of one register with another',
        (
            address, code, register1, register2,
            initialValue1, initialValue2, cycles,
        ) => {
          loadMemory(address, code);
          subject.registers.get('PC').set(address);
          subject.registers.get(register1).set(initialValue1);
          subject.registers.get(register2).set(initialValue2);
          const cycleCount = runToNext(subject);
          expect(cycleCount).toBe(cycles);
          expect(subject.registers.get(register1).fetch()).toBe(initialValue2);
          expect(subject.registers.get(register2).fetch()).toBe(initialValue1);
        });

    it('cannot exchange an 8 bit and 16 bit register pair', () => {
      const address = 0x0000;
      const code = [0x1e, 0x18];
      const register1 = 'X';
      const register2 = 'A';
      const initialValue1 = 0x5555;
      const initialValue2 = 0xaa;
      const cycles = 8;
      loadMemory(address, code);
      subject.registers.get('PC').set(address);
      subject.registers.get(register1).set(initialValue1);
      subject.registers.get(register2).set(initialValue2);
      const cycleCount = runToNext(subject);
      expect(cycleCount).toBe(cycles);
      expect(subject.registers.get(register1).fetch()).toBe(initialValue1);
      expect(subject.registers.get(register2).fetch()).toBe(initialValue2);
    });
  });
});
