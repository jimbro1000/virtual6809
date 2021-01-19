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
// instruction mode
define("LITERAL", 0);
// cpu state
define("NEXT", 0); // get new instruction
define("FETCH", 1); // get next byte of instruction
define("ABX", 2); // read data byte
define("HIGHDATA", 3); // read data high byte
define("LOWDATA", 4); // read data low byte
define("HIGHADDRESS", 5); // read address high byte
define("LOWADDRESS", 6); // read address low byte
define("DIRECT", 7); // generate direct page address
define("WRITEHIGH", 8); // write data high byte
define("WRITELOW", 9); // write data low byte
define("BUSY", 10);