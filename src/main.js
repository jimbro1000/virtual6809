const Memory = require('./memory/memory_factory.js');
const {Cpu} = require('./cpu/cpu.js');
const Font = require('./font.js').halfSet;

const displayWidth = 640;
const displayHeight = 480;
const screenWidth = 256;
const screenHeight = 192;
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

  const memory = Memory.factory('A64');
  const machine = new Cpu(memory);
  const cyclesPerTick = 1000;
  const tick = 1; // milliseconds

  // set entry vector to 0x2000
  memory.burn(0xfffe, 0x20);
  // simple program cycle the thirty-second byte of video memory
  memory.write(0x2000, 0xb6);
  memory.write(0x2001, 0x04);
  memory.write(0x2002, 0x20);
  memory.write(0x2003, 0x4c);
  memory.write(0x2004, 0xb7);
  memory.write(0x2005, 0x04);
  memory.write(0x2006, 0x20);
  memory.write(0x2007, 0x20);
  memory.write(0x2008, 0xf7);

  const message = 'HeLlO wOrLd'.split('');
  const videoAddress = 0x400;
  let index = 0x400;
  message.forEach((char) => {
    memory.write(index++, char.charCodeAt(0));
  });

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
