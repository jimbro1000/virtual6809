const {CpuRegister} = require("../../src/cpu/cpu_register");
const cpus = require("../../src/cpu/cpu_constants");

class ControlRegister extends CpuRegister {
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
        result["overflow"] = this.ifoverflow;
        result["notoverflow"] = this.ifnotoverflow;
        return result;
    }

    constructor() {
        super(cpus.SHORT, "CC", null);
        this.conditions = this.mapConditionToFunction();
    }

    test(condition) {
        const lambda = this.conditions[condition];
        return lambda(this);
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

    ifalways() {
        return true;
    }

    ifnever() {
        return false;
    }

    ifcarryset(cc) {
        return (cc.value & cpus.CARRY) > 0;
    }

    ifcarryclear(cc) {
        return !cc.ifcarryset(cc);
    }

    ifequal(cc) {
        return (cc.value & cpus.ZERO) > 0;
    }

    ifnotequal(cc) {
        return !cc.ifequal(cc);
    }

    ifnegative(cc) {
        return (cc.value & cpus.NEGATIVE) > 0;
    }

    ifpositive(cc) {
        return !cc.ifnegative(cc);
    }

    ifoverflow(cc) {
        return (cc.value & cpus.OVERFLOW) > 0;
    }

    ifnotoverflow(cc) {
        return !cc.ifoverflow(cc);
    }

    ifgreaterorequal(cc) {
        const negative = (cc.value & cpus.NEGATIVE) > 0;
        const overflow = (cc.value & cpus.OVERFLOW) > 0;
        return !((negative && !overflow) || (overflow && !negative));
    }

    ifgreaterthan(cc) {
        const negative = (cc.value & cpus.NEGATIVE) > 0;
        const overflow = (cc.value & cpus.OVERFLOW) > 0;
        const zero = (cc.value & cpus.ZERO) > 0;
        return ((negative && !overflow) || (overflow && !negative)) && !zero;
    }

    ifhigher(cc) {
        const carry = (cc.value & cpus.CARRY) > 0;
        const zero = (cc.value & cpus.ZERO) > 0;
        return (!carry && !zero);
    }

    iflowerorsame(cc) {
        const carry = (cc.value & cpus.CARRY) > 0;
        const zero = (cc.value & cpus.ZERO) > 0;
        return (carry || zero);
    }

    iflessorequal(cc) {
        const negative = (cc.value & cpus.NEGATIVE) > 0;
        const overflow = (cc.value & cpus.OVERFLOW) > 0;
        const zero = (cc.value & cpus.ZERO) > 0;
        return ((negative && !overflow) || (overflow && !negative)) && zero;
    }

    iflessthan(cc) {
        const negative = (cc.value & cpus.NEGATIVE) > 0;
        const overflow = (cc.value & cpus.OVERFLOW) > 0;
        return (negative && !overflow) || (overflow && !negative);
    }
//
    ifhalfcarry() {
        return (this.value & cpus.HALFCARRY) > 0;
    }

    ifentireset() {
        return (this.value & cpus.ENTIRE) > 0;
    }

    ifirqclear() {
        return (this.value & cpus.IRQ) === 0;
    }

    iffirqclear() {
        return (this.value & cpus.FIRQ) === 0
    }
}

module.exports = { ControlRegister }
