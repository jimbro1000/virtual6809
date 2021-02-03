class manager {
    constructor(memory_definition) {
        this.address_map = [];
        this.hardware = [];
        memory_definition.forEach(item => {
            const chip = item[0];
            const base = item[1];
            this.hardware.push(chip);
            chip.setBase(base);
            const size = chip.getSize();
            for(let index=0;index<size;++index) {
                const address = base + index;
                if (this.address_map[address] === undefined) {
                    this.address_map[address] = chip;
                }
            }
        });
    }

    read = (address) => {
        if (this.address_map[address] !== undefined) {
            return this.address_map[address].getMemory(address);
        } else {
            return 0;
        }
    }

    write = (address, byte) => {
        if (this.address_map[address] !== undefined) {
            this.address_map[address].setMemory(address,byte);
        }
    }

    burn = (address, byte) => {
        if (this.address_map[address] !== undefined) {
            this.address_map[address].burnMemory(address,byte);
        }
    }
}

module.exports = { manager }