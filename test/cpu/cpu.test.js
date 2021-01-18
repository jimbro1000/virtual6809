const {factory} = require("../../src/memory/memory_factory");
const each = require("jest-each").default
const {cpu} = require("../../src/cpu/cpu");
const cpus = require("../../src/cpu/cpu_constants");

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

            it("has a helper to load a short value into a register by name", () => {
                const register = subject.registers.get("A");
                register.set(0);
                subject.set_register_literal("A", 20);
                expect(subject.registers.get("A").fetch()).toBe(20);
            });

            it("has a helper to load a short value into the low byte a register by name", () => {
                const register = subject.registers.get("X");
                register.set(65535);
                subject.set_register_literal_low("X", 0x55);
                expect(subject.registers.get("X").fetch()).toBe(0xff55);
            });

            it("has a helper to load a short value into the high byte a register by name", () => {
                const register = subject.registers.get("X");
                register.set(65535);
                subject.set_register_literal_high("X", 0x55);
                expect(subject.registers.get("X").fetch()).toBe(0x55ff);
            });
        });

        describe("direct mode", () => {
            let subject;
            beforeEach(() => {
                subject = new cpu(factory("D4"));
            });
            it("combines a short register with DP to generate a 16bit address", () => {
                subject.memory.write(0x0000, 0x55);
                subject.PC.set(0x0000);
                const register = subject.registers.get("DP");
                register.set(0x80);
                subject.mode = cpus.DIRECT;
                subject.cycle();
                subject.cycle();
                expect(subject.workingValue).toBe(0x8055);
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

        each([
            [0x0,"A",[0xb7,0x20,0x00],0x10,0x2000, 5],[0x0,"A",[0xb7,0x20,0x00],0xff,0x2000, 5],
            [0x0,"B",[0xf7,0x22,0x00],0xff,0x2200, 5],[0x0,"B",[0xf7,0x10,0x10],0xf0,0x1010, 5]
        ]).
        it("processes a store instruction to memory from an 8 bit register",
            (address, register_name, code, expected, at_address, cycles) => {
            loadMemory(address, code);
            subject.registers.get("PC").set(address);
            subject.registers.get(register_name).set(expected);
            let cycle_count = cycles;
            while (cycle_count > 0) {
                subject.cycle();
                cycle_count--;
            }
            expect(subject.memory.read(at_address)).toBe(expected);
        });

        each([
            [0x0,"X",[0xbf,0x20,0x00],0x1020,0x2000, 6],[0x0,"X",[0xbf,0x20,0x00],0xffff,0x2000, 6],
            [0x0,"Y",[0x10,0xbf,0x22,0x00],0xff55,0x2200, 7],[0x0,"Y",[0x10,0xbf,0x10,0x10],0xf0ff,0x1010, 7],
            [0x0,"S",[0x10,0xff,0x20,0x00],0x1020,0x2000, 7],[0x0,"S",[0x10,0xff,0x20,0x00],0xfff0,0x2000, 7],
            [0x0,"U",[0xff,0x22,0x00],0xff55,0x2200, 6],[0x0,"U",[0xff,0x10,0x10],0xf0ff,0x1010, 6]
        ]).
        it("processes a store instruction to memory from a 16 bit register",
            (address, register_name, code, expected, at_address, cycles) => {
            loadMemory(address, code);
            subject.registers.get("PC").set(address);
            subject.registers.get(register_name).set(expected);
            let cycle_count = cycles;
            while (cycle_count > 0) {
                subject.cycle();
                cycle_count--;
            }
            const actual = subject.memory.read(at_address) << 8 | subject.memory.read(at_address + 1)
            expect(actual).toBe(expected);
            expect(subject.mode).toBe(cpus.NEXT);
        });

        it("process a nop instruction", () => {
            const code = [0x12];
            loadMemory(0x0000,code);
            subject.registers.get("PC").set(0x0000);
            subject.cycle();
            subject.cycle();
            expect(subject.registers.get("PC").fetch()).toBe(0x0001);
            expect(subject.mode).toBe(cpus.NEXT);
        });

        it("process an extended jmp to reload the program counter", () => {
            const code = [0x7e,0x80,0x00];
            loadMemory(0x0000, code);
            subject.registers.get("PC").set(0x0000);
            let cycle_count = 4;
            while (cycle_count > 0) {
                subject.cycle();
                cycle_count--;
            }
            expect(subject.registers.get("PC").fetch()).toBe(0x8000);
            expect(subject.mode).toBe(cpus.NEXT);
        });

        it("ABX adds B unsigned to X", () => {
            const code = [0x3a];
            loadMemory(0x0000, code);
            subject.registers.get("PC").set(0x0000);
            subject.registers.get("B").set(0xff);
            subject.registers.get("X").set(0x1000);
            let cycle_count = 3;
            while (cycle_count > 0) {
                subject.cycle();
                cycle_count--;
            }
            expect(subject.registers.get("PC").fetch()).toBe(0x0001);
            expect(subject.mode).toBe(cpus.NEXT);
            expect(subject.registers.get("X").fetch()).toBe(0x10ff);
        });
    });
});