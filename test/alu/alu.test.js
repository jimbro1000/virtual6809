const {Alu} = require('../../src/alu/alu.js');
const {ControlRegister} = require('../../src/cpu/control_register');
const each = require('jest-each').default;
const cpus = require('../../src/cpu/cpu_constants');

describe('Arithmetic Logic Unit', () => {
  let subject;
  let cc;
  beforeEach(() => {
    cc = new ControlRegister();
    subject = new Alu(cc);
  });
  describe('Adds two registers, ', () => {
    each(
        [[0x01, 0x02, 0x03], [0xff, 0x01, 0x00]],
    ).it('adds two 8 bit registers for an 8 bit result',
        (s1, s2, expected) => {
          const result = subject.add8(s1, s2);
          expect(result).toBe(expected);
        });
    each(
        [[0x7f, 0x02, cpus.NEGATIVE], [0xff, 0x01, 0]],
    ).it('sets negative flag if the resulting 8 bit msb is set',
        (s1, s2, negative) => {
          subject.add8(s1, s2);
          expect(cc.save() & cpus.NEGATIVE).toBe(negative);
        });
    each(
        [[0xff, 0x01, cpus.CARRY], [0x7f, 0x01, 0]],
    ).it('sets carry flag if the result of the 8 bit sum exceeds 8 bits',
        (s1, s2, carry) => {
          subject.add8(s1, s2);
          expect(cc.save() & cpus.CARRY).toBe(carry);
        });
    each(
        [[0xff, 0x01, cpus.ZERO], [0x01, 0x00, 0]],
    ).it('sets zero flag if the result of the 8 bit sum is zero',
        (s1, s2, zero) => {
          subject.add8(s1, s2);
          expect(cc.save() & cpus.ZERO).toBe(zero);
        });
    each(
        [[0xf8, 0x08, cpus.HALFCARRY], [0x04, 0x03, 0]],
    ).it('sets half-carry if the result of the 4 bit sum exceeds 4 bits',
        (s1, s2, half) => {
          subject.add8(s1, s2);
          expect(cc.save() & cpus.HALFCARRY).toBe(half);
        });
    each(
        [
          [0x80, 0x80, cpus.OVERFLOW],
          [0x40, 0x40, cpus.OVERFLOW], [0xff, 0xfe, 0]],
    ).it('sets overflow if the sign of the result is not as expected',
        (s1, s2, overflow) => {
          subject.add8(s1, s2);
          expect(cc.save() & cpus.OVERFLOW).toBe(overflow);
        });
    each(
        [[0x00, 0x00, 1, 0x01]],
    ).it('includes the value of the carry flag (as 1) if set',
        (s1, s2, c, expected) => {
          result = subject.add8(s1, s2, c);
          expect(result).toBe(expected);
        });

    each(
        [
          [0x0001, 0x0002, 0x0003],
          [0x00ff, 0x0001, 0x0100], [0xffff, 0x0001, 0x0000]],
    ).it('adds two 16 bit registers for an 16 bit result',
        (s1, s2, expected) => {
          const result = subject.add16(s1, s2);
          expect(result).toBe(expected);
        });
    each(
        [[0x7fff, 0x0002, cpus.NEGATIVE], [0xffff, 0x0001, 0]],
    ).it('sets negative flag if the resulting 16 bit msb is set',
        (s1, s2, negative) => {
          subject.add16(s1, s2);
          expect(cc.save() & cpus.NEGATIVE).toBe(negative);
        });
    each(
        [[0xffff, 0x01, cpus.CARRY], [0x7fff, 0x01, 0]],
    ).it('sets carry flag if the result of the 8 bit sum exceeds 8 bits',
        (s1, s2, carry) => {
          subject.add16(s1, s2);
          expect(cc.save() & cpus.CARRY).toBe(carry);
        });
    each(
        [[0xffff, 0x0001, cpus.ZERO], [0x0001, 0x0000, 0]],
    ).it('sets zero flag if the result of the 16 bit sum is zero',
        (s1, s2, zero) => {
          subject.add16(s1, s2);
          expect(cc.save() & cpus.ZERO).toBe(zero);
        });
    each(
        [
          [0x00f8, 0x0008, 0, 0],
          [0x00f8, 0x0008, cpus.HALFCARRY, cpus.HALFCARRY]],
    ).it('does not modify the half carry flag on a 16 bit sum',
        (s1, s2, state, half) => {
          cc.load(state);
          subject.add16(s1, s2);
          expect(cc.save() & cpus.HALFCARRY).toBe(half);
        });
    each(
        [
          [0x8000, 0x8000, cpus.OVERFLOW],
          [0x4000, 0x4000, cpus.OVERFLOW], [0xffff, 0xfffe, 0]],
    ).it('sets overflow if the sign of the result is not as expected',
        (s1, s2, overflow) => {
          subject.add16(s1, s2);
          expect(cc.save() & cpus.OVERFLOW).toBe(overflow);
        });

    each(
        [
          [0x01, 0x02, 0xff],
          [0xff, 0x01, 0xfe], [0x02, 0x01, 0x01]],
    ).it('subtracts two 8 bit registers for an 8 bit result',
        (s1, s2, expected) => {
          const result = subject.sub8(s1, s2);
          expect(result).toBe(expected);
        });
  });

  describe('subtracts from two register', () => {
    each(
        [
          [0x01, 0x02, 0xff],
          [0xff, 0x01, 0xfe], [0x02, 0x01, 0x01]],
    ).it('subtracts two 8 bit registers for an 8 bit result',
        (s1, s2, expected) => {
          const result = subject.sub8(s1, s2);
          expect(result).toBe(expected);
        });
    each(
        [
          [0x02, 0x7f, cpus.NEGATIVE],
          [0x01, 0xff, 0]],
    ).it('sets negative flag if the resulting 8 bit msb is set',
        (s1, s2, negative) => {
          subject.sub8(s1, s2);
          expect(cc.save() & cpus.NEGATIVE).toBe(negative);
        });
    each(
        [
          [0x01, 0xff, cpus.CARRY],
          [0x7f, 0x01, 0]],
    ).it('sets carry flag if the result if a bit has to be borrowed',
        (s1, s2, carry) => {
          subject.sub8(s1, s2);
          expect(cc.save() & cpus.CARRY).toBe(carry);
        });
    each(
        [
          [0x01, 0x01, cpus.ZERO],
          [0x01, 0x00, 0]],
    ).it('sets zero flag if the result of the 8 bit subtraction is zero',
        (s1, s2, zero) => {
          subject.sub8(s1, s2);
          expect(cc.save() & cpus.ZERO).toBe(zero);
        });
    each(
        [
          [0x80, 0x01, cpus.OVERFLOW],
          [0x00, 0x80, cpus.OVERFLOW], [0xfe, 0xff, 0]],
    ).it('sets overflow if the sign of the result is not as expected',
        (s1, s2, overflow) => {
          subject.sub8(s1, s2);
          expect(cc.save() & cpus.OVERFLOW).toBe(overflow);
        });
    each(
        [[0x00, 0x00, 1, 0x01]],
    ).it('includes the value of the carry flag (as 1) if set',
        (s1, s2, c, expected) => {
          const result = subject.add8(s1, s2, c);
          expect(result).toBe(expected);
        });
  });

  describe('Bitwise AND', () => {
    each(
        [
          [0x55, 0xaa, 0x00, cpus.ZERO],
          [0xff, 0x55, 0x55, 0x00],
        ],
    ).it('ANDs two values and sets NZV', (s1, s2, expected, flags) => {
      const result = subject.and(s1, s2);
      expect(result).toBe(expected);
      expect(cc.value).toBe(flags);
    });

    each(
        [
          [0x55, 0xaa, 0x00],
          [0xff, 0xaa, 0xaa],
        ],
    ).it(
        'does not modify cc if condition parameter is false',
        (s1, s2, expected) => {
          const result = subject.and(s1, s2, false);
          expect(result).toBe(expected);
          expect(cc.value).toBe(0);
        });
  });

  describe('Bitwise OR', () => {
    each(
        [
          [0x55, 0xaa, 0xff, cpus.NEGATIVE],
          [0x00, 0x00, 0x00, cpus.ZERO],
          [0x55, 0x2a, 0x7f, 0x00],
        ],
    ).it('ORs two values and sets NZV', (s1, s2, expected, flags) => {
      const result = subject.or(s1, s2);
      expect(result).toBe(expected);
      expect(cc.value).toBe(flags);
    });

    each(
        [
          [0x55, 0xaa, 0xff],
          [0x00, 0xaa, 0xaa],
        ],
    ).it(
        'does not modify cc if condition parameter is false',
        (s1, s2, expected) => {
          const result = subject.or(s1, s2, false);
          expect(result).toBe(expected);
          expect(cc.value).toBe(0);
        });
  });

  describe('Bitwise EOR', () => {
    each(
        [
          [0x55, 0xaa, 0xff, cpus.NEGATIVE],
          [0x55, 0x55, 0x00, cpus.ZERO],
        ],
    ).it(
        'Exclusive-ORs two values bitwise and sets NZV',
        (s1, s2, expected, flags) => {
          const result = subject.eor(s1, s2);
          expect(result).toBe(expected);
          expect(cc.value).toBe(flags);
        });
  });

  describe('bitwise shift', () => {
    each(
        [
          [0xc0, 0x80, cpus.CARRY | cpus.NEGATIVE],
          [0x80, 0x00, cpus.CARRY | cpus.ZERO | cpus.OVERFLOW],
          [0x00, 0x00, cpus.ZERO],
        ],
    ).it('performs arithmetic shift left', (s1, expected, flags) => {
      const result = subject.shiftLeft(s1);
      expect(result).toBe(expected);
      expect(cc.value).toBe(flags);
    });

    each(
        [
          [0x80, 0xc0, cpus.NEGATIVE],
          [0x40, 0x20, 0x00],
          [0x00, 0x00, cpus.ZERO],
          [0x01, 0x00, cpus.ZERO | cpus.CARRY],
        ],
    ).it('performs arithmetic shift right', (s1, expected, expectedFlags) => {
      const result = subject.shiftRight(s1);
      expect(result).toBe(expected);
      expect(cc.value).toBe(expectedFlags);
    });

    each(
        [
          [0x80, 0x00, 0x00, cpus.CARRY | cpus.ZERO | cpus.OVERFLOW],
          [0x80, 0x01, cpus.CARRY, cpus.CARRY | cpus.OVERFLOW],
        ],
    ).it('performs rotate left',
        (s1, expected, initialFlags, expectedFlags) => {
          cc.value = initialFlags;
          const result = subject.rotateLeft(s1, true);
          expect(result).toBe(expected);
          expect(cc.value).toBe(expectedFlags);
        });

    each(
        [
          [0x80, 0x40, 0x00, 0x00],
          [0x80, 0xc0, cpus.CARRY, cpus.NEGATIVE],
          [0x41, 0x20, 0x00, cpus.CARRY],
        ],
    ).it('performs rotate right',
        (s1, expected, initialFlags, expectedFlags) => {
          cc.value = initialFlags;
          const result = subject.rotateRight(s1);
          expect(result).toBe(expected);
          expect(cc.value).toBe(expectedFlags);
        });
  });

  describe('general operations', () => {
    it('performs a 1s complement', () => {
      const s1 = 0x55;
      const result = subject.complement(s1);
      expect(result).toBe(0xaa);
      expect(cc.value).toBe(cpus.CARRY | cpus.NEGATIVE);
    });
  });
});
