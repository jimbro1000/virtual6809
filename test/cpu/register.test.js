const cpus = require("../../src/cpu/cpu_constants");
const Register = require("../../src/cpu/cpu_register");
const Control_Register = require("../../src/cpu/control_register")
// size in bits 8/16
// name
// set
// read
// side-effects

describe("register prototype", () => {
    it("requires a name and size plus the control register at construction", () => {
        const sample = new Register.cpu_register(cpus.SHORT, "A", );
        expect(sample.size).toBe(8);
        expect(sample.name).toBe("A");
    });

    describe("8 bit behaviour", () => {
        let sample;
        beforeEach(() => {
            sample = new Register.cpu_register(cpus.SHORT, "A", );
        });

        it("set shifts a value into the register", () => {
            sample.set(100);
            expect(sample.value).toBe(100);
        });

        it("fetch retrieves the value from the register", () => {
            sample.value = 127;
            expect(sample.fetch()).toBe(127);
        });
    });

    describe("16 bit behaviour", () => {
        let sample;
        beforeEach(() => {
            sample = new Register.cpu_register(cpus.LONG, "X", );
        });

        it("set shifts a value into the register", () => {
            sample.set(1000);
            expect(sample.value).toBe(1000);
        });

        it("fetch retrieves the value from the register", () => {
            sample.value = 1270;
            expect(sample.fetch()).toBe(1270);
        });
    });

    describe("cc interaction", () => {
        let sample;
        let cc;
        beforeEach(() => {
            cc = new Control_Register.control_register();
            sample = new Register.cpu_register(cpus.SHORT, "A", cc);
        });

        it("clears overflow when loading into a register", () => {
            cc.value = 255;
            sample.load(10);
            expect(cc.value & cpus.OVERFLOW).toBe(0);
        });

        it("clears zero if the loading value is not 0", () => {
            cc.value = 255;
            sample.load(1);
            expect(cc.value & cpus.ZERO).toBe(0);
        });

        it("sets zero if the loading value is 0", () => {
            cc.value = 0;
            sample.load(0);
            expect(cc.value & cpus.ZERO).toBe(cpus.ZERO);
        });

        it("clears negative if the loading value does not have the msb set", () => {
            cc.value = 255;
            sample.load(127);
            expect(cc.value & cpus.NEGATIVE).toBe(0);
        });

        it("sets negative if the loading value does have the msb set", () => {
            cc.value = 255;
            sample.load(128);
            expect(cc.value & cpus.NEGATIVE).toBe(cpus.NEGATIVE);
        });



        it("clears overflow when saving from a register", () => {
            cc.value = 255;
            sample.save();
            expect(cc.value & cpus.OVERFLOW).toBe(0);
        });

        it("clears zero if the saving value is not 0", () => {
            cc.value = 255;
            sample.value = 1;
            sample.save();
            expect(cc.value & cpus.ZERO).toBe(0);
        });

        it("sets zero if the saving value is 0", () => {
            cc.value = 0;
            sample.value = 0
            sample.save();
            expect(cc.value & cpus.ZERO).toBe(cpus.ZERO);
        });

        it("clears negative if the saving value does not have the msb set", () => {
            cc.value = 255;
            sample.value = 127;
            sample.save();
            expect(cc.value & cpus.NEGATIVE).toBe(0);
        });

        it("sets negative if the saving value does have the msb set", () => {
            cc.value = 255;
            sample.value = 128;
            sample.save();
            expect(cc.value & cpus.NEGATIVE).toBe(cpus.NEGATIVE);
        });
    });
})