# Virtual 6809 CHANGELOG #

## Unreleased ##
* Add BIT instructions
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