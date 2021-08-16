import './style.css'

import createMemory from './memory/create-memory';
import CPU, { REGISTERS as REG } from './cpu';
import { INSTUCTIONS as INST } from './instructions';

const memory = createMemory(256 * 256);
const writableBytes = new Uint8Array(memory.buffer);

const cpu = new CPU(memory);

let i = 0;

//  start:
//    mov #0x0100, r1
//    mov  0x0001, r2
//    add r1, r2
//    mov acc, #0x0100
//    jne 0x0003, start:

writableBytes[i++] = INST.MOV_MEM_REG;
writableBytes[i++] = 0x01;
writableBytes[i++] = 0x00;
writableBytes[i++] = REG.R1;

writableBytes[i++] = INST.MOV_LIT_REG;
writableBytes[i++] = 0x01;
writableBytes[i++] = 0x00;
writableBytes[i++] = REG.R2;

writableBytes[i++] = INST.ADD_REG_REG;
writableBytes[i++] = REG.R1;
writableBytes[i++] = REG.R2;

writableBytes[i++] = INST.MOV_MEM_REG;
writableBytes[i++] = REG.ACC;
writableBytes[i++] = 0x01;
writableBytes[i++] = 0x00;

writableBytes[i++] = INST.JMP_NOT_EQ;
writableBytes[i++] = 0x00;
writableBytes[i++] = 0x03;
writableBytes[i++] = 0x00;
writableBytes[i++] = 0x00;

cpu.debug();
cpu.viewMemoryAt(cpu.getRegister(REG.R1));
cpu.viewMemoryAt(0x0100);

cpu.step();
cpu.viewMemoryAt(cpu.getRegister(REG.R1));
cpu.viewMemoryAt(0x0100);


const app = document.querySelector<HTMLDivElement>('#app')!

app.innerHTML = `
  <h1>Hello Vite!</h1>
  <a href="https://vitejs.dev/guide/features.html" target="_blank">Documentation</a>
`
