const each = require('jest-each').default;
const {Keyboard, KeyboardHandler, defaultMap} = require('../../src/keyboard/dragon_keyboard');

describe('it emulates a dragon 32/64 keyboard', () => {
  it('requires a grid of 8x7 keys in the map', () => {
    const keyboard = new Keyboard(defaultMap);
    expect(typeof keyboard).toBe('object');
    expect(keyboard.constructor.name).toBe('Keyboard');
  });

  it('throws an exception if the map is an invalid number of columns', () => {
    expect(() => {new Keyboard( [[],[]]);}).toThrow(EvalError);
  });

  it('throws an exception if the map is an invalid number of rows', () => {
    expect(() => {new Keyboard( [[],[],[],[],[],[],[],[]]);}).toThrow(EvalError);
  });

  describe('turns a set of keys into a rollover map', () => {
    each(
        [
            [[0x13], 0, 0xbf], [[0x42], 2, 0xfb],
        ],
    ).it('accepts a js keycode and unmasks a bit in the result',
        (keycodes, column, expected) => {
          const keyboard = new Keyboard(defaultMap);
          const keySet = new Set(keycodes);
          keyboard.keypress(keySet);
          expect(keyboard.rolloverMap[column]).toBe(expected);
        });
  });
});

describe('it handles javascript keyboard interaction', () => {
  let subject;
  beforeEach(() => {
    subject = new KeyboardHandler(defaultMap);
  });
  it('keeps tracks of key down events', () => {
    const keyEvent = {'keyCode': 0x20};
    expect(subject.keys.size).toBe(0);
    subject.keydown(keyEvent);
    expect(subject.keys.size).toBe(1);
  });

  each(
    [[0x91, 0], [0x20, 1]],
  ).it('ignores unmapped key codes',
      (code, expected) => {
        const keyEvent = {'keyCode': code};
        subject.keydown(keyEvent);
        expect(subject.keys.size).toBe(expected);
      });

  it('removes unpressed keys from the list', () => {
    subject.keys = new Set([0x64,0x65,0x66]);
    subject.keyup({'keyCode': 0x65});
    expect(subject.keys.size).toBe(2);
    expect(subject.keys.has(0x65)).toBeFalsy();
  });

  it('ignores unpressed keys that arent already pressed', () => {
    subject.keys = new Set([0x64,0x65,0x66]);
    subject.keyup({'keyCode': 0x67});
    expect(subject.keys.size).toBe(3);
  });

  it('translates keypresses into a rollover map', () => {
    subject.keydown({'keyCode': 0x41});
    const map = subject.getRollover();
    expect(map[1]).toBe(0xfb);
  });
});
