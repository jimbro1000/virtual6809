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
});