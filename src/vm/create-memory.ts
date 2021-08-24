import { Uint8 } from ".";

const createMemory = (sizeInBytes: Uint8): DataView => {
  const ab = new ArrayBuffer(sizeInBytes);
  const dv = new DataView(ab);
  return dv;
}
export default createMemory;
