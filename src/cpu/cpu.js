const {cpu_register} = require("../../src/cpu/cpu_register");
const {register_manager} = require("../../src/cpu/register_manager");
const cpus = require("../../src/cpu/cpu_constants");
const {instructions} = require("../../src/cpu/instructions");

class cpu {
    constructor(memory_manager) {
        this.registers = new register_manager();
        this.memory = memory_manager;
        this.mode = cpus.NEXT;
        this.code = [cpus.NEXT];
        this.instructions = instructions;
        this.PC = this.registers.get("PC");
        this.W = this.registers.get("W");
        this.AD = this.registers.get("AD");
        this.CC = this.registers.get("CC");
        this.operation = null;
        this.instruction = null;
        this.object = null;
        this.target = null;
        this.codes = this.map_code_name_to_code();
        this.lambdas = this.map_code_to_lambda();
    }

    map_code_name_to_code() {
        let result = {};
        result["DIRECT"] = cpus.DIRECT;
        result["READHIGH"] = cpus.READHIGH;
        result["READLOW"] = cpus.READLOW;
        result["WRITEHIGH"] = cpus.WRITEHIGH;
        result["WRITELOW"] = cpus.WRITELOW;
        result["READADDHIGH"] = cpus.READADDHIGH;
        result["READADDLOW"] = cpus.READADDLOW;
        result["TFRWTOOB"] = cpus.TFRWTOOB;
        result["TFRWTOTG"] = cpus.TFRWTOTG;
        result["BUSY"] = cpus.BUSY;
        result["ADDTGTOOB"] = cpus.ADDTGTOOB;
        return result;
    }

    map_code_to_lambda() {
        let result = {};
        result[cpus.NEXT] = this.next_instruction_state;
        result[cpus.FETCH] = this.next_instruction_state;
        result[cpus.DIRECT] = this.generate_direct_state;
        result[cpus.READHIGH] = this.data_high_byte_state;
        result[cpus.READLOW] = this.data_low_byte_state;
        result[cpus.WRITEHIGH] = this.write_high_byte_state;
        result[cpus.WRITELOW] = this.write_low_byte_state;
        result[cpus.READADDHIGH] = this.address_high_byte_state;
        result[cpus.READADDLOW] = this.address_low_byte_state;
        result[cpus.TFRWTOOB] = this.transfer_w_to_object;
        result[cpus.TFRWTOTG] = this.transfer_w_to_target;
        result[cpus.BUSY] = this.busy_state;
        result[cpus.ADDTGTOOB] = this.process_action_state;
        return result;
    }

    populate_code_stack(instruction_code) {
        this.code = [];
        for (let index=instruction_code.length-1;index>=0;index--) {
            this.code.push(this.codes[instruction_code[index]]);
        }
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
        this.object = null;
        this.target = null;
        this.W.set(0);
        this.AD.set(0);
        this.scale = 0;
        this.code = [cpus.NEXT];
        this.operation = 0;
    }

    cycle() {
        const lambda = this.lambdas[this.code.pop()];
        lambda();
        if (this.code.length === 0) {
            this.clearInstruction();
        }
    }

    process_action_state = () => {
        this.W.set(this.object.fetch() + this.target.fetch());
    }

    next_instruction_state = () => {
        const next_byte = this.fetchNextByte();
        this.operation |= next_byte;
        const action = this.instructions[this.operation];
        if (action.mode === "fetch") {
            this.operation = next_byte << 8;
            this.mode = cpus.FETCH;
            this.code = [cpus.FETCH];
        } else {
            this.instruction = action;
            if (typeof action.object !== 'undefined') {
                this.object = this.registers.get(action.object);
            }
            if (typeof action.target !== 'undefined') {
                this.target = this.registers.get(action.target);
            }
            this.populate_code_stack(action.code);
        }
    }

    transfer_w_to_object = () => {
        this.object.set(this.W.fetch());
    }

    transfer_w_to_target = () => {
        this.target.set(this.W.fetch());
    }

    generate_direct_state = () => {
        const next_byte = this.fetchNextByte();
        this.W.set((this.registers.get("DP").fetch() << 8) | next_byte);
    }

    data_high_byte_state = () => {
        const next_byte = this.fetchNextByte();
        this.W.set(next_byte << 8);
    }

    data_low_byte_state = () => {
        const next_byte = this.fetchNextByte();
        this.object.load(this.W.fetch() | next_byte);
    }

    address_high_byte_state = () => {
        const next_byte = this.fetchNextByte();
        this.W.set(next_byte << 8);
    }

    address_low_byte_state = () => {
        const next_byte = this.fetchNextByte();
        this.W.set(this.W.fetch() | next_byte);
    }

    write_high_byte_state = () => {
        let AD = this.AD.fetch();
        this.memory.write(AD++, (this.object.fetch() & 0xff00) >> 8);
        this.AD.set(AD);
    }

    write_low_byte_state = () => {
        this.memory.write(this.AD.fetch(), this.object.save() & 0xff);
    }

    busy_state = () => {
        //do nothing
    }
}

module.exports = { cpu }
