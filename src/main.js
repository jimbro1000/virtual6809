const Memory = require("./memory/memory_factory.js");
const Font = require("./font.js").halfSet;

window.onload = () => {
    let vdgTranslate = (char, row) => {
        return Font[char * 8 + row % 8];
    }
    let render = (offset) => {
        let memAddress = 0x200;
        let row = 0;
        for (let x = 0; x < width; ++x) {
            for (let y = 0; y < height; ++y) {
                const pixelIndex = (y * width + x) * 4;
                let red = 0
                let blue = 0
                let green = 0
                let alpha = 0
                if (y < 96 || y > 480 || x < 64 || x > 576) {
                    // do nothing, just overscan
                } else {
                    const column = (x - 64) % 8;
                    const row = Math.floor((y - 96) / 8);
                    const charRow = (y - 96) % 8;
                    const screenAddress = memAddress + column + row * 32;
                    const memByte = memory.read(screenAddress);
                    const lookup = vdgTranslate(memByte, charRow);
                    let mask = 0x80 >> (x % 8);
                    if (!(lookup & mask)) {
                        green = 255;
                    }
                }
                imageData.data[pixelIndex] = red;
                imageData.data[pixelIndex + 1] = green;
                imageData.data[pixelIndex + 2] = blue;
                imageData.data[pixelIndex + 3] = 255;
            }
        }
    }

// open page DOM
// define document outline
    const bodyNode = document.body;
    let display = document.createElement('div');
    display.id = "display";
    bodyNode.append(display);
    let canvas = document.createElement("canvas");
    canvas.id = "screen";
    canvas.width = 640;
    canvas.height = 576;
    display.append(canvas);

    const context = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    let imageData = context.createImageData(width, height);

    const memory = Memory.factory("D64");

    const message = "hello world".split("");
    const videoAddress = 0x200;
    let index = videoAddress;
    message.forEach( char => {
        memory.write(index, char.charCodeAt(0));
    });

    let main = (tframe) => {
        window.requestAnimationFrame(main);
        render(Math.floor(tframe / 10));
        context.putImageData(imageData, 0, 0);
    }

    main(0);
}