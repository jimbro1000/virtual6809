const {factory} = require("../../src/memory/memory_factory");
const each = require("jest-each").default
const {cpu} = require("../../src/cpu/cpu");
const cpus = require("../../src/cpu/cpu_constants");

function run_to_next(subject) {
    let cycles = 0;
    do {
        subject.cycle();
        cycles++;
    } while (subject.code[0] !== cpus.NEXT);
    return cycles;
}

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
    });

    describe("cpu operation", () => {
        let subject;
        beforeEach(() => {
            subject = new cpu(factory("D64"));
        });

        let loadMemory = (address, bytes) => {
            for (let index = 0; index < bytes.length; ++index) {
                subject.memory.write(address + index, bytes[index]);
            }
        }

        function prepare_test(address, code, register, value) {
            loadMemory(address, code)
            subject.registers.get("PC").set(address);
            subject.registers.get(register).set(value);
        }

        function prepare_word_comparison(address, code, value, at_address, register) {
            prepare_test(address, code, register, value);
            subject.memory.write(at_address, (value & 0xff00) >> 8);
            subject.memory.write(at_address + 1, value & 0xff);
        }

        function prepare_byte_comparison(address, code, value, at_address, register) {
            prepare_test(address, code, register, value);
            subject.memory.write(at_address, value & 0xff);
        }

        function compare_memory(address, code) {
            let result = true;
            for (let index = 0; index < code.length; index++) {
                result = result && (subject.memory.read(address + index) === code[index]);
            }
            return result;
        }

        each([
            [0x0,"A",[0x86,0x20],0x20,2],[0x0,"A",[0x86,0xff],0xff,2],
            [0x0,"B",[0xc6,0x22],0x22,2],[0x0,"B",[0xc6,0xf0],0xf0,2]
        ]).
        it("processes a load instruction from memory into an 8 bit register",
            (address, register_name, code, expected, cycles) => {
            prepare_test(address, code, register_name, 0);
            let cycle_count = run_to_next(subject);
            expect(cycle_count).toBe(cycles);
            expect(subject.registers.get(register_name).fetch()).toBe(expected);
        });

        each([
            [0x0,"A",0x01,[0x96,0x20],0x21,0x0120,4],[0x0,"A",0x01,[0x96,0xff],0x55,0x01ff,4],
            [0x0,"B",0x01,[0xd6,0x22],0x22,0x0122,4],[0x0,"B",0x01,[0xd6,0xf0],0xf0,0x01f0,4]
        ]).
        it("processes a load instruction from direct memory into an 8 bit register",
            (address, register_name, page, code, expected, at_address, cycles) => {
                prepare_byte_comparison(address, code, expected, at_address, register_name);
                subject.registers.get("DP").set(page);
                let cycle_count = run_to_next(subject);
                expect(cycle_count).toBe(cycles);
                expect(subject.registers.get(register_name).fetch()).toBe(expected);
            });

        each([
            [0x0,"A",[0xb6,0x01,0x20],0x21,0x0120,5],[0x0,"A",[0xb6,0x01,0xff],0x55,0x01ff,5],
            [0x0,"B",[0xf6,0x01,0x22],0x22,0x0122,5],[0x0,"B",[0xf6,0x01,0xf0],0xf0,0x01f0,5]
        ]).
        it("processes a load instruction from extended memory into an 8 bit register",
            (address, register_name, code, expected, at_address, cycles) => {
                prepare_byte_comparison(address, code, expected, at_address, register_name);
                let cycle_count = run_to_next(subject);
                expect(cycle_count).toBe(cycles);
                expect(subject.registers.get(register_name).fetch()).toBe(expected);
            });

        each([
            [0x0,"X",[0xbe,0x20,0x55],0x2055,3],[0x0,"X",[0xbe,0xff,0x01],0xff01,3],
            [0x0,"Y",[0x10,0xbe,0x20,0x55],0x2055,4],[0x0,"Y",[0x10,0xbe,0xff,0x01],0xff01,4],
            [0x0,"S",[0x10,0xce,0x20,0x55],0x2055,4],[0x0,"S",[0x10,0xce,0xff,0x01],0xff01,4],
            [0x0,"U",[0xce,0x20,0x55],0x2055,3],[0x0,"U",[0xce,0xff,0x01],0xff01,3]
        ]).
        it("processes a load instruction from memory into a 16bit register",
            (address, register_name, code, expected, cycles) => {
            prepare_test(address, code, register_name, 0);
            let cycle_count = run_to_next(subject);
            expect(cycle_count).toBe(cycles);
            expect(subject.registers.get(register_name).fetch()).toBe(expected);
        });

        each([
            [0x0,"X",0x20,[0x9e,0x55],0x10,0x2055,5],[0x0,"X",0x0f,[0x9e,0x01],0x55,0x0f01,5],
            [0x0,"Y",0x20,[0x10,0x9e,0x55],0x20,0x2055,6],[0x0,"Y",0x0f,[0x10,0x9e,0x01],0xaa,0x0f01,6],
            [0x0,"S",0x20,[0x10,0xde,0x55],0x40,0x2055,6],[0x0,"S",0x0f,[0x10,0xde,0x01],0xaa,0x0f01,6],
            [0x0,"U",0x20,[0xde,0x55],0x80,0x2055,5],[0x0,"U",0x0f,[0xde,0x01],0x55,0x0f01,5]
        ]).
        it("processes a load instruction from direct memory into a 16bit register",
            (address, register_name, page, code, expected, at_address, cycles) => {
                prepare_word_comparison(address, code, expected, at_address, register_name);
                subject.registers.get("DP").set(page);
                let cycle_count = run_to_next(subject);
                expect(cycle_count).toBe(cycles);
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
            prepare_test(address, code, register_name, expected);
            let cycle_count = run_to_next(subject);
            expect(cycle_count).toBe(cycles);
            expect(subject.memory.read(at_address)).toBe(expected);
        });

        each([
            [0x0,"A",0x20,[0x97,0x00],0x10,0x2000, 4],[0x0,"A",0x20,[0x97,0x00],0xff,0x2000, 4],
            [0x0,"B",0x22,[0xd7,0x00],0xff,0x2200, 4],[0x0,"B",0x10,[0xd7,0x10],0xf0,0x1010, 4]
        ]).
        it("processes a store instruction to direct page memory from an 8 bit register",
            (address, register_name, page, code, expected, at_address, cycles) => {
            prepare_test(address, code, register_name, expected);
            subject.registers.get("DP").set(page);
            let cycle_count = run_to_next(subject);
            expect(cycle_count).toBe(cycles);
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
            prepare_test(address, code, register_name, expected);
            let cycle_count = run_to_next(subject);
            expect(cycle_count).toBe(cycles);
            const actual = subject.memory.read(at_address) << 8 | subject.memory.read(at_address + 1)
            expect(actual).toBe(expected);
        });

        each([
            [0x0,"X",0x20,[0x9f,0x00],0x1020,0x2000, 5],[0x0,"X",0x20,[0x9f,0x00],0xffff,0x2000, 5],
            [0x0,"Y",0x22,[0x10,0x9f,0x00],0xff55,0x2200, 6],[0x0,"Y",0x10,[0x10,0x9f,0x10],0xf0ff,0x1010, 6],
            [0x0,"S",0x20,[0x10,0xdf,0x00],0x1020,0x2000, 6],[0x0,"S",0x20,[0x10,0xdf,0x00],0xfff0,0x2000, 6],
            [0x0,"U",0x22,[0xdf,0x00],0xff55,0x2200, 5],[0x0,"U",0x10,[0xdf,0x10],0xf0ff,0x1010, 5]
        ]).
        it("processes a store instruction to direct page memory from a 16 bit register",
            (address, register_name, page, code, expected, at_address, cycles) => {
            prepare_test(address, code, register_name, expected);
            subject.registers.get("DP").set(page);
            let cycle_count = run_to_next(subject);
            expect(cycle_count).toBe(cycles);
            const actual = subject.memory.read(at_address) << 8 | subject.memory.read(at_address + 1)
            expect(actual).toBe(expected);
        });

        it("process a nop instruction", () => {
            const code = [0x12];
            loadMemory(0x0000,code);
            subject.registers.get("PC").set(0x0000);
            let cycle_count = run_to_next(subject);
            expect(cycle_count).toBe(2);
            expect(subject.registers.get("PC").fetch()).toBe(0x0001);
            expect(subject.mode).toBe(cpus.NEXT);
        });

        it("process an extended jmp to reload the program counter", () => {
            const code = [0x7e,0x80,0x00];
            loadMemory(0x0000, code);
            subject.registers.get("PC").set(0x0000);
            let cycle_count = run_to_next(subject);
            expect(cycle_count).toBe(4);
            expect(subject.registers.get("PC").fetch()).toBe(0x8000);
        });

        it("ABX adds B unsigned to X", () => {
            const code = [0x3a];
            loadMemory(0x0000, code);
            subject.registers.get("PC").set(0x0000);
            subject.registers.get("B").set(0xff);
            subject.registers.get("X").set(0x1000);
            let cycle_count = run_to_next(subject);
            expect(cycle_count).toBe(3);
            expect(subject.registers.get("PC").fetch()).toBe(0x0001);
            expect(subject.registers.get("X").fetch()).toBe(0x10ff);
        });

        each([[0x0,"A",0x20,[0x81,0x20],0x6,2],  // equals = zero + overflow
            [0x0,"A",0x20,[0x81,0x21],0x8,2], // more than = negative
            [0x0,"A",0x20,[0x81,0x1f],0x3,2], // less than = overflow + carry (borrow)
            [0x0,"B",0x55,[0xc1,0x55],0x6,2]]
        ).
        it("Compares an 8 bit register against immediate memory",
            (address, register, value, code, expected, cycles) => {
            prepare_test(address, code, register, value);
            const cc_mask = cpus.ZERO | cpus.NEGATIVE | cpus.OVERFLOW | cpus.CARRY;
            let cycle_count = run_to_next(subject);
            expect(cycle_count).toBe(cycles);
            expect(subject.CC.save() & cc_mask).toBe(expected);
        });

        each([[0x0,"A",0x20,0x10,[0x91,0x20],0x6,0x1020,4],
            [0x0,"B",0x55,0x11,[0xd1,0x55],0x6,0x1155,4]]
        ).
        it("Compares an 8 bit register against direct memory",
            (address, register, value, page, code, expected, at_address, cycles) => {
            prepare_byte_comparison(address, code, value, at_address, register);
            subject.registers.get("DP").set(page);
            const cc_mask = cpus.ZERO | cpus.NEGATIVE | cpus.OVERFLOW | cpus.CARRY;
            let cycle_count = run_to_next(subject);
            expect(cycle_count).toBe(cycles);
            expect(subject.CC.save() & cc_mask).toBe(expected);
        });

        each([[0x0,"A",0x20,[0xb1,0x10,0x20],0x6,0x1020,5],
            [0x0,"B",0x55,[0xf1,0x11,0xaa],0x6,0x11aa,5]]
        ).
        it("Compares an 8 bit register against extended memory",
            (address, register, value, code, expected, at_address, cycles) => {
            prepare_byte_comparison(address, code, value, at_address, register);
            const cc_mask = cpus.ZERO | cpus.NEGATIVE | cpus.OVERFLOW | cpus.CARRY;
            let cycle_count = run_to_next(subject);
            expect(cycle_count).toBe(cycles);
            expect(subject.CC.save() & cc_mask).toBe(expected);
        });

        each([
            [0x0000,"X",[0x8c, 0x55, 0xaa],0x55aa,0x06,4],
            [0x0000,"Y",[0x10, 0x8c, 0x55, 0xaa],0x55aa,0x06,5],
            [0x0000,"S",[0x11, 0x8c, 0x55, 0xaa],0x55aa,0x06,5],
            [0x0000,"U",[0x11, 0x83, 0x55, 0xaa],0x55aa,0x06,5]
        ]).
        it("Compares a 16 bit register against immediate memory",
            (address, register, code, value, expected, cycles) => {
            prepare_test(address, code, register, value);
            const cc_mask = cpus.ZERO | cpus.NEGATIVE | cpus.OVERFLOW | cpus.CARRY;
            let cycle_count = run_to_next(subject);
            expect(cycle_count).toBe(cycles);
            expect(subject.CC.save() & cc_mask).toBe(expected);
        });

        each([
            [0x0000,"X",0x10,[0x9c,0xaa],0x55aa,0x10aa,0x06,6],
            [0x0000,"Y",0x11,[0x10,0x9c,0xaa],0x55aa,0x11aa,0x06,7],
            [0x0000,"S",0x12,[0x11,0x9c,0xaa],0x55aa,0x12aa,0x06,7],
            [0x0000,"U",0x13,[0x11,0x93,0xaa],0x55aa,0x13aa,0x06,7]
        ]).
        it("Compares a 16 bit register against direct memory",
            (address, register, page, code, value, at_address, expected, cycles) => {
            prepare_word_comparison(address, code, value, at_address, register);
            subject.registers.get("DP").set(page);
            const cc_mask = cpus.ZERO | cpus.NEGATIVE | cpus.OVERFLOW | cpus.CARRY;
            let cycle_count = run_to_next(subject);
            expect(cycle_count).toBe(cycles);
            expect(subject.CC.save() & cc_mask).toBe(expected);
        });

        each([
            [0x0000,"X",[0xbc,0x10,0xaa],0x55aa,0x10aa,0x06,7],
            [0x0000,"Y",[0x10,0xbc,0x11,0xaa],0x55aa,0x11aa,0x06,8],
            [0x0000,"S",[0x11,0xbc,0x12,0xaa],0x55aa,0x12aa,0x06,8],
            [0x0000,"U",[0x11,0xb3,0x13,0xaa],0x55aa,0x13aa,0x06,8]
        ]).
        it("Compares a 16 bit register against direct memory",
            (address, register, code, value, at_address, expected, cycles) => {
            prepare_word_comparison(address, code, value, at_address, register);
            const cc_mask = cpus.ZERO | cpus.NEGATIVE | cpus.OVERFLOW | cpus.CARRY;
            let cycle_count = run_to_next(subject);
            expect(cycle_count).toBe(cycles);
            expect(subject.CC.save() & cc_mask).toBe(expected);
        });

        each([
            [0x0000,"A",[0x4c],0x00,0x01,2,0x00],[0x0000,"A",[0x4c],0xff,0x00,2,cpus.ZERO|cpus.OVERFLOW],
            [0x0000,"B",[0x5c],0x00,0x01,2,0x00],[0x0000,"B",[0x5c],0x7f,0x80,2,cpus.NEGATIVE]
        ]).
        it("increments a register", (address, register, code, value, expected, cycles, cc_flags) => {
            prepare_test(address, code, register, value);
            let cycle_count = run_to_next(subject);
            expect(cycle_count).toBe(cycles);
            expect(subject.registers.get(register).fetch()).toBe(expected);
            expect(subject.CC.save() & cc_flags).toBe(cc_flags);
        });

        each([
            [0x0000,[0x7c,0x20,0x01],0x00,0x2001,0x01,6,0x00],
            [0x0000,[0x7c,0x20,0x02],0xff,0x2002,0x00,6,cpus.ZERO|cpus.OVERFLOW]
        ]).
        it(
        "increments a byte in extended memory", (address, code, value, at_address, expected, cycles, cc_flags) => {
            loadMemory(address, code);
            subject.memory.write(at_address, value);
            let cycle_count = run_to_next(subject);
            expect(cycle_count).toBe(cycles);
            expect(subject.memory.read(at_address)).toBe(expected);
            expect(subject.CC.save() & cc_flags).toBe(cc_flags);
        });

        each([
            [0x0000,"A",[0x4a],0x02,0x01,2,0x00],[0x0000,"A",[0x4a],0x00,0xff,2,cpus.NEGATIVE],
            [0x0000,"B",[0x5a],0x02,0x01,2,0x00],[0x0000,"B",[0x5a],0x01,0x00,2,cpus.ZERO]
        ]).
        it("decrements a register", (address, register, code, value, expected, cycles, cc_flags) => {
            prepare_test(address, code, register, value);
            let cycle_count = run_to_next(subject);
            expect(cycle_count).toBe(cycles);
            expect(subject.registers.get(register).fetch()).toBe(expected);
            expect(subject.CC.save() & cc_flags).toBe(cc_flags);
        })

        each([
            [0x0000,[0x7a,0x20,0x01],0x02,0x2001,0x01,6,0x00],
            [0x0000,[0x7a,0x20,0x02],0x01,0x2002,0x00,6,cpus.ZERO]
        ]).
        it(
            "decrements a byte in extended memory", (address, code, value, at_address, expected, cycles, cc_flags) => {
            loadMemory(address, code);
            subject.memory.write(at_address, value);
            let cycle_count = run_to_next(subject);
            expect(cycle_count).toBe(cycles);
            expect(subject.memory.read(at_address)).toBe(expected);
            expect(subject.CC.save() & cc_flags).toBe(cc_flags);
        });

        it("pushes registers to the S stack", () => {
            const code = [0x34,0x87];
            const result = [0x00, 0x40, 0x80, 0x00, 0x02];
            const address = 0x0000;
            let register = "S";
            const at_address = 0x3fff;
            const result_address = 0x3ffa;
            subject.registers.get("A").set("0x40");
            subject.registers.get("B").set("0x80");
            loadMemory(address, code);
            subject.registers.get(register).set(at_address);
            const cycles = 10;
            const cycle_count = run_to_next(subject);
            expect(cycle_count).toBe(cycles);
            expect(subject.registers.get(register).fetch()).toBe(result_address);
            expect(compare_memory(result_address + 1, result)).toBeTruthy();
        });

        it("pushes U register to the S stack", () => {
            const code = [0x34,0x40];
            const result = [0x2f, 0xff];
            const address = 0x0000;
            let register = "S";
            const at_address = 0x3fff;
            const result_address = 0x3ffd;
            subject.registers.get("U").set("0x2fff");
            loadMemory(address, code);
            subject.registers.get(register).set(at_address);
            const cycles = 7;
            const cycle_count = run_to_next(subject);
            expect(cycle_count).toBe(cycles);
            expect(subject.registers.get(register).fetch()).toBe(result_address);
            expect(compare_memory(result_address + 1, result)).toBeTruthy();
        });

        it("pushes registers to the U stack", () => {
            const code = [0x36,0x85];
            const stack_result = [0x00, 0x55, 0x01, 0x02];
            const pc_address = 0x0100;
            let register = "U";
            const at_address = 0x3eff;
            const result_address = 0x3efb;
            subject.registers.get("B").set("0x55");
            loadMemory(pc_address, code);
            subject.registers.get("PC").set(pc_address);
            subject.registers.get(register).set(at_address);
            const cycles = 9;
            const cycle_count = run_to_next(subject);
            expect(cycle_count).toBe(cycles);
            expect(subject.registers.get(register).fetch()).toBe(result_address);
            expect(compare_memory(result_address + 1, stack_result)).toBeTruthy();
        });

        it("pushes S register to the U stack", () => {
            const code = [0x36,0x40];
            const stack_result = [0x2f, 0xff];
            const pc_address = 0x0000;
            let register = "U";
            const at_address = 0x3fff;
            const result_address = 0x3ffd;
            subject.registers.get("S").set("0x2fff");
            loadMemory(pc_address, code);
            subject.registers.get("PC").set(pc_address);
            subject.registers.get(register).set(at_address);
            const cycles = 7;
            const cycle_count = run_to_next(subject);
            expect(cycle_count).toBe(cycles);
            expect(subject.registers.get(register).fetch()).toBe(result_address);
            expect(compare_memory(result_address + 1, stack_result)).toBeTruthy();
        });

        it("pulls registers from the S stack", () => {
            const code = [0x35,0x87];
            const stack_content = [0x09, 0x40, 0x80, 0x01, 0x02];
            const address = 0x0000;
            const register = "S";
            const final_address = 0x3fff;
            const initial_address = 0x3ffa;
            loadMemory(address, code);
            loadMemory(initial_address, stack_content);
            subject.registers.get(register).set(initial_address);
            const cycles = 10;
            const cycle_count = run_to_next(subject);
            expect(cycle_count).toBe(cycles);
            expect(subject.registers.get(register).fetch()).toBe(final_address);
            expect(subject.registers.get("A").fetch()).toBe(0x40);
            expect(subject.registers.get("B").fetch()).toBe(0x80);
            expect(subject.registers.get("PC").fetch()).toBe(0x0102);
            expect(subject.CC.fetch()).toBe(0x09);
        });

        it("jumps to subroutine at direct address", () => {
            const pc_address = 0x0000;
            const code = [0x9d,0x20];
            const stack_address = 0x3fff;
            const expected_address = 0x0520;
            loadMemory(pc_address, code);
            subject.registers.get("PC").set(pc_address);
            subject.registers.get("DP").set(0x05);
            subject.registers.get("S").set(stack_address);
            const cycles = 7;
            const cycle_count = run_to_next(subject);
            expect(cycle_count).toBe(cycles);
            expect(subject.registers.get("PC").fetch()).toBe(expected_address);
            expect(subject.registers.get("S").fetch()).toBe(stack_address - 2);
        });

        it("jumps to subroutine at extended address", () => {
            const pc_address = 0x0000;
            const code = [0x8d,0x06,0x20];
            const stack_address = 0x3fff;
            const expected_address = 0x0620;
            loadMemory(pc_address, code);
            subject.registers.get("PC").set(pc_address);
            subject.registers.get("S").set(stack_address);
            const cycles = 8;
            const cycle_count = run_to_next(subject);
            expect(cycle_count).toBe(cycles);
            expect(subject.registers.get("PC").fetch()).toBe(expected_address);
            expect(subject.registers.get("S").fetch()).toBe(stack_address - 2);
        });
    });
});