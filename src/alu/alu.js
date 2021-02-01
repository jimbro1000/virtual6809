const cpus = require("../../src/cpu/cpu_constants");

class alu {
    constructor(control_register) {
        this.cc = control_register;
    }

    add8 = (reg1, reg2, c) => {
        if (c === undefined) { c = 0; }
        const result = (reg1 + reg2 + c);
        const masked = result & 0xff;
        const half = (reg1 & 0xf) + (reg2 & 0xf) + c;
        const sign_mask = (reg1 ^ reg2) ^ 0x80;
        this.cc.negative(result & 0x80 > 0);
        this.cc.carry(result !== masked);
        this.cc.zero(masked === 0);
        this.cc.halfcarry(half > 0xf);
        this.cc.overflow((sign_mask & (reg2 ^ masked)) & 0x80);
        return masked;
    }

    add16 = (reg1, reg2) => {
        const result = (reg1 + reg2);
        const masked = result & 0xffff;
        const sign_mask = (reg1 ^ reg2) ^ 0x8000;
        this.cc.negative(result & 0x8000 > 0);
        this.cc.carry(result !== masked);
        this.cc.zero(masked === 0);
        this.cc.overflow((sign_mask & (reg2 ^ masked)) & 0x8000);
        return masked;
    }
}

module.exports = { alu }