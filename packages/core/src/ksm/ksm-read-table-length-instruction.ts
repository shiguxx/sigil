import { CTRMemory } from "libctr";
import { SigilKSMInstruction } from "#ksm/ksm-instruction";
import type { SigilKSMContext } from "#ksm/ksm-context";
import { SigilKSMOpCode } from "./ksm-opcode";
import { SigilKSMTable } from "./ksm-table";

class SigilKSMReadTableLengthInstruction extends SigilKSMInstruction {
  public table: SigilKSMTable;

  public constructor() {
    super();
    this.table = new SigilKSMTable();
  }

  public override get const(): boolean {
    return false;
  }

  public override get opcode(): number {
    return SigilKSMOpCode.OPCODE_READ_TABLE_LENGTH;
  }

  protected _build(buffer: CTRMemory): void {
    buffer.u32(this.table.id);
  }

  protected _parse(buffer: CTRMemory, ctx: SigilKSMContext): void {
    this.table = ctx.ta(buffer.u32());
  }

  protected override _sizeof(): number {
    return CTRMemory.U32_SIZE;
  }
}

export {
  SigilKSMReadTableLengthInstruction,
  SigilKSMReadTableLengthInstruction as KSMReadTableLengthInstruction
};
