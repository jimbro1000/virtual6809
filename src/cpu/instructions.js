instructions = {
    0x10: {
        "operation": "extended instruction",
        "mode": "fetch"
    },
    0x10be: {
        "operation": "LDY",
        "group": "LD",
        "mode": "immediate",
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
    0x86: {
        "operation": "LDA",
        "group": "LD",
        "mode": "immediate",
        "scale": 1,
        "object": "A"
    },
    0xbe: {
        "operation": "LDX",
        "group": "LD",
        "mode": "immediate",
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
    }
};

module.exports = instructions;