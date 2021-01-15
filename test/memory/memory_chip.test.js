const each = require('jest-each').default;
const chips = require("../../src/memory/memory_constants.js");
const Chip = require("../../src/memory/memory_chip.js");

describe("memory chip abstract", () => {
    it("requires a type and size at construction", () => {
        const subject = new Chip.chip(chips.RAM, chips.K8);
        expect(subject.getSize()).toBe(8192);
        expect(subject.getReadable()).toBeTruthy();
        expect(subject.getWriteable()).toBeTruthy();
        expect(subject.getMapped()).toBeFalsy();
    });

    it("sets all memory values to 0 by default", () => {
        const subject = new Chip.chip(chips.RAM, chips.K4);
        let zero = true;
        for(let index=0;index<subject.getSize();++index) {
            zero = zero && (subject.getMemory(index) === 0);
        }
        expect(zero).toBeTruthy();
    });

    each([-1, 32768, 65535]).
    it("throws an error if the read address is out of range", (address) => {
        const subject = new Chip.chip(chips.RAM, chips.K32);
        expect(() => {subject.getMemory(address)}).toThrow(EvalError);
    });

    each([-1, 32768, 65535]).
    it("throws an error if the write address is out of range", (address) => {
        const subject = new Chip.chip(chips.RAM, chips.K32);
        expect(() => {subject.setMemory(address)}).toThrow(EvalError);
    });

    it("sets the memory at the given address if the memory is writeable", () => {
        const subject = new Chip.chip(chips.RAM, chips.K4);
        subject.setMemory(1024, 10);
        expect(subject.memory[1024]).toBe(10);
    });

    it("does not modify the value of the given address if the memory is not writeable", () => {
        const subject = new Chip.chip(chips.ROM, chips.K4);
        subject.setMemory(1024, 10);
        expect(subject.memory[1024]).toBe(0);
    });
});