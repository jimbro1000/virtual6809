const cpus = require("../../src/cpu/cpu_constants");
const Register = require("../../src/cpu/register");
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
            sample = new Register.cpu_register(cpus.SHORT, "A");
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
            sample = new Register.cpu_register(cpus.LONG, "X");
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
})