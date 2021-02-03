const {manager} = require("../../src/memory/memory_manager");
const {factory} = require("../../src/memory/memory_factory");

describe("Memory hardware factory", () => {
    it("accepts a shorthand machine name and returns a memory manager with hardware", () => {
        const sample = "D64";
        const actual = factory(sample);
        expect(actual).toBeInstanceOf(manager);
        expect(actual.hardware.length).toBe(3);
        expect(actual.hardware[0].getSize()).toBe(32768);
        expect(actual.hardware[0].base).toBe(0);
        expect(actual.hardware[0].writeable).toBeTruthy();
        expect(actual.hardware[0].readable).toBeTruthy();
        expect(actual.hardware[1].getSize()).toBe(16384);
        expect(actual.hardware[1].base).toBe(32768);
        expect(actual.hardware[1].writeable).toBeFalsy();
        expect(actual.hardware[1].readable).toBeTruthy();
        expect(actual.hardware[2].getSize()).toBe(8192);
        expect(actual.hardware[2].base).toBe(49152);
        expect(actual.hardware[2].hardmapped).toBeTruthy();
    });
});