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
}

module.exports = { control_register }
