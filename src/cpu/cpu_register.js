const cpus = require("../../src/cpu/cpu_constants");

class cpu_register {
    constructor(size, name, control) {
        this.size = size;
        this.name = name;
        this.value = 0;
        this.control = control;
        if (size === 8) {
            this.valueMask = 0xff;
            this.negativeMask = 0x80;
        } else {
            this.valueMask = 0xffff;
            this.negativeMask = 0x8000;
        }
    }

    cc(value, bit) {
        if (this.control !== undefined) {
            if (value) {
                this.control.set(bit);
            } else {
                this.control.clear(bit);
            }
        }
    }

    overflow(value) {
        this.cc(value, cpus.OVERFLOW);
    }

    zero(value) {
        this.cc(value, cpus.ZERO);
    }

    carry(value) {
        this.cc(value, cpus.CARRY);
    }

    negative(value) {
        this.cc(value, cpus.NEGATIVE);
    }

    halfcarry(value) {
        this.cc(value, cpus.HALFCARRY);
    }

    entire(value) {
        this.cc(value, cpus.ENTIRE);
    }

    load(value) {
        this.value = value & this.valueMask;
        this.zero(this.value === 0);
        this.negative(this.value & this.negativeMask);
        this.overflow(false);
    }

    save() {
        this.zero(this.value === 0);
        this.negative(this.value & this.negativeMask);
        this.overflow(false);
        return this.value;
    }

    fetch() {
        return this.value;
    }

    set(value) {
        this.value = value & this.valueMask;
    }
}

module.exports = { cpu_register }