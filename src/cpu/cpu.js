const {cpu_register} = require("../../src/cpu/cpu_register");
const {register_manager} = require("../../src/cpu/register_manager");
const cpus = require("../../src/cpu/cpu_constants");
const {instructions} = require("../../src/cpu/instructions");
const {alu} = require("../../src/alu/alu");

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
        this.alu1 = new alu(this.CC);
        this.operation = null;
        this.object = null;
        this.target = null;
        this.codes = this.map_code_name_to_code();
        this.lambdas = this.map_code_to_lambda();
        this.stack_order = this.map_stack_order();
    }

    map_code_name_to_code() {
        let result = {};
        result["DIRECT"] = cpus.DIRECT;
        result["READHIGH"] = cpus.READHIGH;
        result["READLOW"] = cpus.READLOW;
        result["WRITEHIGH"] = cpus.WRITEHIGH;
        result["WRITELOW"] = cpus.WRITELOW;
        result["WRITEWLOW"] = cpus.WRITEWLOW;
        result["READADHIGH"] = cpus.READADHIGH;
        result["READADLOW"] = cpus.READADLOW;
        result["READADWLOW"] = cpus.READADWLOW;
        result["TFRWTOOB"] = cpus.TFRWTOOB;
        result["TFRWTOTG"] = cpus.TFRWTOTG;
        result["TFROBTOTG"] = cpus.TFROBTOTG;
        result["TFRTGTOOB"] = cpus.TFRTGTOOB;
        result["BUSY"] = cpus.BUSY;
        result["ADDTGTOOB"] = cpus.ADDTGTOOB;
        result["READWLOW"] = cpus.READWLOW;
        result["READLOWCOMPARE"] = cpus.READLOWCOMPARE;
        result["READADLOWCOMPARE"] = cpus.READADLOWCOMPARE;
        result["COMPAREW"] = cpus.COMPAREW;
        result["INCOB"] = cpus.INCOB;
        result["DECOB"] = cpus.DECOB;
        result["INCW"] = cpus.INCW;
        result["DECW"] = cpus.DECW;
        result["PUSH"] = cpus.PUSH;
        result["PULL"] = cpus.PULL;
        result["PUSHPC"] = cpus.PUSHPC;
        result["PULLPC"] = cpus.PULLPC;
        result["ADDPCTOOB"] = cpus.ADDPCTOOB;
        result["ADDTGBTOOB"] = cpus.ADDTGBTOOB;
        result["SUBPCFROMOB"] = cpus.SUBPCFROMOB;
        result["SUBCPCFROMOB"] = cpus.SUBCPCFROMOB;
        result["SUBTGFROMOB"] = cpus.SUBTGFROMOB;
        result["SUBCTGFROMOB"] = cpus.SUBCTGFROMOB;
        result["SWAPWAD"] = cpus.SWAPWAD;
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
        result[cpus.WRITEWLOW] = this.write_w_low_byte_to_AD;
        result[cpus.READADHIGH] = this.read_next_high_data_byte_from_AD;
        result[cpus.READADLOW] = this.read_next_low_data_byte_from_AD;
        result[cpus.READADWLOW] = this.read_next_low_data_byte_to_W_from_AD;
        result[cpus.SWAPWAD] = this.swap_internal_registers;
        result[cpus.TFRWTOOB] = this.transfer_w_to_object;
        result[cpus.TFRWTOTG] = this.transfer_w_to_target;
        result[cpus.TFROBTOTG] = this.transfer_object_to_target;
        result[cpus.TFRTGTOOB] = this.transfer_target_to_object;
        result[cpus.BUSY] = this.busy_state;
        result[cpus.ADDTGTOOB] = this.add_target_to_object;
        result[cpus.ADDPCTOOB] = this.add_pc_to_object;
        result[cpus.ADDTGBTOOB] = this.add_target_byte_to_object;
        result[cpus.SUBPCFROMOB] = this.sub_pc_from_object;
        result[cpus.SUBCPCFROMOB] = this.sub_pc_with_carry_from_object;
        result[cpus.SUBTGFROMOB] = this.sub_target_value_from_object;
        result[cpus.SUBCTGFROMOB] = this.sub_target_value_with_carry_from_object;
        result[cpus.READLOWCOMPARE] = this.read_and_compare_low_byte;
        result[cpus.READADLOWCOMPARE] = this.read_ad_and_compare_low_byte;
        result[cpus.COMPAREW] = this.compare_w_with_word;
        result[cpus.INCOB] = this.inc_ob;
        result[cpus.DECOB] = this.dec_ob;
        result[cpus.INCW] = this.inc_w;
        result[cpus.DECW] = this.dec_w;
        result[cpus.PUSH] = this.push_reg_to_ad;
        result[cpus.PULL] = this.pull_reg_from_ad;
        result[cpus.PUSHPC] = this.push_pc_to_ad;
        result[cpus.PULLPC] = this.pull_pc_from_ad;
        return result;
    }

    map_stack_order = () => {
        let result = [];
        result[0x80] = "PC";
        result[0x40] = "US";
        result[0x20] = "Y";
        result[0x10] = "X";
        result[0x8] = "DP";
        result[0x4] = "B";
        result[0x2] = "A";
        result[0x1] = "CC";
        return result;
    }

    populate_code_stack(instruction_code) {
        this.code = [];
        for (let index=0;index<instruction_code.length;index++) {
            this.code.unshift(this.codes[instruction_code[index]]);
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

    swap_internal_registers = () => {
        const temp = this.W.fetch();
        this.W.set(this.AD.fetch());
        this.AD.set(temp);
    }

    add_target_to_object = () => {
        this.W.set(this.object.fetch() + this.target.fetch());
    }

    add_pc_to_object = () => {
        this.object.load(this.alu1.add8(this.object.fetch(), this.fetchNextByte()));
    }

    add_target_byte_to_object = () => {
        if (this.object.size === cpus.SHORT) {
            this.object.load(this.alu1.add8(this.object.fetch(), this.memory.read(this.target.fetch())));
        } else {
            this.object.load(this.alu1.add16(this.object.fetch(), this.target.fetch()));
        }
    }

    sub_pc_from_object = () => {
        this.object.load(this.alu1.sub8(this.object.fetch(), this.fetchNextByte()));
    }

    sub_pc_with_carry_from_object = () => {
        this.object.load(this.alu1.sub8(
            this.object.fetch(), this.fetchNextByte(), (this.CC.save() & cpus.CARRY) === cpus.CARRY?1:0
        ));
    }

    sub_target_value_from_object = () => {
        if (this.object.size === cpus.SHORT) {
            this.object.load(this.alu1.sub8(this.object.fetch(), this.memory.read(this.target.fetch())));
        } else {
            this.object.load(this.alu1.sub16(this.object.fetch(), this.target.fetch()));
        }
    }

    sub_target_value_with_carry_from_object = () => {
        this.object.load(this.alu1.sub8(
            this.object.fetch(),
            this.memory.read(this.target.fetch()),
            (this.CC.save() & cpus.CARRY) === cpus.CARRY?1:0
        ));
    }

    fetch_next_instruction_from_PC = () => {
        const next_byte = this.fetchNextByte();
        this.operation |= next_byte;
        const action = this.instructions[this.operation];
        if (typeof action === 'undefined') {
            throw "illegal instruction " + next_byte;
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

    transfer_object_to_target = () => {
        this.target.set(this.object.fetch());
    }

    transfer_target_to_object = () => {
        this.object.set(this.target.fetch());
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

    read_next_low_data_byte_to_W_from_AD = () => {
        this.W.set(this.W.fetch() | this.memory.read(this.AD.fetch()));
    }

    write_object_high_byte_to_AD = () => {
        let AD = this.AD.fetch();
        this.memory.write(AD++, (this.object.fetch() & 0xff00) >> 8);
        this.AD.set(AD);
    }

    write_object_low_byte_to_AD = () => {
        this.memory.write(this.AD.fetch(), this.object.save() & 0xff);
    }

    write_w_low_byte_to_AD = () => {
        this.memory.write(this.AD.fetch(), this.W.fetch() & 0xff);
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
        this.check_cc(n, w, o, temp, masked);
    }

    compare_w_with_word = () => {
        const n = this.W.fetch();
        this.complement(this.W, cpus.LONG);
        const w = this.W.fetch();
        const o = this.object.fetch();
        const temp = w + o;
        const masked = temp & 0xffff;
        this.check_cc(n, w, o, temp, masked);
    }

    inc_ob = () => {
        this.inc(this.object);
    }

    inc_w = () => {
        this.inc(this.W);
    }

    inc = (register) => {
        const o = register.fetch() & 0xff;
        const temp = o + 1
        register.set(temp & 0xff);
        const w = register.fetch();
        this.CC.zero(w === 0);
        this.CC.negative((w & 0x80) !== 0);
        this.CC.overflow(w !== temp);
    }

    dec_ob = () => {
        this.dec(this.object);
    }

    dec_w = () => {
        this.dec(this.W);
    }

    select_register = (stack_mask) => {
        let register = this.stack_order[stack_mask];
        if (register === "US") {
            if (this.object.name === "U") {
                register = "S";
            } else {
                register = "U";
            }
        }
        return register;
    }

    push_reg_to_ad = () => {
        let mask = 0x80;
        let loop = true;
        let w = this.W.fetch();
        while (loop) {
            if ((mask & w) === mask) {
                this.W.set(w -= mask);
                if (w !== 0) {
                    this.code.push(this.codes["PUSH"]);
                }
                const register = this.select_register(mask);
                let address = this.target.fetch();
                const next_entry = this.registers.get(register);
                const low_value = next_entry.fetch() & 0xff;
                this.memory.write(address--, low_value);
                if (next_entry.size === cpus.LONG) {
                    this.code.unshift(this.codes["BUSY"]);
                    const high_value = (next_entry.fetch() & 0xff00) >> 8;
                    this.memory.write(address--, high_value);
                }
                this.target.set(address);
                loop = false;
            } else {
                mask = mask >> 1;
                loop = mask >= 1;
            }
        }
    }

    pull_reg_from_ad = () => {
        let mask = 0x01;
        let loop = true;
        let w = this.W.fetch();
        while (loop) {
            if ((mask & w) === mask) {
                this.W.set(w -= mask);
                if (w !== 0) {
                    this.code.push(this.codes["PULL"]);
                }
                const register = this.select_register(mask);
                let address = this.target.fetch();
                const next_entry = this.registers.get(register);
                let pulled_value = 0;
                if (next_entry.size === cpus.LONG) {
                    this.code.unshift(this.codes["BUSY"]);
                    pulled_value += this.memory.read(address++) << 8;
                }
                pulled_value += this.memory.read(address++);
                next_entry.set(pulled_value);
                this.target.set(address);
                loop = false;
            } else {
                mask = mask << 1;
                loop = mask <= 0x100;
            }
        }
    }

    push_pc_to_ad = () => {
        let address = this.registers.get("S").fetch();
        const value = this.PC.fetch();
        const low_value = (value & 0xff00) >> 8;
        this.memory.write(address--, low_value);
        const high_value = value & 0xff;
        this.memory.write(address--, high_value);
        this.registers.get("S").set(address);
    }

    pull_pc_from_ad = () => {
        let address = this.registers.get("S").fetch();
        const low_value = this.memory.read(++address);
        const high_value = this.memory.read(++address) << 8;
        this.PC.set(high_value | low_value);
        this.registers.get("S").set(address);
    }

    dec = (register) => {
        const o = register.fetch() & 0xff;
        const temp = o - 1;
        register.set(temp);
        const w = register.fetch();
        this.CC.zero(w === 0);
        this.CC.negative((w & 0x80) !== 0);
        this.CC.overflow(w !== temp);
    }

    check_cc = (initial, complement, object, sum, masked) => {
        this.CC.zero(masked === 0);
        this.CC.negative((masked & 0x80) !== 0);
        this.CC.overflow(sum !== masked);
        this.CC.carry(initial < object);
    }

    complement = (register, scale) => {
        let value = register.fetch();
        if (scale === cpus.SHORT) {
            value = value & 0xff;
            value = this.xor(value, scale);
            value += 1;
        } else {
            value = value & 0xffff
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
