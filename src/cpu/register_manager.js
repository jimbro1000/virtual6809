const Cpu_Register = require("../../src/cpu/cpu_register");
const cpus = require("../../src/cpu/cpu_constants");
const Control_Register = require("../../src/cpu/control_register");

class register_manager {
    constructor() {
        this.cc = new Control_Register.control_register();
        this.registers = {
            "A" : new Cpu_Register.cpu_register(cpus.SHORT, "A", this.cc),
            "B" : new Cpu_Register.cpu_register(cpus.SHORT, "B", this.cc),
            "DP" : new Cpu_Register.cpu_register(cpus.SHORT, "DP", this.cc),
            "CC" : this.cc,
            "X" : new Cpu_Register.cpu_register(cpus.LONG, "X", this.cc),
            "Y" : new Cpu_Register.cpu_register(cpus.LONG, "Y", this.cc),
            "S" : new Cpu_Register.cpu_register(cpus.LONG, "S", this.cc),
            "U" : new Cpu_Register.cpu_register(cpus.LONG, "U", this.cc),
            "PC" : new Cpu_Register.cpu_register(cpus.LONG, "PC", this.cc)
        }
    }

    get(register_name) {
        return this.registers[register_name];
    }
}

module.exports = { register_manager }