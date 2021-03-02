const {MemoryManager} = require('../../src/memory/memory_manager');
const {factory} = require('../../src/memory/memory_factory');
const each = require('jest-each').default;

describe('Memory hardware factory', () => {
  each([
    ['D64', 4, [32, 32, 32768, 32768]],
    ['D4', 2, [256, 4096]],
  ]).it(
      'accepts a shorthand machine name and returns a memory manager',
      (sample, blocks, sizes) => {
        const actual = factory(sample);
        expect(actual).toBeInstanceOf(MemoryManager);
        expect(actual.hardware.length).toBe(blocks);
        for (let index = 0; index < blocks; ++index) {
          expect(actual.hardware[index].getSize()).toBe(sizes[index]);
        }
      });
});
