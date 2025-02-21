import { CTRMemory } from "libctr";
import { SigilKSMInstruction } from "#ksm/ksm-instruction";
import type { SigilKSMContext } from "#ksm/ksm-context";
import { SigilKSMOpCode } from "./ksm-opcode";
import { SigilKSMTable } from "./ksm-table";
import { SigilKSMVariable } from "./ksm-variable";

class SigilKSMGetIndexInstruction extends SigilKSMInstruction {
  public table: SigilKSMTable;
  public occurence: SigilKSMVariable;
  public variable: SigilKSMVariable;

  public constructor() {
    super();

    this.variable = new SigilKSMVariable();
    this.occurence = new SigilKSMVariable();
    this.table = new SigilKSMTable();
  }

  public override get const(): boolean {
    return false;
  }

  public override get opcode(): number {
    return SigilKSMOpCode.OPCODE_GET_INDEX;
  }

  protected _build(buffer: CTRMemory): void {
    buffer.u32(this.table.id);
    buffer.u32(this.occurence.id);
    buffer.u32(this.variable.id);
  }

  protected _parse(buffer: CTRMemory, ctx: SigilKSMContext): void {
    this.table = ctx.ta(buffer.u32());
    this.occurence = ctx.var(buffer.u32());
    this.variable = ctx.var(buffer.u32());
  }

  protected override _sizeof(): number {
    return CTRMemory.U32_SIZE * 3;
  }
}

export {
  SigilKSMGetIndexInstruction,
  SigilKSMGetIndexInstruction as KSMGetIndexInstruction
};
