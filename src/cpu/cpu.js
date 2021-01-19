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
        this.PC = this.registers.get("PC");
        this.operation = null;
        this.instruction = null;
        this.object = null;
        this.addressMode = null;
        this.scale = 0;
        this.workingValue = 0;
        this.stateModel = this.map_state_to_action();
    }

    map_state_to_action() {
        let result = {};
        result[cpus.NEXT] = this.next_instruction_state;
        result[cpus.FETCH] = this.next_instruction_state;
        result[cpus.HIGHDATA] = this.data_high_byte_state;
        result[cpus.LOWDATA] = this.data_low_byte_state;
        result[cpus.HIGHADDRESS] = this.address_high_byte_state;
        result[cpus.LOWADDRESS] = this.address_low_byte_state;
        result[cpus.WRITEHIGH] = this.write_high_byte_state;
        result[cpus.WRITELOW] = this.write_low_byte_state;
        result[cpus.BUSY] = this.busy_state;
        result[cpus.ABX] = this.process_action_state;
        result[cpus.DIRECT] = this.generate_direct_state;
        return result;
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
        this.operation = 0;
    }

    cycle() {
        const lambda = this.stateModel[this.mode];
        lambda();
    }

    load_instruction_group = (action) => {
        this.instruction = action;
        this.addressMode = action.mode;
        this.object = this.registers.get(action.object);
        if (action.scale === 1) {
            this.mode = cpus.LOWDATA;
        } else {
            this.mode = cpus.HIGHDATA;
        }
    }

    store_instruction_group = (action) => {
        this.instruction = action;
        this.addressMode = action.mode;
        this.object = this.registers.get(action.object);
        if (action.scale === 1) {
            this.workingValue = this.registers.get("DP").fetch() << 8;
            this.mode = cpus.LOWADDRESS;
        } else {
            this.mode = cpus.HIGHADDRESS;
        }
    }

    unconditional_jump_group = (action) => {
        this.instruction = action;
        this.addressMode = action.mode;
        this.object = this.PC;
        // if (action.scale === 1) {
        //     this.mode = cpus.DIRECT;
        // } else {
            this.mode = cpus.HIGHADDRESS;
        // }
    }

    process_action_state = () => {
        if (this.instruction.operation === "ABX") {
            let X = this.registers.get("X");
            let B = this.registers.get("B");
            X.set(X.fetch() + B.fetch());
            this.mode = cpus.BUSY;
        }
    }

    next_instruction_state = () => {
        const next_byte = this.fetchNextByte();
        this.operation |= next_byte;
        const action = this.instructions[this.operation];
        if (action.mode === "fetch") {
            this.operation = next_byte << 8;
            this.mode = cpus.FETCH;
        } else if (action.operation === "NOP") {
            this.mode = cpus.BUSY;
        } else if (action.operation === "ABX") {
            this.mode = cpus.ABX;
            this.instruction = action;
        } else {
            if (action.group === "LD") {
                this.load_instruction_group(action);
            } else if (action.group === "ST") {
                this.store_instruction_group(action);
            } else if (action.group === "JMP") {
                this.unconditional_jump_group(action);
            }
        }
    }

    generate_direct_state = () => {
        this.workingValue = this.registers.get("DP").fetch() << 8;
        this.mode = cpus.LOWADDRESS;
    }

    data_high_byte_state = () => {
        const next_byte = this.fetchNextByte();
        this.workingValue = next_byte << 8;
        this.mode = cpus.LOWDATA;
    }

    data_low_byte_state = () => {
        const next_byte = this.fetchNextByte();
        this.workingValue |= next_byte;
        if (this.instruction.group === "LD") {
            this.object.load(this.workingValue);
        }
        this.clearInstruction();
    }

    address_high_byte_state = () => {
        const next_byte = this.fetchNextByte();
        this.workingValue = next_byte << 8;
        this.mode = cpus.LOWADDRESS;
    }

    address_low_byte_state = () => {
        const next_byte = this.fetchNextByte();
        this.workingValue |= next_byte;
        if (this.instruction.group === "ST") {
            if (this.object.size === cpus.SHORT) {
                this.mode = cpus.WRITELOW;
            } else {
                this.mode = cpus.WRITEHIGH;
            }
        } else if (this.instruction.group === "JMP") {
            this.PC.set(this.workingValue);
            this.mode = cpus.BUSY;
        } else {
            this.mode = cpus.BUSY;
        }
    }

    write_high_byte_state = () => {
        if (this.instruction.group === "ST") {
            this.memory.write(this.workingValue++, (this.object.fetch() & 0xff00) >> 8);
        }
        this.mode = cpus.WRITELOW;
    }

    write_low_byte_state = () => {
        if (this.instruction.group === "ST") {
            this.memory.write(this.workingValue, this.object.save() & 0xff);
            this.mode = cpus.BUSY;
        }
    }

    busy_state = () => {
        this.clearInstruction();
    }
}

module.exports = { cpu }
