import { SigilKSMCallInstruction } from "./ksm-call-instruction";
import { SigilKSMExpression } from "./ksm-context";
import { SigilKSMFunction } from "./ksm-function";
import { SigilKSMImport } from "./ksm-import";
import { SigilKSMVariable } from "./ksm-variable";
import { CTRMemory } from "libctr";

export default function exprsizeof(expr: SigilKSMExpression): number {
  let sizeof = 0;

  for (const part of expr) {
    if (
      part instanceof SigilKSMImport ||
      part instanceof SigilKSMFunction ||
      part instanceof SigilKSMVariable
    ) {
      sizeof += CTRMemory.U32_SIZE;
      continue;
    }

    if (part instanceof SigilKSMCallInstruction) {
      sizeof += CTRMemory.U32_SIZE; // call opcode
    }

    sizeof += part.sizeof;
  }

  sizeof += CTRMemory.U32_SIZE; // end
  return sizeof;
}
