# Virtual 6809 #

This project is a simple emulation of the Motorola 6809 8/16 bit processor in
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

The CPU emulation is based on a strict read/process/write cycle as detailed in the 
6809 assembly language programming book by Leventhal. The aim is achieve the same 
instruction timing.

The emulated processor can operate at any clock speed within the limits of the 
supporting hardware allowing for fine-tuning that was not possible with real 
hardware.

## Video ##

The VDG is not an emulation, it is an approximation of the original hardware to
provide a more palatable experience than the 6847 reference hardware.

VDG timing is independent of the actual cpu clock so display artifacts will be
radically different from the real components. The timing can be locked to the 
cpu clock if desired.
