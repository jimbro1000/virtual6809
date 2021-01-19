const define = require("node-constants")(exports);
// register scale
define("SHORT", 8);
define("LONG", 16);
// condition register flags
define("CARRY", 0x1)
define("OVERFLOW", 0x2);
define("ZERO", 0x4);
define("NEGATIVE", 0x8);
define("IRQ", 0x10);
define("HALFCARRY", 0x20);
define("FIRQ", 0x40);
define("ENTIRE", 0x80);
//cpu micro instructions
define("NEXT", 0); // get new instruction
define("FETCH", 1); // get next byte of instruction
define("DIRECT", 2); // generate direct page address
define("TFRWTOOB", 3); // transfer W to object
define("TFRWTOTG", 4); // transfer W to target
define("WRITEHIGH", 5); // write data high byte
define("WRITELOW", 6); // write data low byte
define("READHIGH", 7); // read high byte to object
define("READLOW", 8); // read low byte to object
define("READADDHIGH", 9); // read high byte to W
define("READADDLOW", 10); // read low byte to W
define("ADDTGTOOB", 11); // add b to object, result in W
define("BUSY", 12); // busy doing nothing
