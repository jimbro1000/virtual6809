const {factory} = require("../../src/memory/memory_factory");
const each = require("jest-each").default
const {cpu} = require("../../src/cpu/cpu");

describe("6809 cpu", () => {
    describe("address mode translation", () => {
        describe("literal mode", () => {
            let subject;
            beforeEach(() => {
                subject = new cpu();
            });
            it("loads a fixed literal short value into a register", () => {
                const value = 100;
                const register = subject.registers.get("A");
                subject.subject_register = register;
                subject.set_register_literal(register, value);
                expect(register.fetch()).toBe(value);
            });

            each([[0xff42,0x20,0xff20],[0xffff,0x00,0xff00]]).
            it("loads a fixed literal short value into the low byte of a register", (initial, value, expected) => {
                const register = subject.registers.get("X");
                register.set(initial);
                subject.subject_register = register;
                subject.set_register_literal_low(register, value);
                expect(register.fetch()).toBe(expected);
            });

            each([[0xff42,0x20,0x2042],[0xffff,0x00,0x00ff]]).
            it("loads a fixed literal short value into the high byte of a register", (initial, value, expected) => {
                const register = subject.registers.get("X");
                register.set(initial);
                subject.subject_register = register;
                subject.set_register_literal_high(register, value);
                expect(register.fetch()).toBe(expected);
            });
        });
    });

    describe("cpu operation", () => {
        let subject;
        beforeEach(() => {
            subject = new cpu(factory("D64"));
        });

        loadMemory = (address, bytes) => {
            for (let index=0; index<bytes.length; ++index) {
                subject.memory.write(address + index, bytes[index]);
            }
        }

        each([
            [0x0,"A",[0x86,0x20],0x20],[0x0,"A",[0x86,0xff],0xff],
            [0x0,"B",[0xc6,0x22],0x22],[0x0,"B",[0xc6,0xf0],0xf0]
        ]).
        it("processes a load instruction from memory into an 8 bit register",
            (address, register_name, code, expected) => {
            loadMemory(address, code);
            subject.registers.get("PC").set(address);
            subject.registers.get(register_name).set(0);
            subject.cycle();
            subject.cycle();
            expect(subject.registers.get(register_name).fetch()).toBe(expected);
        });

        each([
            [0x0,"X",[0xbe,0x20,0x55],0x2055],[0x0,"X",[0xbe,0xff,0x01],0xff01],
            [0x0,"Y",[0x10,0xbe,0x20,0x55],0x2055],[0x0,"Y",[0x10,0xbe,0xff,0x01],0xff01],
            [0x0,"S",[0x10,0xce,0x20,0x55],0x2055],[0x0,"S",[0x10,0xce,0xff,0x01],0xff01],
            [0x0,"U",[0xce,0x20,0x55],0x2055],[0x0,"U",[0xce,0xff,0x01],0xff01]
        ]).
        it("processes a load instruction from memory into a 16bit register",
            (address, register_name, code, expected) => {
            loadMemory(address, code);
            subject.registers.get("PC").set(address);
            subject.registers.get(register_name).set(0);
            let cycle_count = code.length;
            while (cycle_count > 0) {
                subject.cycle();
                cycle_count--;
            }
            expect(subject.registers.get(register_name).fetch()).toBe(expected);
        });

        it("processes a sequence of load instructions", () => {
            const code = [0xbe,0x55,0x20,0x86,0xff];
            loadMemory(0, code);
            subject.registers.get("PC").set(0);
            subject.registers.get("A").set(0);
            subject.registers.get("X").set(0);
            let cycle_count = code.length;
            while (cycle_count > 0) {
                subject.cycle();
                cycle_count--;
            }
            expect(subject.registers.get("X").fetch()).toBe(0x5520);
            expect(subject.registers.get("A").fetch()).toBe(0xff);
        });
    });
});