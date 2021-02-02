const Cpu_Register = require("../../src/cpu/cpu_register");
const cpus = require("../../src/cpu/cpu_constants");

class control_register extends Cpu_Register.cpu_register {
    mapConditionToFunction() {
        let result = {};
        result["always"] = this.ifalways;
        result["carryset"] = this.ifcarryset;
        result["carryclear"] = this.ifcarryclear;
        result["equal"] = this.ifequal;
        result["notequal"] = this.ifnotequal;
        result["greaterorequal"] = this.ifgreaterorequal;
        return result;
    }

    constructor() {
        super(cpus.SHORT, "CC", null);
        this.conditions = this.mapConditionToFunction();
    }

    test(condition) {
        const lambda = this.conditions[condition];
        return lambda();
    }

    set(value) {
        this.value |= value;
    }

    clear(bit) {
        this.value &= this.valueMask ^ bit;
    }

    load(value) {
        this.value = value;
    }

    save() {
        return this.value;
    }

    cc(truthy, bit) {
        if (truthy) {
            this.set(bit);
        } else {
            this.clear(bit);
        }
    }

    carry(value) {
        this.cc(value, cpus.CARRY);
    }

    halfcarry(value) {
        this.cc(value, cpus.HALFCARRY);
    }

    entire(value) {
        this.cc(value, cpus.ENTIRE);
    }

    irq(value) {
        this.cc(value, cpus.IRQ);
    }

    firq(value) {
        this.cc(value, cpus.FIRQ);
    }

    ifalways = () => {
        return true;
    }

    ifcarryset = () => {
        return (this.value & cpus.CARRY);
    }

    ifcarryclear = () => {
        return !this.ifcarryset();
    }

    ifequal = () => {
        return (this.value & cpus.ZERO);
    }

    ifnotequal = () => {
        return !this.ifequal();
    }

    ifgreaterorequal = () => {
        const negative = (this.value & cpus.NEGATIVE) > 0;
        const overflow = (this.value & cpus.OVERFLOW) > 0;
        return (negative && !overflow) || (overflow && !negative);
    }

}

module.exports = { control_register }
