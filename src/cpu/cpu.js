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
        result["READADHIGH"] = cpus.READADHIGH;
        result["READADLOW"] = cpus.READADLOW;
        result["TFRWTOOB"] = cpus.TFRWTOOB;
        result["TFRWTOTG"] = cpus.TFRWTOTG;
        result["BUSY"] = cpus.BUSY;
        result["ADDTGTOOB"] = cpus.ADDTGTOOB;
        result["READWLOW"] = cpus.READWLOW;
        result["READLOWCOMPARE"] = cpus.READLOWCOMPARE;
        result["READADLOWCOMPARE"] = cpus.READADLOWCOMPARE;
        return result;
    }

    map_code_to_lambda() {
        let result = {};
        result[cpus.NEXT] = this.fetch_next_instruction_from_PC;
        result[cpus.FETCH] = this.fetch_next_instruction_from_PC;
        result[cpus.DIRECT] = this.build_direct_page_address_in_W;
        result[cpus.READHIGH] = this.read_next_high_data_byte_from_PC;
        result[cpus.READLOW] = this.read_next_low_data_byte_from_PC;
        result[cpus.READWLOW] = this.read_next_low_data_byte_to_W_from_PC;
        result[cpus.WRITEHIGH] = this.write_object_high_byte_to_AD;
        result[cpus.WRITELOW] = this.write_object_low_byte_to_AD;
        result[cpus.READADHIGH] = this.read_next_high_data_byte_from_AD;
        result[cpus.READADLOW] = this.read_next_low_data_byte_from_AD;
        result[cpus.TFRWTOOB] = this.transfer_w_to_object;
        result[cpus.TFRWTOTG] = this.transfer_w_to_target;
        result[cpus.BUSY] = this.busy_state;
        result[cpus.ADDTGTOOB] = this.add_target_to_object;
        result[cpus.READLOWCOMPARE] = this.read_and_compare_low_byte;
        result[cpus.READADLOWCOMPARE] = this.read_ad_and_compare_low_byte;
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
        this.object = null;
        this.target = null;
        this.W.set(0);
        this.AD.set(0);
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

    add_target_to_object = () => {
        this.W.set(this.object.fetch() + this.target.fetch());
    }

    fetch_next_instruction_from_PC = () => {
        const next_byte = this.fetchNextByte();
        this.operation |= next_byte;
        const action = this.instructions[this.operation];
        if (typeof action === 'undefined') {
            throw "illegal instruction";
        }
        if (action.mode === "fetch") {
            this.operation = next_byte << 8;
            this.code = [cpus.FETCH];
        } else {
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
        this.W.set(0);
    }

    transfer_w_to_target = () => {
        this.target.set(this.W.fetch());
        this.W.set(0);
    }

    build_direct_page_address_in_W = () => {
        this.W.set((this.registers.get("DP").fetch() << 8) | this.fetchNextByte());
    }

    read_next_high_data_byte_from_PC = () => {
        this.W.set(this.fetchNextByte() << 8);
    }

    read_next_low_data_byte_from_PC = () => {
        this.object.load(this.W.fetch() | this.fetchNextByte());
    }

    read_next_high_data_byte_from_AD = () => {
        let AD = this.AD.fetch();
        const next_byte = this.memory.read(AD++);
        this.W.set(next_byte << 8);
        this.AD.set(AD);
    }

    read_next_low_data_byte_from_AD = () => {
        this.object.load(this.W.fetch() | this.memory.read(this.AD.fetch()));
    }

    read_next_low_data_byte_to_W_from_PC = () => {
        this.W.set(this.W.fetch() | this.fetchNextByte());
    }

    write_object_high_byte_to_AD = () => {
        let AD = this.AD.fetch();
        this.memory.write(AD++, (this.object.fetch() & 0xff00) >> 8);
        this.AD.set(AD);
    }

    write_object_low_byte_to_AD = () => {
        this.memory.write(this.AD.fetch(), this.object.save() & 0xff);
    }

    busy_state = () => {
        //do nothing
    }

    read_and_compare_low_byte = () => {
        this.compare_low_byte(this.fetchNextByte())
    }

    read_ad_and_compare_low_byte = () => {
        this.compare_low_byte(this.memory.read(this.AD.fetch()));
    }

    compare_low_byte = (n) => {
        this.W.set(n);
        this.complement(this.W, cpus.SHORT);
        const w = this.W.fetch();
        const o = this.object.fetch();
        const temp = w + o;
        const masked = temp & 0xff;
        if (masked === 0) {
            this.CC.set(cpus.ZERO);
        } else {
            this.CC.clear(cpus.ZERO);
        }
        if (masked & 0x80) {
            this.CC.set(cpus.NEGATIVE);
        } else {
            this.CC.clear(cpus.NEGATIVE);
        }
        if (temp !== masked) {
            this.CC.set(cpus.OVERFLOW);
        } else {
            this.CC.clear(cpus.OVERFLOW);
        }
        if (n > o) {
            this.CC.set(cpus.CARRY);
        } else {
            this.CC.clear(cpus.CARRY);
        }
    }

    complement = (register, scale) => {
        let value = register.fetch();
        if (scale === cpus.SHORT) {
            value = value & 0xff;
            value = this.xor(value, scale);
            value += 1;
        }
        register.set(value);
    }

    xor = (value, scale) => {
        let mask = 0x01;
        let result = 0;
        for (let index = 0; index < scale; index ++) {
            if ((value & mask) === 0) {
                result |= mask;
            }
            mask = mask << 1
        }
        return result;
    }
}

module.exports = { cpu }
