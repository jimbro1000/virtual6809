instructions = {
    0x0e: {
        "operation": "JMP",
        "group": "JMP",
        "mode": "direct",
        "scale": 1,
        "object": "PC",
        "code": [
            "DIRECT",
            "TFRWTOOB"
        ]
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
        "object": "Y",
        "target": "AD",
        "code": [
            "DIRECT",
            "TFRWTOTG",
            "WRITEHIGH",
            "WRITELOW"
        ]
    },
    0x10be: {
        "operation": "LDY",
        "group": "LD",
        "mode": "immediate",
        "scale": 2,
        "object": "Y",
        "code": [
            "READHIGH",
            "READLOW"
        ]
    },
    0x10bf: {
        "operation": "STY",
        "group": "ST",
        "mode": "extended",
        "scale": 2,
        "object": "Y",
        "target": "AD",
        "code": [
            "READADDHIGH",
            "READADDLOW",
            "TFRWTOTG",
            "WRITEHIGH",
            "WRITELOW"
        ]
    },
    0x10ce: {
        "operation": "LDS",
        "group": "LD",
        "mode": "immediate",
        "scale": 2,
        "object": "S",
        "code": [
            "READHIGH",
            "READLOW"
        ]
    },
    0x10df: {
        "operation": "STS",
        "group": "ST",
        "mode": "direct",
        "scale": 1,
        "object": "S",
        "target": "AD",
        "code": [
            "DIRECT",
            "TFRWTOTG",
            "WRITEHIGH",
            "WRITELOW"
        ]
    },
    0x10ff: {
        "operation": "STS",
        "group": "ST",
        "mode": "extended",
        "scale": 2,
        "object": "S",
        "target": "AD",
        "code": [
            "READADDHIGH",
            "READADDLOW",
            "TFRWTOTG",
            "WRITEHIGH",
            "WRITELOW"
        ]
    },
    0x12: {
        "operation": "NOP",
        "code": [
            "BUSY"
        ]
    },
    0x3a: {
        "operation": "ABX",
        "object": "X",
        "target": "B",
        "code": [
            "ADDTGTOOB",
            "TFRWTOOB"
        ]
    },
    0x7e: {
        "operation": "JMP",
        "group": "JMP",
        "mode": "extended",
        "scale": 2,
        "object": "PC",
        "code": [
            "READADDHIGH",
            "READADDLOW",
            "TFRWTOOB"
        ]
    },
    0x86: {
        "operation": "LDA",
        "group": "LD",
        "mode": "immediate",
        "scale": 1,
        "object": "A",
        "code": [
            "READLOW"
        ]
    },
    0x97: {
        "operation": "STA",
        "group": "ST",
        "mode": "direct",
        "scale": 1,
        "object": "A",
        "target": "AD",
        "code": [
            "DIRECT",
            "TFRWTOTG",
            "WRITELOW"
        ]
    },
    0x9f: {
        "operation": "STX",
        "group": "ST",
        "mode": "direct",
        "scale": 1,
        "object": "X",
        "target": "AD",
        "code": [
            "DIRECT",
            "TFRWTOTG",
            "WRITEHIGH",
            "WRITELOW"
        ]
    },
    0xb7: {
        "operation": "STA",
        "group": "ST",
        "mode": "extended",
        "scale": 2,
        "object": "A",
        "target": "AD",
        "code": [
            "READADDHIGH",
            "READADDLOW",
            "TFRWTOTG",
            "WRITELOW"
        ]
    },
    0xbe: {
        "operation": "LDX",
        "group": "LD",
        "mode": "immediate",
        "scale": 2,
        "object": "X",
        "code": [
            "READHIGH",
            "READLOW"
        ]
    },
    0xbf: {
        "operation": "STX",
        "group": "ST",
        "mode": "extended",
        "scale": 2,
        "object": "X",
        "target": "AD",
        "code": [
            "READADDHIGH",
            "READADDLOW",
            "TFRWTOTG",
            "WRITEHIGH",
            "WRITELOW"
        ]
    },
    0xc6: {
        "operation": "LDB",
        "group": "LD",
        "mode": "immediate",
        "scale": 1,
        "object": "B",
        "code": [
            "READLOW"
        ]
    },
    0xcc : {
        "operation": "LDD",
        "group": "LD",
        "mode": "immediate",
        "scale": 2,
        "object": "D",
        "code": [
            "READHIGH",
            "READLOW"
        ]
    },
    0xce: {
        "operation": "LDU",
        "group": "LD",
        "mode": "immediate",
        "scale": 2,
        "object": "U",
        "code": [
            "READHIGH",
            "READLOW"
        ]
    },
    0xd7: {
        "operation": "STB",
        "group": "ST",
        "mode": "direct",
        "scale": 1,
        "object": "B",
        "target": "AD",
        "code": [
            "DIRECT",
            "TFRWTOTG",
            "WRITELOW"
        ]
    },
    0xdd: {
        "operation": "STD",
        "group": "ST",
        "mode": "direct",
        "scale": 1,
        "object": "D",
        "target": "AD",
        "code": [
            "DIRECT",
            "TFRWTOTG",
            "WRITEHIGH",
            "WRITELOW"
        ]
    },
    0xdf: {
        "operation": "STU",
        "group": "ST",
        "mode": "direct",
        "scale": 1,
        "object": "U",
        "target": "AD",
        "code": [
            "DIRECT",
            "TFRWTOTG",
            "WRITEHIGH",
            "WRITELOW"
        ]
    },
    0xf7: {
        "operation": "STB",
        "group": "ST",
        "mode": "extended",
        "scale": 2,
        "object": "B",
        "target": "AD",
        "code": [
            "READADDHIGH",
            "READADDLOW",
            "TFRWTOTG",
            "WRITELOW"
        ]
    },
    0xfd: {
        "operation": "STD",
        "group": "ST",
        "mode": "extended",
        "scale": 2,
        "object": "D",
        "target": "AD",
        "code": [
            "READADDHIGH",
            "READADDLOW",
            "TFRWTOTG",
            "WRITEHIGH",
            "WRITELOW"
        ]
    },
    0xff: {
        "operation": "STU",
        "group": "ST",
        "mode": "extended",
        "scale": 2,
        "object": "U",
        "target": "AD",
        "code": [
            "READADDHIGH",
            "READADDLOW",
            "TFRWTOTG",
            "WRITEHIGH",
            "WRITELOW"
        ]
    }
};

module.exports = { instructions }
