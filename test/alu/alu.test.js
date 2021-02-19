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

  describe('Multiplication', () => {
    it('multiplies two values', () => {
      const s1 = 0x20;
      const s2 = 0x08;
      const expected = 0x0100;
      const result = subject.mul8(s1, s2);
      expect(result).toBe(expected);
    });

    it('sets carry if bit 7 of the result is set', () => {
      const s1 = 0x10;
      const s2 = 0x08;
      subject.mul8(s1, s2);
      expect(cc.value & cpus.CARRY).toBe(cpus.CARRY);
    });

    it('sets zero if the result is zero', () => {
      const s1 = 0x00;
      const s2 = 0x00;
      subject.mul8(s1, s2);
      expect(cc.value & cpus.ZERO).toBe(cpus.ZERO);
    });
  });

  describe('Bitwise AND', () => {
    each(
        [
          [0x55, 0xaa, 0x00, cpus.ZERO],
          [0xff, 0x55, 0x55, 0x00],
        ],
    ).it('ANDs two values and sets NZV', (s1, s2, expected, flags) => {
      const result = subject.and8(s1, s2);
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
          const result = subject.and8(s1, s2, false);
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
      const result = subject.or8(s1, s2);
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
          const result = subject.or8(s1, s2, false);
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
          const result = subject.eor8(s1, s2);
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
      const result = subject.shiftLeft8(s1);
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
      const result = subject.shiftRight8(s1);
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
          const result = subject.rotateLeft8(s1, true);
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
          const result = subject.rotateRight8(s1);
          expect(result).toBe(expected);
          expect(cc.value).toBe(expectedFlags);
        });
  });

  describe('general operations', () => {
    it('performs a 1s complement', () => {
      const s1 = 0x55;
      const result = subject.complement8(s1);
      expect(result).toBe(0xaa);
      expect(cc.value).toBe(cpus.CARRY | cpus.NEGATIVE);
    });

    each(
        [
          [0x55, 0xab, cpus.CARRY | cpus.NEGATIVE],
          [0x00, 0x00, cpus.ZERO],
          [0x80, 0x80, cpus.CARRY | cpus.OVERFLOW | cpus.NEGATIVE],
        ],
    ).it('performs a 2s complement', (initialValue, expectedValue, ccFlags) => {
      const result = subject.negate8andTest(initialValue);
      expect(result).toBe(expectedValue);
      expect(cc.value).toBe(ccFlags);
    });

    it('tests an 8 bit value for negative flag', () => {
      const ccFlags = cpus.NEGATIVE;
      const testValue = 0x80;
      subject.test8(testValue);
      expect(cc.value & ccFlags).toBe(ccFlags);
    });

    it('tests an 8 bit value for zero flag', () => {
      const ccFlags = cpus.ZERO;
      const testValue = 0x00;
      subject.test8(testValue);
      expect(cc.value & ccFlags).toBe(ccFlags);
    });

    it('clears the overflow flag after testing', () => {
      const ccFlags = cpus.OVERFLOW;
      cc.value = 0xff;
      subject.test8(0x01);
      expect(cc.value & ccFlags).toBe(0x00);
    });

    describe('decimal adjust accumulator', () => {
      it('corrects the value if a half carry is present', () => {
        cc.value = cpus.HALFCARRY;
        const result = subject.daa(0x03);
        expect(result).toBe(0x19);
      });

      it('corrects the value if low nibble is over 9', () => {
        const result = subject.daa(0x0b);
        expect(result).toBe(0x11);
      });

      it('corrects the upper nibble if a carry is present', () => {
        cc.value = cpus.CARRY;
        const result = subject.daa(0x18);
        expect(result).toBe(0x78);
      });

      it('corrects the upper nibble if it is over 9', () => {
        const result = subject.daa(0xa6);
        expect(result).toBe(0x06);
      });

      it(
          'corrects the upper nibble if higher is over 8 and lower is over 9',
          () => {
            const result = subject.daa(0x9a);
            expect(result).toBe(0x00);
          });

      it('sets the carry flag if the adjustment overflows the upper nibble',
          () => {
            cc.value = cpus.HALFCARRY | cpus.CARRY;
            subject.daa(0x91);
            expect(cc.value & cpus.CARRY).toBe(cpus.CARRY);
          });

      it('sets the negative flag when the result is negative', () => {
        subject.daa(0x80);
        expect(cc.value & cpus.NEGATIVE).toBe(cpus.NEGATIVE);
      });

      it('sets the zero flag when the result is zero', () => {
        subject.daa(0x00);
        expect(cc.value & cpus.ZERO).toBe(cpus.ZERO);
      });
    });
  });

  describe('effective address', () => {
    each(
        [[0x10, 0x200, 0x1f0], [0x0f, 0x200, 0x20f]],
    ).it('calculates effective address 5 bit offset from register',
        (offset, registerValue, expectedAddress) => {
          const effectiveAddress = subject.offsetEA5(offset, registerValue);
          expect(effectiveAddress).toBe(expectedAddress);
        });

    each(
        [[0xf0, 0x200, 0x1f0], [0x2f, 0x200, 0x22f]],
    ).it('calculates effective address 8 bit offset from register',
        (offset, registerValue, expectedAddress) => {
          const effectiveAddress = subject.offsetEA8(offset, registerValue);
          expect(effectiveAddress).toBe(expectedAddress);
        });

    each(
        [[0xfff0, 0x0200, 0x1f0], [0x012f, 0x0200, 0x32f],
          [0xff00, 0x0000, 0xff00]],
    ).it('calculates effective address 16 bit offset from register',
        (offset, registerValue, expectedAddress) => {
          const effectiveAddress = subject.offsetEA16(offset, registerValue);
          expect(effectiveAddress).toBe(expectedAddress);
        });
  });
});
