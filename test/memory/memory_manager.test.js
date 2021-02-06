const each = require('jest-each').default;
const chips = require('../../src/memory/memory_constants.js');
const {Chip} = require('../../src/memory/memory_chip.js');
const {MemoryManager} = require('../../src/memory/memory_manager.js');

describe('memory manager', () => {
  describe('memory access', () => {
    let memory;

    beforeEach(() => {
      const testChip = new Chip(chips.RAM, chips.K4);
      memory = new MemoryManager([[testChip, 0x1e00]]);
      for (let i = 0; i < 256; ++i) {
        testChip.setMemory(0x1e00 + i, i);
      }
    });

    it('accepts a list of chip definition and addresses in construction',
        () => {
          memory = new MemoryManager(
              [[new Chip(chips.RAM, chips.K32), 0]],
          );
        });

    each([[0x1e00, 0], [0x1eff, 255]]).
        it('returns the byte value at the given address',
            (address, expected) => {
              const actual = memory.read(address);
              expect(actual).toBe(expected);
            });

    it('returns a zero byte if the address is unreadable', () => {
      expect(memory.read(0x8000)).toBe(0);
    });

    it('writes to memory in range', () => {
      const address = 0x1e10;
      const value = 0x55;
      memory.write(address, value);
      expect(memory.read(address)).toBe(value);
    });
  });
});
