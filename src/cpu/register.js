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

    overflow(value) {
        cc(value, cpus.OVERFLOW);
    }

    zero(value) {
        cc(value, cpus.ZERO);
    }

    carry(value) {
        cc(value, cpus.CARRY);
    }

    negative(value) {
        cc(value, cpus.NEGATIVE);
    }

    halfcarry(value) {
        cc(value, cpus.HALFCARRY);
    }

    entire(value) {
        cc(value, cpus.ENTIRE);
    }

    irq(value) {
        cc(value, cpus.IRQ);
    }

    firq(value) {
        cc(value, cpus.FIRQ);
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