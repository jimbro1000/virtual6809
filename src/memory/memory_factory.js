const {manager} = require("../../src/memory/memory_manager");
const {chip} = require("../../src/memory/memory_chip");
const chips = require("../../src/memory/memory_constants.js");

let factory = (model) => {
    let memory_def = [];
    if (model === "D64") {
        memory_def = [
            [new chip(chips.RAM, chips.K32), 0x0],
            [new chip(chips.ROM, chips.K16), 0x8000],
            [new chip(chips.MAPPED, chips.K8), 0xc000]
        ];
    }
    else if (model === "D4") {
        memory_def = [
            [new chip(chips.RAM, chips.K4), 0x0]
        ];
    }
    return new manager(memory_def);
}

module.exports = { factory }