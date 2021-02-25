const each = require('jest-each').default;
const {Keyboard, defaultMap} = require('../../src/keyboard/dragon_keyboard');

describe('it emulates a dragon 32/64 keyboard', () => {
  it('requires a grid of 8x7 keys in the map', () => {
    const keyboard = new Keyboard(defaultMap);
    expect(typeof keyboard).toBe('object');
    expect(keyboard.constructor.name).toBe('Keyboard');
  });

  it('throws an exception if the map is an invalid size', () => {
    expect(() => {new Keyboard( [[],[]]);}).toThrow(EvalError);
  });

  describe('turns a keypress into a rollover map', () => {
    each(
        [
            [0x13, 0, 0xbf], [0x41, 1, 0xfb],
        ],
    ).it('accepts a js keycode and unmasks a bit in the result',
        (keycode, column, expected) => {
          const keyboard = new Keyboard(defaultMap);
          const rollover = keyboard.keypress(keycode);
          expect(rollover[column]).toBe(expected);
        });
  });
});
