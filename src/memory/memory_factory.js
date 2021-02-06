const {manager} = require("../../src/memory/memory_manager");
const {chip} = require("../../src/memory/memory_chip");
const chips = require("../../src/memory/memory_constants.js");

let models = {
    "D64": [
        { type: chips.MAPPED, size: chips.B256, base: 0xff00 },
        { type: chips.RAM, size: chips.K32, base: 0x0000 },
        { type: chips.ROM, size: chips.K32, base: 0x8000 }
    ],
    "D4": [
        { type: chips.MAPPED, size: chips.B256, base: 0xff00 },
        { type: chips.RAM, size: chips.K4, base: 0x0000 }
    ],
    "MAX": [
        { type: chips.MAPPED, size: chips.B256, base: 0xff00 },
        { type: chips.RAM, size: chips.M1, base: 0x0000 },
        { type: chips.RAM, size: chips.M1, base: 0x100000 }
    ]
}

let factory = (model) => {
    const definition = models[model];
    let memory_def = [];
    if (definition !== undefined) {
        for (let index=0; index<definition.length; ++index)
            memory_def.push( transform(definition[index].type, definition[index].size, definition[index].base));
        return new manager(memory_def);
    } else {
        throw new Error("Invalid memory model");
    }
}

transform = (type, size, base) => {
    return [new chip(type, size), base];
}

module.exports = { factory }