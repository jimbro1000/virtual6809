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
define("READADHIGH", 9); // read high byte to AD
define("READADLOW", 10); // read low byte to AD
define("ADDTGTOOB", 11); // add b to object, result in W
define("BUSY", 12); // busy doing nothing
define("READWLOW", 13); // read low byte to W
define("READLOWCOMPARE", 14); // read low byte to W and compare with object
define("READADLOWCOMPARE", 15); // read byte from AD to w and compare with object
define("COMPAREW", 16); // compare W against object
define("READADWLOW", 17); // read low byte to W from AD
define("INCOB", 18); //increment object and place result in w
define("DECOB", 19);
define("INCW", 20);
define("DECW", 21);
define("WRITEWLOW", 22);