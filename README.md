# Virtual 6809 #

This project is a simple emulation of the Motorola 6809 8/16-bit processor in
javascript

In addition to the processor the project emulates the associated memory and 
interface chips that are required to interact with the "outside" world.

The Motorola reference design utilises a 64k memory model, a 6847 VDG, and 6821
PIA chips and while this project can emulate those chips it allows the use of 
other chip designs in the same role.

## Memory ##

The emulation of the memory is performed in blocks associated with specified 
memory address and ranges. For example the first 32k memory block can be 
defined as RAM, the next 16k as ROM, a gap of 8k followed by 8k of hardware 
mapped memory associated with the PIA.

In theory any memory model can be represented.
Memory bank swapping can also be achieved through use of a larger memory model
and appropriate hardware mapping.

For the purposes of emulation access to memory is independent of the clock
cycle allowing video hardware to read paged memory without interfering with the 
CPU interaction. This also means emulation of tri-stating the bus is not required and 
this in-turn means the emulated hardware is capable of some things that the real
CPU cannot do such as what would appear to be DMA actions from peripherals without
syncing the CPU.

## Processor ##

The CPU emulation is based on a strict read/process/write cpu cycle as detailed in the 
6809 assembly language programming book by Leventhal[1]. The aim is to achieve the same 
instruction timing.

The emulated processor can operate at any clock speed within the limits of the 
supporting hardware allowing for fine-tuning that was not possible with real 
hardware.

So far the instruction set is incomplete and only covers:
 * LD
 * ST
 * JMP
 * ABX
 * ADD and ADC
 * DAA
 * SUB and SBC
 * SEX
 * MUL
 * AND, OR, EOR
 * LSL, LSR, ROL and ROR  
 * BIT, COM, NEG
 * NOP
 * 8 bit CMP (immediate, direct, extended)
 * TST
 * INC and DEC
 * PSH and PUL
 * JSR
 * SWI, SWI2, SWI3
 * CWAI, SYNC
 * RTS
 * RTI
 * short branch
 * long branch
 * EXG and TFR
 
ALU is fully implemented but condition logic contained in control 
register not ALU  

The processor bootstraps correctly using the hard reset vector stored at 0xfffe.
If no memory exists at that address it will be interpreted as starting from 
0x0000.

## Video ##

The VDG is not an emulation, it is an approximation of the original hardware to
provide a more palatable experience than the 6847 reference hardware. The 
implication of this is that the multiplexing required to avoid bus contention is
not present.

VDG timing is independent of the actual cpu clock so display artifacts will be
radically different from the real components. The timing can be locked to the 
cpu clock if desired.

## Interaction ##

The project includes a budo'd client side application that simulates the cpu
running at approximately 1MHz

The hardware emulation does NOT include input yet so this is purely a passive
display, if the loaded program does not interact with video memory you will
not see anything happening

## How to Build and Run ##

The project is coded in Javascript using Node.js with budo. The unit tests are
composed using Jest

To "build" the project just copy the source or clone from github
Run NPM install from the project folder

The test suite can be started with `npm test`

To "run" the project use `npm start`

### Modifying the Hardware ###

The default memory hardware is an approximation of the coco/dragon design with a
32k lower RAM and the upper 32k a mix of ROM and mapped addresses (mapping goes
nowhere yet).

Changing `main.js` to alter the memory is simply a matter of changing these lines:

```javascript
const memory = Memory.factory("D64");
const machine = new Cpu(memory);
```

At the moment the memory factory only knows D64 and D4 but it is possible to assemble
a custom model using the memory manager:

```javascript
const memory = new MemoryManager([
  [new Chip(chips.RAM, chips.K32), 0x0000],
  [new Chip(chips.ROM, chips.K4), 0xf000]
]);
const machine = new Cpu(memory);
```
This would provide 4k of RAM at address 0 and a 4k ROM at 61440. Note it is advisable to 
provide a ROM segment at high-end of memory to provision the interrupt vector table.
Without some memory at this space the vector table will provide a 0 for all interrupts.

The composition of the memory (thanks to the vector table and mapped hardware) can be 
messy, but the memory mapping is on a first-come-first-served basis. If you specify an 
area of 256 bytes of mapped memory at 0xff00 and then 32kb of ram at 0x8000 the mapped
memory will take precedence at the high addresses. If you do this the other way around
it will be ram and not mapped.

The maximum expected memory model is 2Mb (the equivalent of using a 6829 MMU to provide
20 address lines) but paging is not implemented so in effect it will still only be 64k
of addressable memory.

## References ##
[1] **6809 Assembly Language Programming**, 1981 by Lance A. Leventhal  
ISBN 0-931988-35-7

[2] **Motorola Semiconductor Technical Data - MC6809**

[3] **[Motorola MC6809-MC6809E 8-Bit Microprocessor Programming Manual](
https://www.maddes.net/m6809pm/sections.htm)**

[4] **[Paul Burgin's 6809 Instructions Crib Sheet](
https://techheap.packetizer.com/processors/6809/6809Instructions.html)**