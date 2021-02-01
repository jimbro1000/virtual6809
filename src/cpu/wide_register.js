const Cpu_Register = require("../../src/cpu/cpu_register");
const cpus = require("../../src/cpu/cpu_constants");

class wide_register extends Cpu_Register.cpu_register {
    constructor(name, register_a, register_b) {
        super(cpus.LONG, name, register_a.control_register);
        this.high_register = register_a;
        this.low_register = register_b;
    }

    load(value) {
        this.set(value);
        this.test_value();
    }

    save() {
        const result = this.fetch();
        this.test_value();
        return result;
    }

    fetch() {
        this.value = (this.high_register.fetch() << 8) + this.low_register.fetch();
        return this.value;
    }

    set(value) {
        this.value = value & this.valueMask;
        const low_value = value & 0xff;
        const high_value = (value & 0xff00) >> 8;
        this.high_register.set(high_value);
        this.low_register.set(low_value);
    }
}

module.exports = { wide_register }