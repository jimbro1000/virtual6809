const cpus = require('../../src/cpu/cpu_constants');

instructions = {
  0x00: {
    'operation': 'NEG',
    'mode': 'direct',
    'object': 'W',
    'code': [
      'DIRECT', 'SWAPWAD', 'READWLOW', 'NEGATE', 'WRITEWLOW',
    ],
  },
  0x03: {
    'operation': 'COM',
    'mode': 'direct',
    'object': 'W',
    'code': [
      'DIRECT', 'SWAPWAD', 'READWLOW', 'COMPLEMENT', 'WRITEWLOW',
    ],
  },
  0x06: {
    'operation': 'ROR',
    'mode': 'direct',
    'object': 'W',
    'code': [
      'DIRECT', 'SWAPWAD', 'READWLOW', 'ROTATERIGHT', 'WRITEWLOW',
    ],
  },
  0x07: {
    'operation': 'ASR',
    'mode': 'direct',
    'object': 'W',
    'code': [
      'DIRECT', 'SWAPWAD', 'READWLOW', 'SHIFTRIGHT', 'WRITEWLOW',
    ],
  },
  0x08: {
    'operation': 'ASL',
    'mode': 'direct',
    'object': 'W',
    'code': [
      'DIRECT', 'SWAPWAD', 'READWLOW', 'SHIFTLEFT', 'WRITEWLOW',
    ],
  },
  0x09: {
    'operation': 'ROL',
    'mode': 'direct',
    'object': 'W',
    'code': [
      'DIRECT', 'SWAPWAD', 'READWLOW', 'ROTATELEFT', 'WRITEWLOW',
    ],
  },
  0x0d: {
    'operation': 'TST',
    'object': 'W',
    'target': 'AD',
    'code': [
      'DIRECT', 'SWAPWAD', 'READWLOW', 'TESTOB', 'BUSY',
    ],
  },
  0x0e: {
    'operation': 'JMP',
    'mode': 'direct',
    'object': 'PC',
    'code': [
      'DIRECT', 'TFRWTOOB',
    ],
  },
  0x10: {
    'operation': 'extended instruction',
    'mode': 'fetch',
  },
  0x1021: {
    'operation': 'LBRN',
    'mode': 'relative',
    'object': 'PC',
    'target': 'W',
    'condition': 'never',
    'code': [
      'READHIGH', 'READWLOW', 'ADDTGSWTOOBIF',
    ],
  },
  0x1022: {
    'operation': 'LBHI',
    'object': 'PC',
    'target': 'W',
    'condition': 'higher',
    'code': [
      'READHIGH', 'READWLOW', 'ADDTGSWTOOBIF',
    ],
  },
  0x1023: {
    'operation': 'LBLS',
    'object': 'PC',
    'target': 'W',
    'condition': 'lowerorsame',
    'code': [
      'READHIGH', 'READWLOW', 'ADDTGSWTOOBIF',
    ],
  },
  0x1024: {
    'operation': 'LBCC',
    'object': 'PC',
    'target': 'W',
    'condition': 'carryclear',
    'code': [
      'READHIGH', 'READWLOW', 'ADDTGSWTOOBIF',
    ],
  },
  0x1025: {
    'operation': 'LBCS',
    'object': 'PC',
    'target': 'W',
    'condition': 'carryset',
    'code': [
      'READHIGH', 'READWLOW', 'ADDTGSWTOOBIF',
    ],
  },
  0x1026: {
    'operation': 'LBNE',
    'object': 'PC',
    'target': 'W',
    'condition': 'notequal',
    'code': [
      'READHIGH', 'READWLOW', 'ADDTGSWTOOBIF',
    ],
  },
  0x1027: {
    'operation': 'LBEQ',
    'object': 'PC',
    'target': 'W',
    'condition': 'equal',
    'code': [
      'READHIGH', 'READWLOW', 'ADDTGSWTOOBIF',
    ],
  },
  0x1028: {
    'operation': 'LBVC',
    'object': 'PC',
    'target': 'W',
    'condition': 'notoverflow',
    'code': [
      'READHIGH', 'READWLOW', 'ADDTGSWTOOBIF',
    ],
  },
  0x1029: {
    'operation': 'LBVS',
    'object': 'PC',
    'target': 'W',
    'condition': 'overflow',
    'code': [
      'READHIGH', 'READWLOW', 'ADDTGSWTOOBIF',
    ],
  },
  0x102a: {
    'operation': 'LBPL',
    'object': 'PC',
    'target': 'W',
    'condition': 'positive',
    'code': [
      'READHIGH', 'READWLOW', 'ADDTGSWTOOBIF',
    ],
  },
  0x102b: {
    'operation': 'LBMI',
    'object': 'PC',
    'target': 'W',
    'condition': 'negative',
    'code': [
      'READHIGH', 'READWLOW', 'ADDTGSWTOOBIF',
    ],
  },
  0x102c: {
    'operation': 'LBGE',
    'object': 'PC',
    'target': 'W',
    'condition': 'greaterorequal',
    'code': [
      'READHIGH', 'READWLOW', 'ADDTGSWTOOBIF',
    ],
  },
  0x102d: {
    'operation': 'LBLT',
    'object': 'PC',
    'target': 'W',
    'condition': 'lessthan',
    'code': [
      'READHIGH', 'READWLOW', 'ADDTGSWTOOBIF',
    ],
  },
  0x102e: {
    'operation': 'LBGT',
    'object': 'PC',
    'target': 'W',
    'condition': 'greaterthan',
    'code': [
      'READHIGH', 'READWLOW', 'ADDTGSWTOOBIF',
    ],
  },
  0x102f: {
    'operation': 'LBLE',
    'object': 'PC',
    'target': 'W',
    'condition': 'lessorequal',
    'code': [
      'READHIGH', 'READWLOW', 'ADDTGSWTOOBIF',
    ],
  },
  0x103f: {
    'operation': 'SWI2',
    'mode': 'inherent',
    'object': 'S',
    'target': 'AD',
    'vector': cpus.vSWI2.vector,
    'mask': 0x00,
    'code': [
      'SETENTIRE', 'TFROBTOTG', 'PUSH', 'TFRTGTOOB',
      'VECTORHIGH', 'VECTORLOW', 'MASKIF',
    ],
  },
  0x108c: {
    'operation': 'CMPY',
    'mode': 'immediate',
    'object': 'Y',
    'code': [
      'READHIGH', 'READWLOW', 'COMPAREW',
    ],
  },
  0x108e: {
    'operation': 'LDY',
    'mode': 'immediate',
    'object': 'Y',
    'code': [
      'READHIGH', 'READLOW',
    ],
  },
  0x109c: {
    'operation': 'CMPY',
    'mode': 'direct',
    'object': 'Y',
    'target': 'AD',
    'code': [
      'DIRECT', 'TFRWTOTG', 'READADHIGH', 'READADWLOW', 'COMPAREW',
    ],
  },
  0x109e: {
    'operation': 'LDY',
    'mode': 'direct',
    'object': 'Y',
    'target': 'AD',
    'code': [
      'DIRECT', 'TFRWTOTG', 'READADHIGH', 'READADLOW',
    ],
  },
  0x109f: {
    'operation': 'STY',
    'mode': 'direct',
    'object': 'Y',
    'target': 'AD',
    'code': [
      'DIRECT', 'TFRWTOTG', 'WRITEHIGH', 'WRITELOW',
    ],
  },
  0x10bc: {
    'operation': 'CMPY',
    'mode': 'extended',
    'object': 'Y',
    'target': 'AD',
    'code': [
      'READHIGH', 'READWLOW', 'TFRWTOTG',
      'READADHIGH', 'READADWLOW', 'COMPAREW',
    ],
  },
  0x10be: {
    'operation': 'LDY',
    'mode': 'extended',
    'object': 'Y',
    'target': 'AD',
    'code': [
      'READHIGH', 'READWLOW', 'TFRWTOTG', 'READADHIGH', 'READADLOW',
    ],
  },
  0x10bf: {
    'operation': 'STY',
    'mode': 'extended',
    'object': 'Y',
    'target': 'AD',
    'code': [
      'READHIGH', 'READWLOW', 'TFRWTOTG', 'WRITEHIGH', 'WRITELOW',
    ],
  },
  0x10ce: {
    'operation': 'LDS',
    'mode': 'immediate',
    'object': 'S',
    'code': [
      'READHIGH', 'READLOW',
    ],
  },
  0x10de: {
    'operation': 'LDS',
    'mode': 'direct',
    'object': 'S',
    'target': 'AD',
    'code': [
      'DIRECT', 'TFRWTOTG', 'READADHIGH', 'READADLOW',
    ],
  },
  0x10df: {
    'operation': 'STS',
    'mode': 'direct',
    'object': 'S',
    'target': 'AD',
    'code': [
      'DIRECT', 'TFRWTOTG', 'WRITEHIGH', 'WRITELOW',
    ],
  },
  0x10fe: {
    'operation': 'LDS',
    'mode': 'extended',
    'object': 'S',
    'target': 'AD',
    'code': [
      'READHIGH', 'READWLOW', 'TFRWTOTG', 'READADHIGH', 'READADLOW',
    ],
  },
  0x10ff: {
    'operation': 'STS',
    'mode': 'extended',
    'object': 'S',
    'target': 'AD',
    'code': [
      'READHIGH', 'READWLOW', 'TFRWTOTG', 'WRITEHIGH', 'WRITELOW',
    ],
  },
  0x11: {
    'operation': 'extended instruction',
    'mode': 'fetch',
  },
  0x113f: {
    'operation': 'SWI3',
    'mode': 'inherent',
    'object': 'S',
    'target': 'AD',
    'vector': cpus.vSWI3.vector,
    'mask': 0,
    'code': [
      'SETENTIRE', 'TFROBTOTG', 'PUSH', 'TFRTGTOOB',
      'VECTORHIGH', 'VECTORLOW', 'MASKIF',
    ],
  },
  0x1183: {
    'operation': 'CMPU',
    'mode': 'immediate',
    'object': 'U',
    'code': [
      'READHIGH', 'READWLOW', 'COMPAREW',
    ],
  },
  0x118c: {
    'operation': 'CMPS',
    'mode': 'immediate',
    'object': 'S',
    'code': [
      'READHIGH', 'READWLOW', 'COMPAREW',
    ],
  },
  0x1193: {
    'operation': 'CMPU',
    'mode': 'direct',
    'object': 'U',
    'target': 'AD',
    'code': [
      'DIRECT', 'TFRWTOTG', 'READADHIGH', 'READADWLOW', 'COMPAREW',
    ],
  },
  0x119c: {
    'operation': 'CMPS',
    'mode': 'direct',
    'object': 'S',
    'target': 'AD',
    'code': [
      'DIRECT', 'TFRWTOTG', 'READADHIGH', 'READADWLOW', 'COMPAREW',
    ],
  },
  0x11b3: {
    'operation': 'CMPU',
    'mode': 'extended',
    'object': 'U',
    'target': 'AD',
    'code': [
      'READHIGH', 'READWLOW', 'TFRWTOTG',
      'READADHIGH', 'READADWLOW', 'COMPAREW',
    ],
  },
  0x11bc: {
    'operation': 'CMPS',
    'mode': 'extended',
    'object': 'S',
    'target': 'AD',
    'code': [
      'READHIGH', 'READWLOW', 'TFRWTOTG',
      'READADHIGH', 'READADWLOW', 'COMPAREW',
    ],
  },
  0x12: {
    'operation': 'NOP',
    'code': ['BUSY'],
  },
  0x13: {
    'operation': 'SYNC',
    'code': ['SYNC'],
  },
  0x16: {
    'operation': 'LBRA',
    'mode': 'relative',
    'object': 'PC',
    'target': 'W',
    'condition': 'always',
    'code': [
      'READHIGH', 'READWLOW', 'ADDTGSWTOOBIF',
    ],
  },
  0x17: {
    'operation': 'LBSR',
    'mode': 'relative',
    'object': 'PC',
    'target': 'W',
    'condition': 'always',
    'code': [
      'READHIGH', 'READWLOW', 'PUSHPC', 'ADDTGSWTOOBIF', 'BUSY', 'BUSY', 'BUSY',
    ],
  },
  0x19: {
    'operation': 'DAA',
    'mode': 'inherent',
    'object': 'A',
    'code': ['DECIMALADJUST'],
  },
  0x1a: {
    'operation': 'ORCC',
    'mode': 'immediate',
    'object': 'CC',
    'target': 'AD',
    'code': [
      'READWLOW', 'ORCC',
    ],
  },
  0x1c: {
    'operation': 'ANDCC',
    'mode': 'immediate',
    'object': 'CC',
    'target': 'AD',
    'code': [
      'READWLOW', 'ANDCC',
    ],
  },
  0x1d: {
    'operation': 'SEX',
    'mode': 'inherent',
    'code': ['SIGNEXTEND'],
  },
  0x1e: {
    'operation': 'EXG',
    'mode': 'inherent',
    'object': 'W',
    'code': [
      'READLOW', 'EXCHANGE', 'BUSY', 'BUSY', 'BUSY', 'BUSY', 'BUSY',
    ],
  },
  0x1f: {
    'operation': 'EXG',
    'mode': 'inherent',
    'object': 'W',
    'code': [
      'READLOW', 'TRANSFER', 'BUSY', 'BUSY', 'BUSY', 'BUSY',
    ],
  },
  0x20: {
    'operation': 'BRA',
    'mode': 'relative',
    'object': 'PC',
    'target': 'W',
    'condition': 'always',
    'code': [
      'READWLOW', 'ADDTGSTOOBIF',
    ],
  },
  0x21: {
    'operation': 'BRN',
    'object': 'PC',
    'target': 'W',
    'condition': 'never',
    'code': [
      'READWLOW', 'ADDTGSTOOBIF',
    ],
  },
  0x22: {
    'operation': 'BHI',
    'object': 'PC',
    'target': 'W',
    'condition': 'higher',
    'code': [
      'READWLOW', 'ADDTGSTOOBIF',
    ],
  },
  0x23: {
    'operation': 'BLS',
    'object': 'PC',
    'target': 'W',
    'condition': 'lowerorsame',
    'code': [
      'READWLOW', 'ADDTGSTOOBIF',
    ],
  },
  0x24: {
    'operation': 'BCC',
    'object': 'PC',
    'target': 'W',
    'condition': 'carryclear',
    'code': [
      'READWLOW', 'ADDTGSTOOBIF',
    ],
  },
  0x25: {
    'operation': 'BCS',
    'object': 'PC',
    'target': 'W',
    'condition': 'carryset',
    'code': [
      'READWLOW', 'ADDTGSTOOBIF',
    ],
  },
  0x26: {
    'operation': 'BNE',
    'object': 'PC',
    'target': 'W',
    'condition': 'notequal',
    'code': [
      'READWLOW', 'ADDTGSTOOBIF',
    ],
  },
  0x27: {
    'operation': 'BEQ',
    'object': 'PC',
    'target': 'W',
    'condition': 'equal',
    'code': [
      'READWLOW', 'ADDTGSTOOBIF',
    ],
  },
  0x28: {
    'operation': 'BVC',
    'object': 'PC',
    'target': 'W',
    'condition': 'notoverflow',
    'code': [
      'READWLOW', 'ADDTGSTOOBIF',
    ],
  },
  0x29: {
    'operation': 'BVS',
    'object': 'PC',
    'target': 'W',
    'condition': 'overflow',
    'code': [
      'READWLOW', 'ADDTGSTOOBIF',
    ],
  },
  0x2a: {
    'operation': 'BPL',
    'object': 'PC',
    'target': 'W',
    'condition': 'positive',
    'code': [
      'READWLOW', 'ADDTGSTOOBIF',
    ],
  },
  0x2b: {
    'operation': 'BMI',
    'object': 'PC',
    'target': 'W',
    'condition': 'negative',
    'code': [
      'READWLOW', 'ADDTGSTOOBIF',
    ],
  },
  0x2c: {
    'operation': 'BGE',
    'object': 'PC',
    'target': 'W',
    'condition': 'greaterorequal',
    'code': [
      'READWLOW', 'ADDTGSTOOBIF',
    ],
  },
  0x2d: {
    'operation': 'BLT',
    'object': 'PC',
    'target': 'W',
    'condition': 'lessthan',
    'code': [
      'READWLOW', 'ADDTGSTOOBIF',
    ],
  },
  0x2e: {
    'operation': 'BGT',
    'object': 'PC',
    'target': 'W',
    'condition': 'greaterthan',
    'code': [
      'READWLOW', 'ADDTGSTOOBIF',
    ],
  },
  0x2f: {
    'operation': 'BLE',
    'object': 'PC',
    'target': 'W',
    'condition': 'lessorequal',
    'code': [
      'READWLOW', 'ADDTGSTOOBIF',
    ],
  },
  0x34: {
    'operation': 'PSHS',
    'object': 'S',
    'target': 'AD',
    'code': [
      'READWLOW', 'TFROBTOTG', 'PUSH', 'TFRTGTOOB', 'BUSY',
    ],
  },
  0x35: {
    'operation': 'PULS',
    'object': 'S',
    'target': 'AD',
    'code': [
      'READWLOW', 'TFROBTOTG', 'PULL', 'TFRTGTOOB', 'BUSY',
    ],
  },
  0x36: {
    'operation': 'PSHU',
    'object': 'U',
    'target': 'AD',
    'code': [
      'READWLOW', 'TFROBTOTG', 'PUSH', 'TFRTGTOOB', 'BUSY',
    ],
  },
  0x37: {
    'operation': 'PULU',
    'object': 'U',
    'target': 'AD',
    'code': [
      'READWLOW', 'TFROBTOTG', 'PULL', 'TFRTGTOOB', 'BUSY',
    ],
  },
  0x3a: {
    'operation': 'ABX',
    'object': 'X',
    'target': 'B',
    'code': [
      'ADDTGTOOB', 'TFRWTOOB',
    ],
  },
  0x39: {
    'operation': 'RTS',
    'mode': 'immediate',
    'object': 'S',
    'target': 'AD',
    'code': [
      'TFROBTOTG', 'PULLPC', 'TFRTGTOOB', 'BUSY',
    ],
  },
  0x3b: {
    'operation': 'RTI',
    'mode': 'inherent',
    'object': 'S',
    'target': 'AD',
    'code': [
      'TFROBTOTG', 'PULLCC', 'PULLPC', 'TFRTGTOOB', 'BUSY',
    ],
  },
  0x3c: {
    'operation': 'CWAI',
    'mode': 'immediate',
    'object': 'S',
    'target': 'AD',
    'code': [
      'READWLOW', 'ANDCC', 'SETENTIRE', 'TFROBTOTG', 'PUSH',
      'TFRTGTOOB', 'BUSY', 'WAIT',
    ],
  },
  0x3d: {
    'operation': 'MUL',
    'mode': 'inherent',
    'code': [
      'MULTIPLY', 'BUSY', 'BUSY', 'BUSY', 'BUSY',
      'BUSY', 'BUSY', 'BUSY', 'BUSY', 'BUSY',
    ],
  },
  0x3f: {
    'operation': 'SWI',
    'mode': 'inherent',
    'object': 'S',
    'target': 'AD',
    'vector': cpus.vSWI.vector,
    'mask': cpus.IRQ | cpus.FIRQ,
    'code': [
      'SETENTIRE', 'TFROBTOTG', 'PUSH', 'TFRTGTOOB',
      'VECTORHIGH', 'VECTORLOW', 'MASKIF',
    ],
  },
  0x40: {
    'operation': 'NEGA',
    'mode': 'inherent',
    'object': 'A',
    'code': [
      'NEGATE',
    ],
  },
  0x43: {
    'operation': 'COMA',
    'mode': 'inherent',
    'object': 'A',
    'code': [
      'COMPLEMENT',
    ],
  },
  0x46: {
    'operation': 'RORA',
    'mode': 'inherent',
    'object': 'A',
    'code': [
      'ROTATERIGHT',
    ],
  },
  0x47: {
    'operation': 'ASRA',
    'mode': 'inherent',
    'object': 'A',
    'code': [
      'SHIFTRIGHT',
    ],
  },
  0x48: {
    'operation': 'ASLA',
    'mode': 'inherent',
    'object': 'A',
    'code': [
      'SHIFTLEFT',
    ],
  },
  0x49: {
    'operation': 'ROLA',
    'mode': 'inherent',
    'object': 'A',
    'code': [
      'ROTATELEFT',
    ],
  },
  0x4a: {
    'operation': 'DECA',
    'object': 'A',
    'code': [
      'DECOB',
    ],
  },
  0x4c: {
    'operation': 'INCA',
    'object': 'A',
    'code': [
      'INCOB',
    ],
  },
  0x4d: {
    'operation': 'TSTA',
    'object': 'A',
    'code': [
      'TESTOB',
    ],
  },
  0x50: {
    'operation': 'NEGB',
    'mode': 'inherent',
    'object': 'B',
    'code': [
      'NEGATE',
    ],
  },
  0x53: {
    'operation': 'COMB',
    'mode': 'inherent',
    'object': 'B',
    'code': [
      'COMPLEMENT',
    ],
  },
  0x56: {
    'operation': 'RORB',
    'mode': 'inherent',
    'object': 'B',
    'code': [
      'ROTATERIGHT',
    ],
  },
  0x57: {
    'operation': 'ASRB',
    'mode': 'inherent',
    'object': 'B',
    'code': [
      'SHIFTRIGHT',
    ],
  },
  0x58: {
    'operation': 'ASLB',
    'mode': 'inherent',
    'object': 'B',
    'code': [
      'SHIFTLEFT',
    ],
  },
  0x59: {
    'operation': 'ROLB',
    'mode': 'inherent',
    'object': 'B',
    'code': [
      'ROTATELEFT',
    ],
  },
  0x5a: {
    'operation': 'DECB',
    'object': 'B',
    'code': [
      'DECOB',
    ],
  },
  0x5c: {
    'operation': 'INCB',
    'object': 'B',
    'code': [
      'INCOB',
    ],
  },
  0x5d: {
    'operation': 'TSTB',
    'object': 'B',
    'code': [
      'TESTOB',
    ],
  },
  0x67: {
    'operation': 'ASR',
    'mode': 'indexed',
    'object': 'W',
    'code': [
      'READWLOW', 'INDEX', 'READADWLOW', 'SHIFTRIGHT', 'WRITEWLOW',
    ],
  },
  0x68: {
    'operation': 'ASL',
    'mode': 'indexed',
    'object': 'W',
    'code': [
      'READWLOW', 'INDEX', 'READADWLOW', 'SHIFTLEFT', 'WRITEWLOW',
    ],
  },
  0x70: {
    'operation': 'NEG',
    'mode': 'extended',
    'object': 'W',
    'code': [
      'READHIGH', 'READLOW', 'SWAPWAD', 'READWLOW', 'NEGATE', 'WRITEWLOW',
    ],
  },
  0x73: {
    'operation': 'COM',
    'mode': 'extended',
    'object': 'W',
    'code': [
      'READHIGH', 'READLOW', 'SWAPWAD', 'READWLOW', 'COMPLEMENT', 'WRITEWLOW',
    ],
  },
  0x76: {
    'operation': 'ROR',
    'mode': 'extended',
    'object': 'W',
    'code': [
      'READHIGH', 'READLOW', 'SWAPWAD', 'READWLOW', 'ROTATERIGHT', 'WRITEWLOW',
    ],
  },
  0x77: {
    'operation': 'ASR',
    'mode': 'extended',
    'object': 'W',
    'code': [
      'READHIGH', 'READLOW', 'SWAPWAD', 'READWLOW', 'SHIFTRIGHT', 'WRITEWLOW',
    ],
  },
  0x78: {
    'operation': 'ASL',
    'mode': 'extended',
    'object': 'W',
    'code': [
      'READHIGH', 'READLOW', 'SWAPWAD', 'READWLOW', 'SHIFTLEFT', 'WRITEWLOW',
    ],
  },
  0x79: {
    'operation': 'ROL',
    'mode': 'extended',
    'object': 'W',
    'code': [
      'READHIGH', 'READLOW', 'SWAPWAD', 'READWLOW', 'ROTATELEFT', 'WRITEWLOW',
    ],
  },
  0x7a: {
    'operation': 'DEC',
    'mode': 'extended',
    'object': 'AD',
    'code': [
      'READHIGH', 'READLOW', 'READADWLOW', 'DECW', 'WRITEWLOW',
    ],
  },
  0x7c: {
    'operation': 'INC',
    'mode': 'extended',
    'object': 'AD',
    'code': [
      'READHIGH', 'READLOW', 'READADWLOW', 'INCW', 'WRITEWLOW',
    ],
  },
  0x7d: {
    'operation': 'TST',
    'mode': 'extended',
    'object': 'W',
    'target': 'AD',
    'code': [
      'READHIGH', 'READWLOW', 'SWAPWAD', 'READWLOW', 'TESTOB', 'BUSY',
    ],
  },
  0x7e: {
    'operation': 'JMP',
    'mode': 'extended',
    'object': 'PC',
    'code': [
      'READHIGH', 'READWLOW', 'TFRWTOOB',
    ],
  },
  0x80: {
    'operation': 'SUBA',
    'mode': 'immediate',
    'object': 'A',
    'target': 'PC',
    'code': [
      'SUBPCFROMOB',
    ],
  },
  0x81: {
    'operation': 'CMPA',
    'mode': 'immediate',
    'object': 'A',
    'code': [
      'READLOWCOMPARE',
    ],
  },
  0x82: {
    'operation': 'SBCA',
    'mode': 'immediate',
    'object': 'A',
    'target': 'PC',
    'code': [
      'SUBCPCFROMOB',
    ],
  },
  0x83: {
    'operation': 'SUBD',
    'mode': 'immediate',
    'object': 'D',
    'target': 'W',
    'code': [
      'READHIGH', 'READWLOW', 'SUBTGFROMOB',
    ],
  },
  0x84: {
    'operation': 'ANDA',
    'mode': 'immediate',
    'object': 'A',
    'target': 'PC',
    'code': [
      'READAND',
    ],
  },
  0x85: {
    'operation': 'BITA',
    'mode': 'immediate',
    'object': 'A',
    'target': 'PC',
    'code': [
      'BITTEST',
    ],
  },
  0x86: {
    'operation': 'LDA',
    'mode': 'immediate',
    'object': 'A',
    'code': [
      'READLOW',
    ],
  },
  0x88: {
    'operation': 'EORA',
    'mode': 'immediate',
    'object': 'A',
    'target': 'PC',
    'code': [
      'READEOR',
    ],
  },
  0x89: {
    'operation': 'ADCA',
    'mode': 'immediate',
    'object': 'A',
    'target': 'PC',
    'code': [
      'ADDCPCTOOB',
    ],
  },
  0x8a: {
    'operation': 'ORA',
    'mode': 'immediate',
    'object': 'A',
    'target': 'PC',
    'code': [
      'READOR',
    ],
  },
  0x8b: {
    'operation': 'ADDA',
    'mode': 'immediate',
    'object': 'A',
    'target': 'PC',
    'code': [
      'ADDPCTOOB',
    ],
  },
  0x8c: {
    'operation': 'CMPX',
    'mode': 'immediate',
    'object': 'X',
    'code': [
      'READHIGH', 'READWLOW', 'COMPAREW',
    ],
  },
  0x8d: {
    'operation': 'BSR',
    'mode': 'immediate',
    'object': 'PC',
    'target': 'W',
    'condition': 'always',
    'code': [
      'READWLOW', 'PUSHPC', 'ADDTGSTOOBIF', 'BUSY', 'BUSY', 'BUSY',
    ],
  },
  0x8e: {
    'operation': 'LDX',
    'mode': 'immediate',
    'object': 'X',
    'code': [
      'READHIGH', 'READLOW',
    ],
  },
  0x90: {
    'operation': 'SUBA',
    'mode': 'direct',
    'object': 'A',
    'target': 'AD',
    'code': [
      'DIRECT', 'TFRWTOTG', 'SUBTGFROMOB',
    ],
  },
  0x91: {
    'operation': 'CMPA',
    'mode': 'direct',
    'object': 'A',
    'target': 'AD',
    'code': [
      'DIRECT', 'TFRWTOTG', 'READADLOWCOMPARE',
    ],
  },
  0x92: {
    'operation': 'SBCA',
    'mode': 'direct',
    'object': 'A',
    'target': 'PC',
    'code': [
      'DIRECT', 'TFRWTOTG', 'SUBCTGFROMOB',
    ],
  },
  0x93: {
    'operation': 'SUBD',
    'mode': 'direct',
    'object': 'D',
    'target': 'W',
    'code': [
      'DIRECT', 'SWAPWAD', 'READADHIGH', 'READADWLOW', 'SUBTGFROMOB',
    ],
  },
  0x94: {
    'operation': 'ANDA',
    'mode': 'direct',
    'object': 'A',
    'target': 'AD',
    'code': [
      'DIRECT', 'TFRWTOTG', 'READAND',
    ],
  },
  0x95: {
    'operation': 'BITA',
    'mode': 'direct',
    'object': 'A',
    'target': 'AD',
    'code': [
      'DIRECT', 'SWAPWAD', 'BITTEST',
    ],
  },
  0x96: {
    'operation': 'LDA',
    'mode': 'direct',
    'object': 'A',
    'target': 'AD',
    'code': [
      'DIRECT', 'TFRWTOTG', 'READADLOW',
    ],
  },
  0x97: {
    'operation': 'STA',
    'mode': 'direct',
    'object': 'A',
    'target': 'AD',
    'code': [
      'DIRECT', 'TFRWTOTG', 'WRITELOW',
    ],
  },
  0x98: {
    'operation': 'EORA',
    'mode': 'direct',
    'object': 'A',
    'target': 'AD',
    'code': [
      'DIRECT', 'TFRWTOTG', 'READEOR',
    ],
  },
  0x99: {
    'operation': 'ADCA',
    'mode': 'direct',
    'object': 'A',
    'target': 'PC',
    'code': [
      'DIRECT', 'TFRWTOTG', 'ADDCTGTOOB',
    ],
  },
  0x9a: {
    'operation': 'ORA',
    'mode': 'direct',
    'object': 'A',
    'target': 'AD',
    'code': [
      'DIRECT', 'TFRWTOTG', 'READOR',
    ],
  },
  0x9b: {
    'operation': 'ADDA',
    'mode': 'direct',
    'object': 'A',
    'target': 'AD',
    'code': [
      'DIRECT', 'TFRWTOTG', 'ADDTGBTOOB',
    ],
  },
  0x9c: {
    'operation': 'CMPX',
    'mode': 'direct',
    'object': 'X',
    'target': 'AD',
    'code': [
      'DIRECT', 'TFRWTOTG', 'READADHIGH', 'READADWLOW', 'COMPAREW',
    ],
  },
  0x9d: {
    'operation': 'JSR',
    'mode': 'direct',
    'object': 'PC',
    'code': [
      'DIRECT', 'PUSHPC', 'TFRWTOOB', 'BUSY', 'BUSY', 'BUSY',
    ],
  },
  0x9e: {
    'operation': 'LDX',
    'mode': 'direct',
    'object': 'X',
    'target': 'AD',
    'code': [
      'DIRECT', 'TFRWTOTG', 'READADHIGH', 'READADLOW',
    ],
  },
  0x9f: {
    'operation': 'STX',
    'mode': 'direct',
    'object': 'X',
    'target': 'AD',
    'code': [
      'DIRECT', 'TFRWTOTG', 'WRITEHIGH', 'WRITELOW',
    ],
  },
  0xa4: {
    'operation': 'ANDA',
    'mode': 'indexed',
    'object': 'A',
    'target': 'AD',
    'code': [
      'READWLOW', 'INDEX', 'READAND',
    ],
  },
  0xa9: {
    'operation': 'ADCA',
    'mode': 'indexed',
    'object': 'A',
    'target': 'PC',
    'code': [
      'READWLOW', 'INDEX', 'ADDCTGTOOB',
    ],
  },
  0xab: {
    'operation': 'ADDA',
    'mode': 'indexed',
    'object': 'A',
    'target': 'AD',
    'code': [
      'READWLOW', 'INDEX', 'ADDTGBTOOB',
    ],
  },
  0xb0: {
    'operation': 'SUBA',
    'mode': 'extended',
    'object': 'A',
    'target': 'PC',
    'code': [
      'READHIGH', 'READWLOW', 'TFRWTOTG', 'SUBTGFROMOB',
    ],
  },
  0xb1: {
    'operation': 'CMPA',
    'mode': 'extended',
    'object': 'A',
    'target': 'AD',
    'code': [
      'READHIGH', 'READWLOW', 'TFRWTOTG', 'READADLOWCOMPARE',
    ],
  },
  0xb2: {
    'operation': 'SBCA',
    'mode': 'extended',
    'object': 'A',
    'target': 'PC',
    'code': [
      'READHIGH', 'READWLOW', 'TFRWTOTG', 'SUBCTGFROMOB',
    ],
  },
  0xb3: {
    'operation': 'SUBD',
    'mode': 'extended',
    'object': 'D',
    'target': 'W',
    'code': [
      'READHIGH',
      'READWLOW',
      'SWAPWAD',
      'READADHIGH',
      'READADWLOW',
      'SUBTGFROMOB',
    ],
  },
  0xb4: {
    'operation': 'ANDA',
    'mode': 'extended',
    'object': 'A',
    'target': 'AD',
    'code': [
      'READHIGH', 'READWLOW', 'TFRWTOTG', 'READAND',
    ],
  },
  0xb5: {
    'operation': 'BITA',
    'mode': 'extended',
    'object': 'A',
    'target': 'AD',
    'code': [
      'READHIGH', 'READWLOW', 'SWAPWAD', 'BITTEST',
    ],
  },
  0xb6: {
    'operation': 'LDA',
    'mode': 'extended',
    'object': 'A',
    'target': 'AD',
    'code': [
      'READHIGH', 'READWLOW', 'TFRWTOTG', 'READADLOW',
    ],
  },
  0xb7: {
    'operation': 'STA',
    'mode': 'extended',
    'object': 'A',
    'target': 'AD',
    'code': [
      'READHIGH', 'READWLOW', 'TFRWTOTG', 'WRITELOW',
    ],
  },
  0xb8: {
    'operation': 'EORA',
    'mode': 'extended',
    'object': 'A',
    'target': 'AD',
    'code': [
      'READHIGH', 'READWLOW', 'TFRWTOTG', 'READEOR',
    ],
  },
  0xb9: {
    'operation': 'ADCA',
    'mode': 'extended',
    'object': 'A',
    'target': 'PC',
    'code': [
      'READHIGH', 'READWLOW', 'TFRWTOTG', 'ADDCTGTOOB',
    ],
  },
  0xba: {
    'operation': 'ORA',
    'mode': 'extended',
    'object': 'A',
    'target': 'AD',
    'code': [
      'READHIGH', 'READWLOW', 'TFRWTOTG', 'READOR',
    ],
  },
  0xbb: {
    'operation': 'ADDA',
    'mode': 'extended',
    'object': 'A',
    'target': 'AD',
    'code': [
      'READHIGH', 'READWLOW', 'TFRWTOTG', 'ADDTGBTOOB',
    ],
  },
  0xbc: {
    'operation': 'CMPX',
    'mode': 'extended',
    'object': 'X',
    'target': 'AD',
    'code': [
      'READHIGH', 'READWLOW', 'TFRWTOTG',
      'READADHIGH', 'READADWLOW', 'COMPAREW',
    ],
  },
  0xbd: {
    'operation': 'JSR',
    'mode': 'extended',
    'object': 'PC',
    'code': [
      'READHIGH', 'READWLOW', 'PUSHPC', 'TFRWTOOB', 'BUSY', 'BUSY', 'BUSY',
    ],
  },
  0xbe: {
    'operation': 'LDX',
    'mode': 'extended',
    'object': 'X',
    'target': 'AD',
    'code': [
      'READHIGH', 'READWLOW', 'TFRWTOTG', 'READADHIGH', 'READADLOW',
    ],
  },
  0xbf: {
    'operation': 'STX',
    'mode': 'extended',
    'object': 'X',
    'target': 'AD',
    'code': [
      'READHIGH', 'READWLOW', 'TFRWTOTG', 'WRITEHIGH', 'WRITELOW',
    ],
  },
  0xc0: {
    'operation': 'SUBB',
    'mode': 'immediate',
    'object': 'B',
    'target': 'PC',
    'code': [
      'SUBPCFROMOB',
    ],
  },
  0xc1: {
    'operation': 'CMPB',
    'mode': 'immediate',
    'object': 'B',
    'code': [
      'READLOWCOMPARE',
    ],
  },
  0xc2: {
    'operation': 'SBCB',
    'mode': 'immediate',
    'object': 'B',
    'target': 'PC',
    'code': [
      'SUBCPCFROMOB',
    ],
  },
  0xc3: {
    'operation': 'ADDD',
    'mode': 'immediate',
    'object': 'D',
    'target': 'W',
    'code': [
      'READHIGH', 'READWLOW', 'ADDTGBTOOB',
    ],
  },
  0xc4: {
    'operation': 'ANDB',
    'mode': 'immediate',
    'object': 'B',
    'target': 'PC',
    'code': [
      'READAND',
    ],
  },
  0xc5: {
    'operation': 'BITB',
    'mode': 'immediate',
    'object': 'B',
    'target': 'PC',
    'code': [
      'BITTEST',
    ],
  },
  0xc6: {
    'operation': 'LDB',
    'mode': 'immediate',
    'object': 'B',
    'code': [
      'READLOW',
    ],
  },
  0xc8: {
    'operation': 'EORB',
    'mode': 'immediate',
    'object': 'B',
    'target': 'PC',
    'code': [
      'READEOR',
    ],
  },
  0xc9: {
    'operation': 'ADCB',
    'mode': 'immediate',
    'object': 'B',
    'target': 'PC',
    'code': [
      'ADDCPCTOOB',
    ],
  },
  0xca: {
    'operation': 'OR',
    'mode': 'immediate',
    'object': 'B',
    'target': 'PC',
    'code': [
      'READOR',
    ],
  },
  0xcb: {
    'operation': 'ADDB',
    'mode': 'immediate',
    'object': 'B',
    'code': [
      'ADDPCTOOB',
    ],
  },
  0xcc: {
    'operation': 'LDD',
    'mode': 'immediate',
    'object': 'D',
    'code': [
      'READHIGH', 'READLOW',
    ],
  },
  0xce: {
    'operation': 'LDU',
    'mode': 'immediate',
    'object': 'U',
    'code': [
      'READHIGH', 'READLOW',
    ],
  },
  0xd0: {
    'operation': 'SUBB',
    'mode': 'direct',
    'object': 'B',
    'target': 'AD',
    'code': [
      'DIRECT', 'TFRWTOTG', 'SUBTGFROMOB',
    ],
  },
  0xd1: {
    'operation': 'CMPB',
    'mode': 'direct',
    'object': 'B',
    'target': 'AD',
    'code': [
      'DIRECT', 'TFRWTOTG', 'READADLOWCOMPARE',
    ],
  },
  0xd2: {
    'operation': 'SBCB',
    'mode': 'direct',
    'object': 'B',
    'target': 'PC',
    'code': [
      'DIRECT', 'TFRWTOTG', 'SUBCTGFROMOB',
    ],
  },
  0xd3: {
    'operation': 'ADDD',
    'mode': 'direct',
    'object': 'D',
    'target': 'W',
    'code': [
      'DIRECT', 'SWAPWAD', 'READADHIGH', 'READADWLOW', 'ADDTGBTOOB',
    ],
  },
  0xd4: {
    'operation': 'ANDB',
    'mode': 'direct',
    'object': 'B',
    'target': 'AD',
    'code': [
      'DIRECT', 'TFRWTOTG', 'READAND',
    ],
  },
  0xd5: {
    'operation': 'BITB',
    'mode': 'direct',
    'object': 'B',
    'target': 'AD',
    'code': [
      'DIRECT', 'SWAPWAD', 'BITTEST',
    ],
  },
  0xd6: {
    'operation': 'LDB',
    'mode': 'direct',
    'object': 'B',
    'target': 'AD',
    'code': [
      'DIRECT', 'TFRWTOTG', 'READADLOW',
    ],
  },
  0xd7: {
    'operation': 'STB',
    'mode': 'direct',
    'object': 'B',
    'target': 'AD',
    'code': [
      'DIRECT', 'TFRWTOTG', 'WRITELOW',
    ],
  },
  0xd8: {
    'operation': 'EORB',
    'mode': 'direct',
    'object': 'B',
    'target': 'AD',
    'code': [
      'DIRECT', 'TFRWTOTG', 'READEOR',
    ],
  },
  0xd9: {
    'operation': 'ADCB',
    'mode': 'direct',
    'object': 'B',
    'target': 'PC',
    'code': [
      'DIRECT', 'TFRWTOTG', 'ADDCTGTOOB',
    ],
  },
  0xda: {
    'operation': 'ORB',
    'mode': 'direct',
    'object': 'B',
    'target': 'AD',
    'code': [
      'DIRECT', 'TFRWTOTG', 'READOR',
    ],
  },
  0xdb: {
    'operation': 'ADDB',
    'mode': 'direct',
    'object': 'B',
    'target': 'AD',
    'code': [
      'DIRECT', 'TFRWTOTG', 'ADDTGBTOOB',
    ],
  },
  0xdc: {
    'operation': 'LDD',
    'mode': 'direct',
    'object': 'D',
    'target': 'AD',
    'code': [
      'DIRECT', 'TFRWTOTG', 'READADHIGH', 'READADLOW',
    ],
  },
  0xdd: {
    'operation': 'STD',
    'mode': 'direct',
    'object': 'D',
    'target': 'AD',
    'code': [
      'DIRECT', 'TFRWTOTG', 'WRITEHIGH', 'WRITELOW',
    ],
  },
  0xde: {
    'operation': 'LDU',
    'mode': 'direct',
    'object': 'U',
    'target': 'AD',
    'code': [
      'DIRECT', 'TFRWTOTG', 'READADHIGH', 'READADLOW',
    ],
  },
  0xdf: {
    'operation': 'STU',
    'mode': 'direct',
    'object': 'U',
    'target': 'AD',
    'code': [
      'DIRECT', 'TFRWTOTG', 'WRITEHIGH', 'WRITELOW',
    ],
  },
  0xe3: {
    'operation': 'ADDD',
    'mode': 'indexed',
    'object': 'D',
    'target': 'W',
    'code': [
      'READWLOW',
      'INDEX',
      'READADHIGH',
      'READADWLOW',
      'ADDTGBTOOB',
      'BUSY', 'BUSY', 'BUSY',
    ],
  },
  0xe4: {
    'operation': 'ANDB',
    'mode': 'indexed',
    'object': 'B',
    'target': 'AD',
    'code': [
      'READWLOW', 'INDEX', 'READAND',
    ],
  },
  0xe9: {
    'operation': 'ADCB',
    'mode': 'indexed',
    'object': 'B',
    'target': 'PC',
    'code': [
      'READWLOW', 'INDEX', 'ADDCTGTOOB',
    ],
  },
  0xeb: {
    'operation': 'ADDB',
    'mode': 'indexed',
    'object': 'B',
    'target': 'AD',
    'code': [
      'READWLOW', 'INDEX', 'ADDTGBTOOB',
    ],
  },
  0xf0: {
    'operation': 'SUBB',
    'mode': 'extended',
    'object': 'B',
    'target': 'PC',
    'code': [
      'READHIGH', 'READWLOW', 'TFRWTOTG', 'SUBTGFROMOB',
    ],
  },
  0xf1: {
    'operation': 'CMPB',
    'mode': 'extended',
    'object': 'B',
    'target': 'AD',
    'code': [
      'READHIGH', 'READWLOW', 'TFRWTOTG', 'READADLOWCOMPARE',
    ],
  },
  0xf2: {
    'operation': 'SBCB',
    'mode': 'extended',
    'object': 'B',
    'target': 'PC',
    'code': [
      'READHIGH', 'READWLOW', 'TFRWTOTG', 'SUBCTGFROMOB',
    ],
  },
  0xf3: {
    'operation': 'ADDD',
    'mode': 'extended',
    'object': 'D',
    'target': 'W',
    'code': [
      'READHIGH',
      'READWLOW',
      'SWAPWAD',
      'READADHIGH',
      'READADWLOW',
      'ADDTGBTOOB',
    ],
  },
  0xf4: {
    'operation': 'ANDB',
    'mode': 'extended',
    'object': 'B',
    'target': 'AD',
    'code': [
      'READHIGH', 'READWLOW', 'TFRWTOTG', 'READAND',
    ],
  },
  0xf5: {
    'operation': 'BITB',
    'mode': 'extended',
    'object': 'B',
    'target': 'AD',
    'code': [
      'READHIGH', 'READWLOW', 'SWAPWAD', 'BITTEST',
    ],
  },
  0xf6: {
    'operation': 'LDB',
    'mode': 'extended',
    'object': 'B',
    'target': 'AD',
    'code': [
      'READHIGH', 'READWLOW', 'TFRWTOTG', 'READADLOW',
    ],
  },
  0xf7: {
    'operation': 'STB',
    'mode': 'extended',
    'object': 'B',
    'target': 'AD',
    'code': [
      'READHIGH', 'READWLOW', 'TFRWTOTG', 'WRITELOW',
    ],
  },
  0xf8: {
    'operation': 'EORB',
    'mode': 'extended',
    'object': 'B',
    'target': 'AD',
    'code': [
      'READHIGH', 'READWLOW', 'TFRWTOTG', 'READEOR',
    ],
  },
  0xf9: {
    'operation': 'ADCB',
    'mode': 'extended',
    'object': 'B',
    'target': 'PC',
    'code': [
      'READHIGH', 'READWLOW', 'TFRWTOTG', 'ADDCTGTOOB',
    ],
  },
  0xfa: {
    'operation': 'ORB',
    'mode': 'extended',
    'object': 'B',
    'target': 'AD',
    'code': [
      'READHIGH', 'READWLOW', 'TFRWTOTG', 'READOR',
    ],
  },
  0xfb: {
    'operation': 'ADDB',
    'mode': 'extended',
    'object': 'B',
    'target': 'AD',
    'code': [
      'READHIGH', 'READWLOW', 'TFRWTOTG', 'ADDTGBTOOB',
    ],
  },
  0xfc: {
    'operation': 'LDD',
    'mode': 'extended',
    'object': 'D',
    'target': 'AD',
    'code': [
      'READHIGH', 'READWLOW', 'TFRWTOTG', 'READADHIGH', 'READADLOW',
    ],
  },
  0xfd: {
    'operation': 'STD',
    'mode': 'extended',
    'object': 'D',
    'target': 'AD',
    'code': [
      'READHIGH', 'READWLOW', 'TFRWTOTG', 'WRITEHIGH', 'WRITELOW',
    ],
  },
  0xfe: {
    'operation': 'LDU',
    'mode': 'extended',
    'object': 'U',
    'target': 'AD',
    'code': [
      'READHIGH', 'READWLOW', 'TFRWTOTG', 'READADHIGH', 'READADLOW',
    ],
  },
  0xff: {
    'operation': 'STU',
    'mode': 'extended',
    'object': 'U',
    'target': 'AD',
    'code': [
      'READHIGH', 'READWLOW', 'TFRWTOTG', 'WRITEHIGH', 'WRITELOW',
    ],
  },
  'fastVectorFromRun': {
    'operation': 'HWI',
    'mode': 'inherent',
    'object': 'S',
    'target': 'AD',
    'code': [
      'TFROBTOTG', 'PUSHIR', 'TFRTGTOOB',
      'VECTORHIGH', 'VECTORLOW', 'MASKIF',
      'BUSY', 'BUSY', 'BUSY',
    ],
  },
  'vectorFromRun': {
    'operation': 'HWI',
    'mode': 'inherent',
    'object': 'S',
    'target': 'AD',
    'code': [
      'SETENTIRE', 'TFROBTOTG', 'PUSH', 'TFRTGTOOB',
      'VECTORHIGH', 'VECTORLOW', 'MASKIF', 'BUSY', 'BUSY',
    ],
  },
  'vectorFromWait': {
    'operation': 'HWI',
    'mode': 'inherent',
    'object': 'S',
    'target': 'AD',
    'code': [
      'VECTORHIGH', 'VECTORLOW', 'MASKIF',
      'BUSY', 'BUSY', 'BUSY', 'BUSY', 'BUSY',
    ],
  },
};

module.exports = {instructions};
