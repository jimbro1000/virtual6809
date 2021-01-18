const Manager = require("../../src/memory/memory_manager");
const Chip = require("../../src/memory/memory_chip");
const chips = require("../../src/memory/memory_constants.js");

let factory = (model) => {
    let manager;
    if (model === "D64") {
        manager = new Manager.manager([
            [new Chip.chip(chips.RAM, chips.K32), 0x0],
            [new Chip.chip(chips.ROM, chips.K16), 0x8000],
            [new Chip.chip(chips.MAPPED, chips.K8), 0xc000]
        ]);
    }
    if (model === "D4") {
        manager = new Manager.manager([new Chip.chip(chips.RAM, chips.K4), 0x0]);
    }
    return manager;
}

module.exports = { factory }