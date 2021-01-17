const {cpu_register} = require("../../src/cpu/cpu_register");
const {register_manager} = require("../../src/cpu/register_manager");
const cpus = require("../../src/cpu/cpu_constants");
const {instructions} = require("../../src/cpu/instructions");

class cpu {
    constructor(memory_manager) {
        this.registers = new register_manager();
        this.memory = memory_manager;
        this.mode = cpus.NEXT;
        this.instructions = instructions;
        this.pc = this.registers.get("PC");
        this.operation = null;
        this.instruction = null;
        this.object = null;
        this.addressMode = null;
        this.scale = 0;
        this.workingValue = 0;
    }

    set_register_literal(register, literal_value) {
        if (typeof register === 'string') {
            register = this.registers.get(register);
        }
        if (register instanceof cpu_register) {
            register.load(literal_value);
        }
    }

    set_register_literal_low(register, literal_value) {
        if (typeof register === 'string') {
            register = this.registers.get(register);
        }
        if (register instanceof cpu_register && register.size === cpus.LONG) {
            let partial = register.fetch() & 0xff00;
            let result = partial | literal_value;
            register.load(result);
        }
    }

    set_register_literal_high(register, literal_value) {
        if (typeof register === 'string') {
            register = this.registers.get(register);
        }
        if (register instanceof cpu_register && register.size === cpus.LONG) {
            let partial = register.fetch() & 0x00ff;
            let result = partial | (literal_value << 8);
            register.load(result);
        }
    }

    fetchNextByte() {
        let address = this.PC.fetch();
        const value = this.memory.read(address++);
        this.PC.set(address);
        return value;
    }

    clearInstruction() {
        this.instruction = null;
        this.addressMode = null;
        this.object = null;
        this.workingValue = 0;
        this.scale = 0;
        this.mode = cpus.NEXT;
        this.operation = null;
    }

    cycle() {
        if (this.mode === cpus.NEXT) {
            const next_byte = this.fetchNextByte();
            const action = this.instructions(next_byte);
            if (action.mode === "fetch") {
                // multi-byte instruction
                this.operation = next_byte << 8;
            } else if (action.group === "LD") {
                this.instruction = action;
                this.addressMode = action.mode;
                this.object = this.registers.get(action.object);
                if (action.scale === 1) {
                    this.mode = cpus.DATA;
                } else {
                    this.mode = cpus.HIGHDATA;
                }
            }
        } else if (this.mode === cpus.DATA) {
            const next_byte = this.fetchNextByte();
            this.object.load(next_byte);
            this.clearInstruction();
        } else if (this.mode === cpus.HIGHDATA) {
            const next_byte = this.fetchNextByte();
            this.workingValue = next_byte << 8;
            this.mode = cpus.LOWDATA;
        } else if (this.mode === cpus.LOWDATA) {
            const next_byte = this.fetchNextByte();
            this.workingValue |= next_byte;
            this.object.load(this.workingValue);
            this.clearInstruction();
        }
    }
}

module.exports = { cpu }
