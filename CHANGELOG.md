# Virtual 6809 CHANGELOG #

## Unreleased ##

## V0.4.4 - Sept 17 2021 ##
* Update dependencies

## V0.4.3 - Feb 23 2021 ##
* Isolate production start script
* Create local run script (`npm run local`)
* Refactor code to play nicely with webpack

## V0.4.2 - Feb 23 2021 ##
* Change to default port number for Heroku

## V0.4.1 - Feb 23 2021 ##
* Fix byte order on pull pc
* Update sample code on demo

## V0.4.0 - Feb 22 2021 ##
* Add Indexed Direct Addressing
* Add Indexed Indirect Addressing
* Add CLR instructions

## V0.3.0 - Feb 18 2021 ##
__New:__
* Add EXG and TFR instructions
* Add Sign Extend (SEX) instruction
* Add MUL instruction
* Add TST instructions
* Add DAA instruction
* RTI instruction
* SWI instructions
* CWAI and SYNC instructions
* Interrupt handler

__Fixed:__
* Correction to stack alignment on pull

## V0.2.1 (fix) - Feb 13 2021 ##
* Use real semver to fix npm install

## V0.2 - Feb 11 2021 ##
* Add BIT, COM and NEG instructions
* Add shift and rotate instructions
* Add AND, OR, EOR instructions
* Add long branch instructions
* Add missing short branch instructions (BVS and BVC)
* A how to use section in the README
* Simplify and extend memory options

## V0.1.1 - Feb 03 2021 ##
* Fix incorrect operand code for JSR (was using BSR)
* Add BSR (using the right op code)

## V0.1.0 - Feb 03 2021 ##
* Minimal operand set
  * LOAD and SAVE
  * JMP
  * JSR, RTS, PSH and PUL
  * ADD and SUB (with and without carry)
  * INC and DEC
  * CMP (8 bit only)
  * ABX
  * NOP  
* Basic "interactive" client running at approximately 1MHz
  * Performance depends on host hardware but will not exceed 1MHz
* Flexible memory model 
  * 4k, 8k, 16k, 32k or 64k blocks