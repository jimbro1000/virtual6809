const Memory = require('./memory/memory_factory.js');
const {Cpu} = require('./cpu/cpu.js');
const Font = require('./font.js').halfSet;
const {Keyboard, KeyboardHandler, defaultMap} = require('./keyboard/dragon_keyboard');

const displayWidth = 640;
const displayHeight = 480;
const screenWidth = 256;
const screenHeight = 192;
const zoom = 2;

window.onload = () => {
  const vdgTranslate = (char, row) => {
    const mask = char > 127 ? 0xff : 0x00;
    let fontIndex = (char & 0x7f) * 8 + row % 8;
    return Font[fontIndex] ^ mask;
  };
  const div = (a, b) => {
    return Math.floor(a / b);
  };
  const render = (offset) => {
    const overScanVertical = div(displayHeight - (screenHeight * zoom), 2);
    const overScanHorizontal = div(displayWidth - (screenWidth * zoom), 2);
    for (let y = 0; y < height; ++y) {
      for (let x = 0; x < width; ++x) {
        const pixelIndex = (y * width + x) * 4;
        let red = 0;
        let blue = 0;
        let green = 0;
        const alpha = 255;
        if (y < overScanVertical || y >= (displayHeight - overScanVertical) ||
          x < overScanHorizontal || x >= (displayWidth - overScanHorizontal)) {
          // do nothing, just over scan
        } else {
          const screenX = div(x - overScanHorizontal, zoom);
          const screenY = div(y - overScanVertical, zoom);
          const column = div(screenX, 8);
          const row = div(screenY, 8);
          const charRow = screenY % 8;
          const screenAddress = videoAddress + column + row * 32;
          const memByte = memory.read(screenAddress);
          const lookup = vdgTranslate(memByte, charRow);
          const mask = 0x80 >> (screenX % 8);
          if (!((lookup & mask) === mask)) {
            red = 0;
            green = 0;
            blue = 0;
          } else {
            red = 255;
            green = 255;
            blue = 255;
          }
        }
        imageData.data[pixelIndex] = red;
        imageData.data[pixelIndex + 1] = green;
        imageData.data[pixelIndex + 2] = blue;
        imageData.data[pixelIndex + 3] = alpha;
      }
    }
  };

  const bodyNode = document.body;
  const display = document.createElement('div');
  display.id = 'display';
  bodyNode.append(display);
  const canvas = document.createElement('canvas');
  canvas.id = 'screen';
  canvas.width = displayWidth;
  canvas.height = displayHeight;
  display.append(canvas);

  const context = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const imageData = context.createImageData(width, height);

  const memory = Memory.factory('D64');
  const machine = new Cpu(memory);
  const pia1 = memory.getMappedChip(1);
  const cyclesPerTick = 1000;
  const tick = 1; // milliseconds
  const keyHandler = new KeyboardHandler(defaultMap, pia1);

  // provide cpu state feedback without log

  // const state = document.createElement('div');
  // state.id = 'cpustate';
  // bodyNode.append(state);
  // const statetext = document.createElement('textarea');
  // statetext.id = 'cpustatedesc';
  // state.append(statetext);
  // state.style.width = "100pc";
  //
  // const registerList = ['A', 'B', 'D', 'X', 'Y', 'U', 'S', 'PC', 'DP', 'CC'];
  //
  // function stateReport() {
  //   let result = '';
  //   registerList.forEach((registerName) => {
  //     result += appendRegister(registerName) + "\n";
  //   });
  //   statetext.textContent = result;
  // }
  //
  // function appendRegister(registerName) {
  //   let result = registerName + " : 0x";
  //   result = result + machine.registers.get(registerName).fetch().toString(16);
  //   return result;
  // }

  function keyDownEventHandler(event) {
    keyHandler.keydown(event);
  }
  function keyUpEventHandler(event) {
    keyHandler.keyup(event);
  }

  window.addEventListener('keydown', keyDownEventHandler);
  window.addEventListener('keyup', keyUpEventHandler);

  // set entry vector to 0x2000
  memory.burn(0xfffe, 0x20);
  // // simple program cycle the thirty-second byte of video memory

  const codeCycle = [
    0x10, 0xce, 0x7f, 0xff, //LDS #$7fff
    0x8e, 0x04, 0x00, //LDX #$0400
    0x8d, 0x10, //BSR +16 (clr)
    0x8d, 0x07, //BSR +7 (message)
    0x30, 0x88, 0x20, //LEAX 32,X
    0x6c, 0x84, //INC ,X
    0x20, 0xfc, //BRA -4
    0x31, 0x8d, 0x00, 0x1e, //LEAY +30, PC
    0x8d, 0x0f, //BSR +15
    0x39, //RTS
    0x34, 0x12, //PSHS A,X
    0x86, 0x20, //LDA #20
    0xa7, 0x80, //STA ,X+
    0x8c, 0x06, 0x00, //CMPX #$0600
    0x26, 0xf9, //BNE -6
    0x35, 0x12, //PULS A,X
    0x39, //RTS
    0x34, 0x32, //PSHS A,X,Y
    0xa6, 0xa0, //LDA ,Y+
    0x27, 0x04, //BEQ +10
    0xa7, 0x80, //STA ,X+
    0x20, 0xf8, //BRA -8
    0x35, 0x32, //PULS A,X,Y
    0x39, //RTS
    0x56, 0x49, 0x52, 0x54, 0x55, 0x41, 0x4C, 0x20, 0x36, 0x38,
    0x30, 0x39, 0x20, 0x56, 0x30, 0x2E, 0x34, 0x2E, 0x32, 0x00
  ];

  const codePiaTest = [
    0x20, 0x7d, 0x00, 0x00,
    0x20, 0x23, 0x58, 0x50, 0x48, 0x40, 0x38, 0x30,
    0x20, 0x24, 0x59, 0x51, 0x49, 0x41, 0x39, 0x31,
    0x20, 0x25, 0x5a, 0x52, 0x4a, 0x42, 0x3a, 0x32,
    0x20, 0x20, 0x5e, 0x53, 0x4b, 0x43, 0x3b, 0x33,
    0x20, 0x20, 0x21, 0x54, 0x4c, 0x44, 0x2c, 0x34,
    0x20, 0x20, 0x08, 0x55, 0x4d, 0x45, 0x2d, 0x35,
    0x20, 0x20, 0x3f, 0x56, 0x4e, 0x46, 0x2e, 0x36,
    0x20, 0x26, 0x20, 0x57, 0x4f, 0x47, 0x2f, 0x37,
    0x21, 0x20,
    0x44, 0x4f, 0x57, 0x4e, 0x20, 0x41, 0x52, 0x52, 0x4f, 0x57, 0x00,
    0x3f, 0x20,
    0x52, 0x49, 0x47, 0x48, 0x54, 0x20, 0x41, 0x52, 0x52, 0x4f, 0x57, 0x00,
    0x23, 0x20,
    0x45, 0x4e, 0x54, 0x45, 0x52, 0x00,
    0x24, 0x20,
    0x43, 0x4c, 0x45, 0x41, 0x52, 0x00,
    0x24, 0x20,
    0x42, 0x52, 0x45, 0x41, 0x4b, 0x00,
    0x24, 0x20,
    0x53, 0x48, 0x49, 0x46, 0x54, 0x00,
    0x10, 0x8e, 0xff, 0x00,
    0xa6, 0x21,
    0x84, 0xfb,
    0xa7, 0x21,
    0x6f, 0xa4,
    0x8a, 0x04,
    0xa7, 0x21,
    0xa6, 0x23,
    0x84, 0xfb,
    0xa7, 0x23,
    0xc6, 0xff,
    0xe7, 0x22,
    0x8a, 0x04,
    0xa7, 0x23,
    0x8e, 0x04, 0x00,
    0xcc, 0x20, 0x20,
    0xed, 0x81,
    0x8c, 0x07, 0x00,
    0x2d, 0xf9,
    0x8e, 0x04, 0x20,
    0xce, 0x20, 0x04,
    0xc6, 0x08,
    0xa6, 0xc0,
    0xa7, 0x85,
    0xcb, 0x02,
    0xc1, 0x16,
    0x23, 0xf6,
    0x8c, 0x04, 0xe0,
    0x22, 0x05,
    0x30, 0x88, 0x20,
    0x20, 0xea,
    0x10, 0x8e, 0x05, 0x61,
    0x1f, 0x21,
    0xce, 0x20, 0x44,
    0xa6, 0xc0,
    0x27, 0x04,
    0xa7, 0x80,
    0x20, 0xf8,
    0x31, 0xa8, 0x10,
    0x1f, 0x21,
    0x8c, 0x05, 0xc1,
    0x25, 0xee,
    0x8e, 0x04, 0x26,
    0x1f, 0x12,
    0xc6, 0x08,
    0xf7, 0x20, 0x02,
    0xa7, 0x42,
    0xe6, 0xc4,
    0x53,
    0x27, 0x0c,
    0x58,
    0x30, 0x02,
    0x24, 0x02,
    0x8d, 0x14,
    0x7a, 0x20, 0x02,
    0x26, 0xf4,
    0x31, 0xa8, 0x20,
    0x1f, 0x21,
    0x1a, 0x01,
    0x49,
    0x7a, 0x20, 0x03,
    0x26, 0xdb,
    0x20, 0xca,
    0x34, 0x06,
    0xe6, 0x84,
    0xc8, 0x80,
    0xe7, 0x84,
    0x4f,
    0x4a,
    0x26, 0xfd,
    0xc8, 0x80,
    0xe7, 0x84,
    0x35, 0x86,
    0x39
  ]

  let codeAddress = 0x2000;
  for(let index = 0; index < codePiaTest.length; ++index) {
    memory.write(codeAddress + index, codePiaTest[index]);
  }
  machine.registers.get('S').load(0x7fff);

  const videoAddress = 0x0400;

  const main = (tframe) => {
    window.requestAnimationFrame(main);
    render(Math.floor(tframe / 10));
    context.putImageData(imageData, 0, 0);
  };

  /**
   * run cpu for a fixed number of cycles
   */
  function runClock() {
    let cycles = cyclesPerTick;
    while (cycles-- > 0) {
      machine.cycle();
    }
    // stateReport();
  }

  main(0);
  setInterval(runClock, tick);
};
