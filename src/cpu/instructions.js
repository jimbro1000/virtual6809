instructions = {
    0x0e: {
        "operation": "JMP",
        "mode": "direct",
        "object": "PC",
        "code": [
            "DIRECT", "TFRWTOOB"
        ]
    },
    0x10: {
        "operation": "extended instruction",
        "mode": "fetch"
    },
    0x108c: {
        "operation": "CMPY",
        "mode": "immediate",
        "object": "Y",
        "code": [
            "READHIGH", "READWLOW", "COMPAREW"
        ]
    },
    0x109c: {
        "operation": "CMPY",
        "mode": "direct",
        "object": "Y",
        "target": "AD",
        "code": [
            "DIRECT", "TFRWTOTG", "READADHIGH", "READADWLOW", "COMPAREW"
        ]
    },
    0x109e: {
        "operation": "LDY",
        "mode": "direct",
        "object": "Y",
        "target": "AD",
        "code": [
            "DIRECT", "TFRWTOTG", "READADHIGH", "READADLOW"
        ]
    },
    0x109f: {
        "operation": "STY",
        "mode": "direct",
        "object": "Y",
        "target": "AD",
        "code": [
            "DIRECT", "TFRWTOTG", "WRITEHIGH", "WRITELOW"
        ]
    },
    0x10bc: {
        "operation": "CMPY",
        "mode": "extended",
        "object": "Y",
        "target": "AD",
        "code": [
            "READHIGH", "READWLOW", "TFRWTOTG", "READADHIGH", "READADWLOW", "COMPAREW"
        ]
    },
    0x10be: {
        "operation": "LDY",
        "mode": "immediate",
        "object": "Y",
        "code": [
            "READHIGH", "READLOW"
        ]
    },
    0x10bf: {
        "operation": "STY",
        "mode": "extended",
        "object": "Y",
        "target": "AD",
        "code": [
            "READHIGH", "READWLOW", "TFRWTOTG", "WRITEHIGH", "WRITELOW"
        ]
    },
    0x10ce: {
        "operation": "LDS",
        "mode": "immediate",
        "object": "S",
        "code": [
            "READHIGH", "READLOW"
        ]
    },
    0x10de: {
        "operation": "LDS",
        "mode": "direct",
        "object": "S",
        "target": "AD",
        "code": [
            "DIRECT", "TFRWTOTG", "READADHIGH", "READADLOW"
        ]
    },
    0x10df: {
        "operation": "STS",
        "mode": "direct",
        "object": "S",
        "target": "AD",
        "code": [
            "DIRECT", "TFRWTOTG", "WRITEHIGH", "WRITELOW"
        ]
    },
    0x10ff: {
        "operation": "STS",
        "mode": "extended",
        "object": "S",
        "target": "AD",
        "code": [
            "READHIGH", "READWLOW", "TFRWTOTG", "WRITEHIGH", "WRITELOW"
        ]
    },
    0x11: {
        "operation": "extended instruction",
        "mode": "fetch"
    },
    0x1183: {
        "operation": "CMPU",
        "mode": "immediate",
        "object": "U",
        "code": [
            "READHIGH", "READWLOW", "COMPAREW"
        ]
    },
    0x118c: {
        "operation": "CMPS",
        "mode": "immediate",
        "object": "S",
        "code": [
            "READHIGH", "READWLOW", "COMPAREW"
        ]
    },
    0x1193: {
        "operation": "CMPU",
        "mode": "direct",
        "object": "U",
        "target": "AD",
        "code": [
            "DIRECT", "TFRWTOTG", "READADHIGH", "READADWLOW", "COMPAREW"
        ]
    },
    0x119c: {
        "operation": "CMPS",
        "mode": "direct",
        "object": "S",
        "target": "AD",
        "code": [
            "DIRECT", "TFRWTOTG", "READADHIGH", "READADWLOW", "COMPAREW"
        ]
    },
    0x11b3: {
        "operation": "CMPU",
        "mode": "extended",
        "object": "U",
        "target": "AD",
        "code": [
            "READHIGH", "READWLOW", "TFRWTOTG", "READADHIGH", "READADWLOW", "COMPAREW"
        ]
    },
    0x11bc: {
        "operation": "CMPS",
        "mode": "extended",
        "object": "S",
        "target": "AD",
        "code": [
            "READHIGH", "READWLOW", "TFRWTOTG", "READADHIGH", "READADWLOW", "COMPAREW"
        ]
    },
    0x12: {
        "operation": "NOP",
        "code": [
            "BUSY"
        ]
    },
    0x34: {
        "operation": "PSHS",
        "object": "S",
        "target": "AD",
        "code": [
            "READWLOW", "TFROBTOTG", "PUSH", "TFRTGTOOB", "BUSY"
        ]
    },
    0x36: {
        "operation": "PSHU",
        "object": "U",
        "target": "AD",
        "code": [
            "READWLOW", "TFROBTOTG", "PUSH", "TFRTGTOOB", "BUSY"
        ]
    },
    0x3a: {
        "operation": "ABX",
        "object": "X",
        "target": "B",
        "code": [
            "ADDTGTOOB", "TFRWTOOB"
        ]
    },
    0x4a: {
        "operation": "DECA",
        "object": "A",
        "code": [
            "DECOB"
        ]
    },
    0x4c: {
        "operation": "INCA",
        "object": "A",
        "code": [
            "INCOB"
        ]
    },
    0x5a: {
        "operation": "DECB",
        "object": "B",
        "code": [
            "DECOB"
        ]
    },
    0x5c: {
        "operation": "INCB",
        "object": "B",
        "code": [
            "INCOB"
        ]
    },
    0x7a: {
        "operation": "DEC",
        "mode": "extended",
        "object": "AD",
        "code": [
            "READHIGH", "READLOW", "READADWLOW", "DECW", "WRITEWLOW"
        ]
    },
    0x7c: {
        "operation": "INC",
        "mode": "extended",
        "object": "AD",
        "code": [
            "READHIGH", "READLOW", "READADWLOW", "INCW", "WRITEWLOW"
        ]
    },
    0x7e: {
        "operation": "JMP",
        "mode": "extended",
        "object": "PC",
        "code": [
            "READHIGH", "READLOW", "TFRWTOOB"
        ]
    },
    0x81: {
        "operation": "CMPA",
        "mode": "immediate",
        "object": "A",
        "code": [
            "READLOWCOMPARE"
        ]
    },
    0x86: {
        "operation": "LDA",
        "mode": "immediate",
        "object": "A",
        "code": [
            "READLOW"
        ]
    },
    0x8c: {
        "operation": "CMPX",
        "mode": "immediate",
        "object": "X",
        "code": [
            "READHIGH", "READWLOW", "COMPAREW"
        ]
    },
    0x91: {
        "operation": "CMPA",
        "mode": "direct",
        "object": "A",
        "target": "AD",
        "code": [
            "DIRECT", "TFRWTOTG", "READADLOWCOMPARE"
        ]
    },
    0x96: {
        "operation": "LDA",
        "mode": "direct",
        "object": "A",
        "target": "AD",
        "code": [
            "DIRECT", "TFRWTOTG", "READADLOW"
        ]
    },
    0x97: {
        "operation": "STA",
        "mode": "direct",
        "object": "A",
        "target": "AD",
        "code": [
            "DIRECT", "TFRWTOTG", "WRITELOW"
        ]
    },
    0x9c: {
        "operation": "CMPX",
        "mode": "direct",
        "object": "X",
        "target": "AD",
        "code": [
            "DIRECT", "TFRWTOTG", "READADHIGH", "READADWLOW", "COMPAREW"
        ]
    },
    0x9e: {
        "operation": "LDX",
        "mode": "direct",
        "object": "X",
        "target": "AD",
        "code": [
            "DIRECT", "TFRWTOTG", "READADHIGH", "READADLOW"
        ]
    },
    0x9f: {
        "operation": "STX",
        "mode": "direct",
        "object": "X",
        "target": "AD",
        "code": [
            "DIRECT", "TFRWTOTG", "WRITEHIGH", "WRITELOW"
        ]
    },
    0xb1: {
        "operation": "CMPA",
        "mode": "extended",
        "object": "A",
        "target": "AD",
        "code": [
            "READHIGH", "READWLOW", "TFRWTOTG", "READADLOWCOMPARE"
        ]
    },
    0xb6: {
        "operation": "LDA",
        "mode": "extended",
        "object": "A",
        "target": "AD",
        "code": [
            "READHIGH", "READWLOW", "TFRWTOTG", "READADLOW"
        ]
    },
    0xb7: {
        "operation": "STA",
        "mode": "extended",
        "object": "A",
        "target": "AD",
        "code": [
            "READHIGH", "READWLOW", "TFRWTOTG", "WRITELOW"
        ]
    },
    0xbc: {
        "operation": "CMPX",
        "mode": "extended",
        "object": "X",
        "target": "AD",
        "code": [
            "READHIGH", "READWLOW", "TFRWTOTG", "READADHIGH", "READADWLOW", "COMPAREW"
        ]
    },
    0xbe: {
        "operation": "LDX",
        "mode": "immediate",
        "object": "X",
        "code": [
            "READHIGH", "READLOW"
        ]
    },
    0xbf: {
        "operation": "STX",
        "mode": "extended",
        "object": "X",
        "target": "AD",
        "code": [
            "READHIGH", "READWLOW", "TFRWTOTG", "WRITEHIGH", "WRITELOW"
        ]
    },
    0xc1: {
        "operation": "CMPB",
        "mode": "immediate",
        "object": "B",
        "code": [
            "READLOWCOMPARE"
        ]
    },
    0xc6: {
        "operation": "LDB",
        "mode": "immediate",
        "object": "B",
        "code": [
            "READLOW"
        ]
    },
    0xcc: {
        "operation": "LDD",
        "mode": "immediate",
        "object": "D",
        "code": [
            "READHIGH", "READLOW"
        ]
    },
    0xce: {
        "operation": "LDU",
        "mode": "immediate",
        "object": "U",
        "code": [
            "READHIGH", "READLOW"
        ]
    },
    0xd1: {
        "operation": "CMPB",
        "mode": "direct",
        "object": "B",
        "target": "AD",
        "code": [
            "DIRECT", "TFRWTOTG", "READADLOWCOMPARE"
        ]
    },
    0xd6: {
        "operation": "LDB",
        "mode": "direct",
        "object": "B",
        "target": "AD",
        "code": [
            "DIRECT", "TFRWTOTG", "READADLOW"
        ]
    },
    0xd7: {
        "operation": "STB",
        "mode": "direct",
        "object": "B",
        "target": "AD",
        "code": [
            "DIRECT", "TFRWTOTG", "WRITELOW"
        ]
    },
    0xdd: {
        "operation": "STD",
        "mode": "direct",
        "object": "D",
        "target": "AD",
        "code": [
            "DIRECT", "TFRWTOTG", "WRITEHIGH", "WRITELOW"
        ]
    },
    0xde: {
        "operation": "LDU",
        "mode": "direct",
        "object": "U",
        "target": "AD",
        "code": [
            "DIRECT", "TFRWTOTG", "READADHIGH", "READADLOW"
        ]
    },
    0xdf: {
        "operation": "STU",
        "mode": "direct",
        "object": "U",
        "target": "AD",
        "code": [
            "DIRECT", "TFRWTOTG", "WRITEHIGH", "WRITELOW"
        ]
    },
    0xf1: {
        "operation": "CMPB",
        "mode": "extended",
        "object": "B",
        "target": "AD",
        "code": [
            "READHIGH", "READWLOW", "TFRWTOTG", "READADLOWCOMPARE"
        ]
    },
    0xf6: {
        "operation": "LDB",
        "mode": "extended",
        "object": "B",
        "target": "AD",
        "code": [
            "READHIGH", "READWLOW", "TFRWTOTG", "READADLOW"
        ]
    },
    0xf7: {
        "operation": "STB",
        "mode": "extended",
        "object": "B",
        "target": "AD",
        "code": [
            "READHIGH", "READWLOW", "TFRWTOTG", "WRITELOW"
        ]
    },
    0xfd: {
        "operation": "STD",
        "mode": "extended",
        "object": "D",
        "target": "AD",
        "code": [
            "READHIGH", "READLOW", "TFRWTOTG", "WRITEHIGH", "WRITELOW"
        ]
    },
    0xff: {
        "operation": "STU",
        "mode": "extended",
        "object": "U",
        "target": "AD",
        "code": [
            "READHIGH", "READWLOW", "TFRWTOTG", "WRITEHIGH", "WRITELOW"
        ]
    }
};

module.exports = {instructions}
