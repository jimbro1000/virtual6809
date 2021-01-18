instructions = {
    0x0e: {
        "operation": "JMP",
        "group": "JMP",
        "mode": "direct",
        "scale": 1
    },
    0x10: {
        "operation": "extended instruction",
        "mode": "fetch"
    },
    0x109f: {
        "operation": "STY",
        "group": "ST",
        "mode": "direct",
        "scale": 1,
        "object": "Y"
    },
    0x10be: {
        "operation": "LDY",
        "group": "LD",
        "mode": "immediate",
        "scale": 2,
        "object": "Y"
    },
    0x10bf: {
        "operation": "STY",
        "group": "ST",
        "mode": "extended",
        "scale": 2,
        "object": "Y"
    },
    0x10ce: {
        "operation": "LDS",
        "group": "LD",
        "mode": "immediate",
        "scale": 2,
        "object": "S"
    },
    0x10df: {
        "operation": "STS",
        "group": "ST",
        "mode": "direct",
        "scale": 1,
        "object": "S"
    },
    0x10ff: {
        "operation": "STS",
        "group": "ST",
        "mode": "extended",
        "scale": 2,
        "object": "S"
    },
    0x12: {
        "operation": "NOP"
    },
    0x7e: {
        "operation": "JMP",
        "group": "JMP",
        "mode": "extended",
        "scale": 2
    },
    0x86: {
        "operation": "LDA",
        "group": "LD",
        "mode": "immediate",
        "scale": 1,
        "object": "A"
    },
    0x97: {
        "operation": "STA",
        "group": "ST",
        "mode": "direct",
        "scale": 1,
        "object": "A"
    },
    0x9f: {
        "operation": "STX",
        "group": "ST",
        "mode": "direct",
        "scale": 1,
        "object": "X"
    },
    0xb7: {
        "operation": "STA",
        "group": "ST",
        "mode": "extended",
        "scale": 2,
        "object": "A"
    },
    0xbe: {
        "operation": "LDX",
        "group": "LD",
        "mode": "immediate",
        "scale": 2,
        "object": "X"
    },
    0xbf: {
        "operation": "STX",
        "group": "ST",
        "mode": "extended",
        "scale": 2,
        "object": "X"
    },
    0xc6: {
        "operation": "LDB",
        "group": "LD",
        "mode": "immediate",
        "scale": 1,
        "object": "B"
    },
    0xcc : {
        "operation": "LDD",
        "group": "LD",
        "mode": "immediate",
        "scale": 2,
        "object": "D"
    },
    0xce: {
        "operation": "LDU",
        "group": "LD",
        "mode": "immediate",
        "scale": 2,
        "object": "U"
    },
    0xd7: {
        "operation": "STB",
        "group": "ST",
        "mode": "direct",
        "scale": 1,
        "object": "B"
    },
    0xdd: {
        "operation": "STD",
        "group": "ST",
        "mode": "direct",
        "scale": 1,
        "object": "D"
    },
    0xdf: {
        "operation": "STU",
        "group": "ST",
        "mode": "direct",
        "scale": 1,
        "object": "U"
    },
    0xf7: {
        "operation": "STB",
        "group": "ST",
        "mode": "extended",
        "scale": 2,
        "object": "B"
    },
    0xfd: {
        "operation": "STD",
        "group": "ST",
        "mode": "extended",
        "scale": 2,
        "object": "D"
    },
    0xff: {
        "operation": "STU",
        "group": "ST",
        "mode": "extended",
        "scale": 2,
        "object": "U"
    }
};

module.exports = { instructions }
