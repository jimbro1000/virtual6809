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
CPU interaction.

## Processor ##

The CPU emulation is based on a strict read/process/write cpu cycle as detailed in the 
6809 assembly language programming book by Leventhal[1]. The aim is to achieve the same 
instruction timing.

The emulated processor can operate at any clock speed within the limits of the 
supporting hardware allowing for fine-tuning that was not possible with real 
hardware.

So far the instruction set is incomplete and only covers:
 * LD (immediate, direct, extended)
 * ST (direct, extended)
 * JMP
 * ABX
 * ADD
 * SUB and SBC
 * NOP
 * 8 bit CMP (immediate, direct, extended)
 * INC and DEC
 * PSH and PUL
 * JSR
 * RTS

indexed/indirect addressing is not implemented
ALU is partially implemented (add, subtract, add with carry, subtract with carry)

## Video ##

The VDG is not an emulation, it is an approximation of the original hardware to
provide a more palatable experience than the 6847 reference hardware. The 
implication of this is that the multiplexing required to avoid bus contention is
not present.

VDG timing is independent of the actual cpu clock so display artifacts will be
radically different from the real components. The timing can be locked to the 
cpu clock if desired.

## References ##
[1] **6809 Assembly Language Programming**, 1981 by Lance A. Leventhal  
ISBN 0-931988-35-7

[2] **Motorola Semiconductor Technical Data - MC6809**

[3] **[Motorola MC6809-MC6809E 8-Bit Microprocessor Programming Manual](
https://www.maddes.net/m6809pm/sections.htm)**