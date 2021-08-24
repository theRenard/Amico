import './style.css'

import createMemory from './memory/create-memory';
import CPU, { REGISTERS as REG } from './cpu';
import { INSTUCTIONS as INST } from './instructions';

const memory = createMemory(256 * 256);
const writableBytes = new Uint8Array(memory.buffer);

const cpu = new CPU(memory);

let i = 0;

// mov $5151, r1
// mov $4242, r2
//
// psh r1
// psh r1
//
// pop r1
// pop r2

writableBytes[i++] = INST.MOV_LIT_REG;
writableBytes[i++] = 0x51;
writableBytes[i++] = 0x51;
writableBytes[i++] = REG.R1;

writableBytes[i++] = INST.MOV_LIT_REG;
writableBytes[i++] = 0x41;
writableBytes[i++] = 0x41;
writableBytes[i++] = REG.R2;

writableBytes[i++] = INST.PSH_REG;
writableBytes[i++] = REG.R1;

writableBytes[i++] = INST.PSH_REG;
writableBytes[i++] = REG.R2;


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
