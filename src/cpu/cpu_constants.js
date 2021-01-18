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
define("NEXT", 1);
define("DATA", 2);
define("HIGHDATA", 3);
define("LOWDATA", 4);
