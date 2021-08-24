import { CpuInterface, Uint16, Uint8 } from ".";
import { INSTUCTIONS as INST } from "./instructions";
import createMemory from "./create-memory";

export enum REGISTERS {
  'IP', 'ACC', 'R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8', 'SP', 'FP'
}


export const registerNames = [
  REGISTERS.IP, REGISTERS.ACC,
  REGISTERS.R1, REGISTERS.R2, REGISTERS.R3, REGISTERS.R4,
  REGISTERS.R5, REGISTERS.R6, REGISTERS.R7, REGISTERS.R8,
  REGISTERS.SP, REGISTERS.FP,
] as const;

export type RegisterNames = typeof registerNames[number];
export type RegisterMap = { [name in RegisterNames]: Uint8 };

export default class CPU implements CpuInterface {
  memory: DataView;
  registerNames = registerNames;
  registers: DataView;
  registerMap: RegisterMap;
  constructor(memory: DataView) {
    this.memory = memory;

    this.registers = createMemory(this.registerNames.length * 2);

    this.registerMap = this.registerNames.reduce((map, name, i) => {
      (map as RegisterMap)[name] = i * 2;
      return map;
    }, {} as RegisterMap);

    this.setRegister(REGISTERS.SP, memory.byteLength - 1 - 1);
    this.setRegister(REGISTERS.FP, memory.byteLength - 1 - 1);
  }

  debug() {
    console.log('cycle ↓');
    const debug: string[] = [];
    this.registerNames.forEach((name) => {
      debug.push(`${REGISTERS[name]}: 0x${this.getRegister(name).toString(16).padStart(4, '0')}`);
    });
    console.log(debug.join(', '));
  }

  viewMemoryAt(address: Uint16): void {
    const nextEightBytes = Array.from({ length: 8 }, (_, i) =>
      this.memory.getUint8(address + i)
    ).map(v => `0x${v.toString(16).padStart(2, '0')}`);

    console.log(`0x${address.toString(16).padStart(4, '0')} ⇥ ${nextEightBytes.join(' | ')} ⇤`);
  }
  getRegister(name: RegisterNames): Uint8 | Uint16 {
    if (!(name in this.registerMap)) {
      throw new Error(`Invalid register: ${name}`);
    }
    return this.registers.getUint16(this.registerMap[name]);
  }

/**
 *
 * Set the value of a register
 * @param {RegisterNames} name
 * @param {(Uint8 | Uint16)} value
 * @memberof CPU
 */
setRegister(name: RegisterNames, value: Uint8 | Uint16): void {
    if (!(name in this.registerMap)) {
      throw new Error(`Invalid register: ${name}`);
    }
    this.registers.setUint16(this.registerMap[name], value);
  }

  fetch(): Uint8 {
    const nextInstructionAddress = this.getRegister(REGISTERS.IP);
    const instruction = this.memory.getUint8(nextInstructionAddress);
    this.setRegister(REGISTERS.IP, nextInstructionAddress + 1);
    return instruction;
  }

  fetch16(): Uint16 {
    const nextInstructionAddress = this.getRegister(REGISTERS.IP);
    const instruction = this.memory.getUint16(nextInstructionAddress);
    this.setRegister(REGISTERS.IP, nextInstructionAddress + 2);
    return instruction;
  }

  push(value: Uint16): void {
    const stackPointer = this.getRegister(REGISTERS.SP);
    this.memory.setUint16(stackPointer, value);
    this.setRegister(REGISTERS.SP, stackPointer - 2);
  }

  pop(): Uint16 {
    const nextSpAddress = this.getRegister(REGISTERS.SP) + 2;
    this.setRegister(REGISTERS.SP, nextSpAddress);
    return this.memory.getUint16(nextSpAddress);
  }

  fetchRegisterIndex(): Uint8 {
    return (this.fetch() % this.registerNames.length) * 2;
  }

  execute(instruction: Uint8): void {
    switch (instruction) {
      // move literal into register
      case INST.MOV_LIT_REG: {
        const literal = this.fetch16();
        const register = this.fetchRegisterIndex();
        this.registers.setUint16(register, literal);
        return;
      }

      // move register into register
      case INST.MOV_REG_REG: {
        const registerFrom = this.fetchRegisterIndex();
        const registerTo = this.fetchRegisterIndex();
        const value = this.registers.getUint16(registerFrom);
        this.registers.setUint16(registerTo, value);
        return;
      }

      // move register into memory
      case INST.MOV_REG_MEM: {
        const registerFrom = this.fetchRegisterIndex();
        const address = this.fetch16();
        const value = this.registers.getUint16(registerFrom);
        this.memory.setUint16(address, value);
        return;
      }

      // move memory into register
      case INST.MOV_MEM_REG: {
        const address = this.fetch16();
        const registerTo = this.fetchRegisterIndex();
        const value = this.memory.getUint16(address);
        this.registers.setUint16(registerTo, value);
        return;
      }

      // Add register to register
      case INST.ADD_REG_REG: {
        const r1 = this.fetch();
        const r2 = this.fetch();
        const registerValue1 = this.registers.getUint16(r1 * 2);
        const registerValue2 = this.registers.getUint16(r2 * 2);
        this.setRegister(REGISTERS.ACC, registerValue1 + registerValue2);
        return;
      }

      // jump if not equal
      case INST.JMP_NOT_EQ: {
        const value = this.fetch16();
        const address = this.fetch16();

        if (value !== this.getRegister(REGISTERS.ACC)) {
          this.setRegister(REGISTERS.IP, address)
        }

        return;
      }

      // Push value onto stack
      case INST.PSH_LIT: {
        const value = this.fetch16();
        this.push(value);
        return;
      }

      // Push register onto stack
      case INST.PSH_REG: {
        const registerIndex = this.fetchRegisterIndex();
        const value = this.registers.getUint16(registerIndex);
        this.push(value);
        return;
      }

      // Pop value from stack
      case INST.POP: {
        const registerIndex = this.fetchRegisterIndex();
        const value = this.pop();
        this.registers.setUint16(registerIndex, value);
        return;
      }




    }
  }

  step(): void {
    const instruction = this.fetch();
    return this.execute(instruction);
  }
}