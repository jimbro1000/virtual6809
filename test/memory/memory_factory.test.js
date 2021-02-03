const {manager} = require("../../src/memory/memory_manager");
const {factory} = require("../../src/memory/memory_factory");
const each = require("jest-each").default;

describe("Memory hardware factory", () => {
    each([
        ["D64",4,[32768,16384,8192,4096]],
        ["D4",1,[4096]]
    ]).
    it("accepts a shorthand machine name and returns a memory manager with hardware",
        (sample,blocks,sizes) => {
        const actual = factory(sample);
        expect(actual).toBeInstanceOf(manager);
        expect(actual.hardware.length).toBe(blocks);
        for (let index=0;index<blocks;++index) {
            expect(actual.hardware[index].getSize()).toBe(sizes[index]);
        }
    });
});