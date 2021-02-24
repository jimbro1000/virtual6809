# The Dragon/COCO PIAs #

## Introduction ##

The Peripheral Interface Adaptor on the motorola reference design
(as used in the Dragon 32/64 and Tandy CoCo 1/2) is handled by
the M6821 chip - or chips as there are two of them to provide
four distinct ports

Each port provides three registers:

* Peripheral Data Register (PDR)
* Data Direction Register (DDR)
* Control Register (CR)

### Peripheral Data and Data Direction Registers ###
The PDR is a bi-directional 8 bit register bound to the data bus in 
much the same way as the CPU's registers.

Whether the data is input or output is controlled by the DDR.

The PDR and DDR are mapped to a single byte in memory - the same byte
to confuse things. Which register is being addressed is controlled by 
bit 2 of the CR

Beyond those basics the function of the PIAs is specific to how they
are wired and what peripherals are being controlled

## Dragon PIAs ##

Each PIA is mapped to 4 bytes of memory but repeated 8 times to save
on address decoders

PIA 1 is at $ff00 - $ff03 and repeated through to $ff19
PIA 2 is at $ff20 - $ff23 and repeats through to $ff39

| Address | Function | Description |
| ------- | -------- | ----------- |
| $ff00 | PDR0A | PDR/DDR 0A |
| $ff01 | CR0A | Control register 0A |
| $ff02 | PDR0B | PDR/DDR 0B |
| $ff03 | CR0B | Control register 0B |
| $ff20 | PDR1A | PDR/DDR 1A |
| $ff21 | CR1A | Control register 1A |
| $ff22 | PDR1B | PDR/DDR 1B |
| $ff23 | CR1B | Control Register 1B |

PIA 0 is used for keyboard, video sync control and selection 
of joystick channel  
PDR0A provides the result of a row scan with each bit 
representing a column of the keyboard matrix  
PDR0B allows the selection of which row to scan  

CR0A b0, b1 - control horizontal sync clock  
CR0A b2 - DDR/PDR select (0/1) for port A   
CR0A b3 - SEL1 - LSB of analogue MUX select  
CR0A b4, b5 - always 1  
CR0A b6 - not used  
CR0A b7 - horizontal interrupt flag  

CR0B b0, b1 - control of field sync clock  
CR0B b2 - DDR/PDR select (0/1) for port B  
CR0B b3 - SEL2 - MSB of analogue MUX select
CR0B b4, b5 - always 1  
CR0B b6 - not used  
CR0B b7 - field sync interrupt flag  

PIA 1 is used for other IO such as cassette input,
audio output and printer communication  
PDR1A b0 - cassette input  
PDR1A b1 - printer strobe out  
PDR1A b2..b7 - 6-bit A-D input  

PDR1B b0 - printer busy  
PDR1B b1 - single bit sound  
PDR1B b2 - RAM size 0=4k, 1=16k  
PDR1B b3..b7 - VDG control lines
