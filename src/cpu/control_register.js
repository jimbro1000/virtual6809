const Cpu_Register = require("../../src/cpu/cpu_register");
const cpus = require("../../src/cpu/cpu_constants");

class control_register extends Cpu_Register.cpu_register {
    mapConditionToFunction() {
        let result = {};
        result["always"] = this.ifalways;
        result["never"] = this.ifnever;
        result["carryset"] = this.ifcarryset;
        result["carryclear"] = this.ifcarryclear;
        result["equal"] = this.ifequal;
        result["notequal"] = this.ifnotequal;
        result["greaterorequal"] = this.ifgreaterorequal;
        result["greaterthan"] = this.ifgreaterthan;
        result["higher"] = this.ifhigher;
        result["lowerorsame"] = this.iflowerorsame;
        result["lessorequal"] = this.iflessorequal;
        result["lessthan"] = this.iflessthan;
        result["negative"] = this.ifnegative;
        result["positive"] = this.ifpositive;
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

    ifnever = () => {
        return false;
    }

    ifcarryset = () => {
        return (this.value & cpus.CARRY) > 0;
    }

    ifcarryclear = () => {
        return !this.ifcarryset();
    }

    ifequal = () => {
        return (this.value & cpus.ZERO) > 0;
    }

    ifnotequal = () => {
        return !this.ifequal();
    }

    ifnegative = () => {
        return (this.value & cpus.NEGATIVE) > 0;
    }

    ifpositive = () => {
        return !this.ifnegative();
    }

    ifgreaterorequal = () => {
        const negative = (this.value & cpus.NEGATIVE) > 0;
        const overflow = (this.value & cpus.OVERFLOW) > 0;
        return !((negative && !overflow) || (overflow && !negative));
    }

    ifgreaterthan = () => {
        const negative = (this.value & cpus.NEGATIVE) > 0;
        const overflow = (this.value & cpus.OVERFLOW) > 0;
        const zero = (this.value & cpus.ZERO) > 0;
        return ((negative && !overflow) || (overflow && !negative)) && !zero;
    }

    ifhigher = () => {
        const carry = (this.value & cpus.CARRY) > 0;
        const zero = (this.value & cpus.ZERO) > 0;
        return (!carry && !zero);
    }

    iflowerorsame = () => {
        const carry = (this.value & cpus.CARRY) > 0;
        const zero = (this.value & cpus.ZERO) > 0;
        return (carry || zero);
    }

    iflessorequal = () => {
        const negative = (this.value & cpus.NEGATIVE) > 0;
        const overflow = (this.value & cpus.OVERFLOW) > 0;
        const zero = (this.value & cpus.ZERO) > 0;
        return ((negative && !overflow) || (overflow && !negative)) && zero;
    }

    iflessthan = () => {
        const negative = (this.value & cpus.NEGATIVE) > 0;
        const overflow = (this.value & cpus.OVERFLOW) > 0;
        return (negative && !overflow) || (overflow && !negative);
    }
}

module.exports = { control_register }
