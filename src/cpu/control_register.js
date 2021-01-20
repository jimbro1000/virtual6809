const Cpu_Register = require("../../src/cpu/cpu_register");
const cpus = require("../../src/cpu/cpu_constants");

class control_register extends Cpu_Register.cpu_register {
    constructor() {
        super(cpus.SHORT, "CC", null);
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
}

module.exports = { control_register }
