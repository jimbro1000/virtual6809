const chips = require("./memory_constants");

class chip {
    constructor(chip_type, chip_size) {
        if (chip_type === chips.RAM) {
            this.readable = true;
            this.writeable = true;
            this.hardmapped = false;
        } else if (chip_type === chips.ROM) {
            this.readable = true;
            this.writeable = false;
            this.hardmapped = false;
        } else if (chip_type === chips.MAPPED) {
            this.readable = false;
            this.writeable = true;
            this.hardmapped = true;
        }
        this.size = chip_size;
        this.base = 0;
        this.memory = [];
        for (let i=0; i<this.size; ++i) {
            this.memory[i] = 0;
        }
    }

    setBase = (address) => {
        this.base = address;
    }

    getSize = () => {
        return this.size;
    }

    setMemory = (address, byte) => {
        if (this.writeable) {
            const value = byte & 0xff;
            const effective_address = address - this.base;
            if (effective_address < 0 || effective_address >= this.size) {
                throw new EvalError("address out of range");
            }
            this.memory[effective_address] = value;
        }
    }

    getMemory = (address) => {
        if (this.readable) {
            const effective_address = address - this.base;
            if (effective_address < 0 || effective_address >= this.size) {
                throw new EvalError("address out of range");
            }
            return this.memory[effective_address];
        }
    }

    getReadable = () => {
        return this.readable;
    }

    getWriteable = () => {
        return this.writeable;
    }

    getMapped = () => {
        return this.hardmapped;
    }
}

module.exports = { chip }
