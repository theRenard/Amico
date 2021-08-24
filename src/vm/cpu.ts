import { CpuInterface, Uint16, Uint8 } from ".";
import instructions from "./instructions";
import createMemory from "./memory/create-memory";

const registerNames = ['ip', 'acc',
'r1', 'r2', 'r3', 'r4',
'r5', 'r6', 'r7', 'r8'] as const;

type RegisterNames = typeof registerNames[number];
type Register = { [name in RegisterNames]: Uint8 };

export default class CPU implements CpuInterface {
  memory: DataView;
  registerNames = registerNames;
  registers: DataView;
  registerMap: Register;
  constructor(memory: DataView) {
    this.memory = memory;

    this.registers = createMemory(this.registerNames.length * 2);

    this.registerMap = this.registerNames.reduce((map, name, i) => {
      (map as Register)[name] = i * 2;
      return map;
    }, {} as Register);
  }

  debug() {
    this.registerNames.forEach((name) => {
      console.log(`${name}: 0x${this.getRegister(name).toString(16).padStart(4, '0')}`);
    });
    console.log('******************');
  }
  getRegister(name: RegisterNames): Uint8 | Uint16 {
    if (!(name in this.registerMap)) {
      throw new Error(`Invalid register: ${name}`);
    }
    return this.registers.getUint16(this.registerMap[name]);
  }

  setRegister(name: RegisterNames, value: Uint8 | Uint16): void {
    if (!(name in this.registerMap)) {
      throw new Error(`Invalid register: ${name}`);
    }
    this.registers.setUint16(this.registerMap[name], value);
  }

  fetch(): Uint8 {
    const nextInstructionAddress = this.getRegister('ip');
    const instruction = this.memory.getUint8(nextInstructionAddress);
    this.setRegister('ip', nextInstructionAddress + 1);
    return instruction;
  }

  fetch16(): Uint16 {
    const nextInstructionAddress = this.getRegister('ip');
    const instruction = this.memory.getUint16(nextInstructionAddress);
    this.setRegister('ip', nextInstructionAddress + 2);
    return instruction;
  }

  execute(instruction: Uint8): void {
    switch (instruction) {
      // move literal into the r1 register
      case instructions.MOV_LIT_R1: {
        const literal = this.fetch16();
        this.setRegister('r1', literal);
        return;
      }
      // move literal into the r2 register
      case instructions.MOV_LIT_R2: {
        const literal = this.fetch16();
        this.setRegister('r2', literal);
        return;
      }
      // Add register to register
      case instructions.ADD_REG_REG: {
        const r1 = this.fetch();
        const r2 = this.fetch();
        const registerValue1 = this.registers.getUint16(r1 * 2);
        const registerValue2 = this.registers.getUint16(r2 * 2);
        debugger;
        this.setRegister('acc', registerValue1 + registerValue2);
        return;
      }
    }
  }

  step(): void {
    const instruction = this.fetch();
    return this.execute(instruction);
  }
}