const each = require('jest-each').default;
const chips = require('../../src/memory/memory_constants.js');
const {Pia} = require('../../src/memory/pia_chip');
const {Chip} = require('../../src/memory/memory_chip.js');

describe('peripheral interface adapter PIA mapped memory', () => {
  it('maps to a memory size and location as mapped memory', () => {
    const subject = new Pia(chips.B4);
    expect(subject.getSize()).toBe(4);
    expect(subject.getReadable()).toBeTruthy();
    expect(subject.getWriteable()).toBeTruthy();
    expect(subject.getMapped()).toBeTruthy();
  });

  each(
      [
          ['readPda', [4, 0], 2],
          ['readPdb', [6, 2, 10], 3],
          ['readCra', [5, 13], 2],
          ['readCrb', [3, 7, 11, 15], 4],
      ],
  ).it('repeats the 4 PIA registers across its memory space for read',
      (method, addresses, count) => {
      const subject = new Pia(chips.B16);
      const spy = jest.spyOn(subject, method);
      subject.setBase(0);
      addresses.forEach((address) => {
        subject.getMemory(address);
      });
      expect(spy).toHaveBeenCalledTimes(count);
    });

  each(
      [
        ['writePda', [4, 0], 2],
        ['writePdb', [6, 2, 10], 3],
        ['writeCra', [5, 13], 2],
        ['writeCrb', [3, 7, 11, 15], 4],
      ],
  ).it('repeats the 4 PIA registers across its memory space for write',
      (method, addresses, count) => {
        const subject = new Pia(chips.B16);
        const spy = jest.spyOn(subject, method);
        subject.setBase(0);
        addresses.forEach((address) => {
          subject.setMemory(address, 0);
        });
        expect(spy).toHaveBeenCalledTimes(count);
      });

  it('selects a pd register if cr bit 2 is set', () => {
    const subject = new Pia(chips.B4);
    subject.writeCra(0x04);
    const spy = jest.spyOn(subject.peripheralDataRegisterA, 'set');
    const notSpy = jest.spyOn(subject.dataDirectionRegisterA, 'set');
    subject.writePda(0xff);
    expect(spy).toHaveBeenCalled();
    expect(notSpy).not.toHaveBeenCalled();
  });

  it('selects a dd register if cr bit 2 is clear', () => {
    const subject = new Pia(chips.B4);
    subject.writeCra(0x00);
    const spy = jest.spyOn(subject.dataDirectionRegisterA, 'set');
    const notSpy = jest.spyOn(subject.peripheralDataRegisterA, 'set');
    subject.writePda(0xff);
    expect(spy).toHaveBeenCalled();
    expect(notSpy).not.toHaveBeenCalled();
  });

  each(
      [
          [0x0f, 0xf0, false], [0x02, 0x06, true],
      ]
  ).it('notifies a listener if a register changes a masked bit',
      (mask, value, expected) => {
        const subject = new Pia(chips.B4);
        let called = false;
        subject.writeCra(0x04);
        subject.bindListener('pda_write', () => {called = true;}, mask);
        subject.writePda(value);
        expect(called).toBe(expected);
      });
});