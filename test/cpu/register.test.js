const cpus = require("../../src/cpu/cpu_constants");
const Register = require("../../src/cpu/cpu_register");
const Control_Register = require("../../src/cpu/control_register")
const Wide_Register = require("../../src/cpu/wide_register");

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
});

describe("d register", () => {
    it("combines the A and B registers", () => {
        const a = new Register.cpu_register(cpus.SHORT, "A", undefined);
        const b = new Register.cpu_register(cpus.SHORT, "B", undefined);
        a.load(0xaa);
        b.load(0x55);
        const d = new Wide_Register.wide_register("D", a, b);
        expect(d.fetch()).toBe(0xaa55);
    });

    it("loads values actoss both registers", () => {
        const a = new Register.cpu_register(cpus.SHORT, "A", undefined);
        const b = new Register.cpu_register(cpus.SHORT, "B", undefined);
        a.load(0x00);
        b.load(0x00);
        const d = new Wide_Register.wide_register("D", a, b);
        d.load(0x55aa);
        expect(d.fetch()).toBe(0x55aa);
    });
});

describe("control register", () => {
    let cc;
    beforeEach(() => {
        cc = new Control_Register.control_register();
    });

    it("overrides set to OR against existing value", () => {
        cc.value = 0xaa;
        cc.set(0x57);
        expect(cc.value).toBe(0xff);
    });

    it("clear will mask out against the existing value", () => {
        cc.value = 0xff;
        cc.clear(0x55);
        expect(cc.value).toBe(0xaa);
    });

    it("load sets the register value", () => {
        cc.value = 0x55;
        cc.load(0xaa);
        expect(cc.value).toBe(0xaa);
    });

    it("overrides save to simply return the value", () => {
        cc.value = 0x55;
        expect(cc.save()).toBe(0x55);
    });
});