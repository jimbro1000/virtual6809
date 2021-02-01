const Cpu_Register = require("../../src/cpu/cpu_register");
const cpus = require("../../src/cpu/cpu_constants");
const Control_Register = require("../../src/cpu/control_register");
const Wide_Register = require("../../src/cpu/wide_register");

class register_manager {
    constructor() {
        this.cc = new Control_Register.control_register();
        const a = new Cpu_Register.cpu_register(cpus.SHORT, "A", this.cc);
        const b = new Cpu_Register.cpu_register(cpus.SHORT, "B", this.cc);
        this.registers = {
            "A" : a,
            "B" : b,
            "DP" : new Cpu_Register.cpu_register(cpus.SHORT, "DP", this.cc),
            "CC" : this.cc,
            "X" : new Cpu_Register.cpu_register(cpus.LONG, "X", this.cc),
            "Y" : new Cpu_Register.cpu_register(cpus.LONG, "Y", this.cc),
            "S" : new Cpu_Register.cpu_register(cpus.LONG, "S", this.cc),
            "U" : new Cpu_Register.cpu_register(cpus.LONG, "U", this.cc),
            "PC" : new Cpu_Register.cpu_register(cpus.LONG, "PC", this.cc),
            //wide register D = A.B
            "D" : new Wide_Register.wide_register("D", a, b),
            //internal registers
            "W" : new Cpu_Register.cpu_register(cpus.LONG, "W", this.cc),
            "AD" : new Cpu_Register.cpu_register(cpus.LONG, "AD", this.cc)
        }
    }

    get(register_name) {
        return this.registers[register_name];
    }
}

module.exports = { register_manager }