const Memory = require('./memory/memory_factory.js');
const {Cpu} = require('./cpu/cpu.js');
const Font = require('./font.js').halfSet;

const displayWidth = 720;
const displayHeight = 568;
const screenWidth = 320;
const screenHeight = 240;
const zoom = 2;

window.onload = () => {
  const vdgTranslate = (char, row) => {
    const fontIndex = char * 8 + row % 8;
    return Font[fontIndex];
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
          const screenAddress = videoAddress + column + row * 40;
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
  const cyclesPerTick = 1000;
  const tick = 1; // milliseconds

  // set entry vector to 0x2000
  memory.burn(0xfffe, 0x20);
  // // simple program cycle the thirty-second byte of video memory

  const codeCycle = [
    0x86, 0x87,
    0x8b, 0xaa,
    0x24, 0x02,
    0x86, 0x00,
    0xb7, 0x04, 0x00,
    0x20, 0xf5,
    0x10, 0xce, 0x7f, 0xff, // LDS #$7fff
    0x8e, 0x04, 0x00, // LDX #$0400
    0x8d, 0x10, // BSR +16 (clr)
    0x8d, 0x07, // BSR +7 (message)
    0x30, 0x88, 0x28, // LEAX 40,X
    0x6c, 0x84, // INC ,X
    0x20, 0xfc, // BRA -4
    0x31, 0x8d, 0x00, 0x1e, // LEAY +30, PC
    0x8d, 0x0f, // BSR +15
    0x39, // RTS
    0x34, 0x12, // PSHS A,X
    0x86, 0x20, // LDA #20
    0xa7, 0x80, // STA ,X+
    0x8c, 0x08, 0xb0, // CMPX #$08B0
    0x26, 0xf9, // BNE -6
    0x35, 0x12, // PULS A,X
    0x39, // RTS
    0x34, 0x32, // PSHS A,X,Y
    0xa6, 0xa0, // LDA ,Y+
    0x27, 0x04, // BEQ +10
    0xa7, 0x80, // STA ,X+
    0x20, 0xf8, // BRA -8
    0x35, 0x32, // PULS A,X,Y
    0x39, // RTS
    0x56, 0x49, 0x52, 0x54, 0x55, 0x41, 0x4C, 0x20, 0x36, 0x38,
    0x30, 0x39, 0x20, 0x56, 0x30, 0x2E, 0x34, 0x2E, 0x36, 0x00,
  ];

  const codeAddress = 0x2000;
  for (let index = 0; index < codeCycle.length; ++index) {
    memory.write(codeAddress + index, codeCycle[index]);
  }

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
  }

  main(0);
  setInterval(runClock, tick);
};
