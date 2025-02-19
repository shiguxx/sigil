import { CTRMemory } from "libctr";
import { SigilKSMVariable } from "#ksm/ksm-variable";
import { SigilKSMInstruction } from "#ksm/ksm-instruction";
import type { SigilKSMContext, SigilKSMExpression } from "#ksm/ksm-context";
import { SigilKSMOpCode } from "./ksm-opcode";
import exprsizeof from "./ksm-exprsizeof";
import { SigilKSMImport } from "./ksm-import";

class SigilKSMUnsure4Instruction extends SigilKSMInstruction {
  public unknown0: SigilKSMVariable;

  public constructor() {
    super();

    this.unknown0 = new SigilKSMVariable();
  }

  public override get const(): boolean {
    return false;
  }

  public override get opcode(): number {
    return SigilKSMOpCode.OPCODE_UNSURE4;
  }

  protected _build(buffer: CTRMemory): void {
    buffer.u32(this.unknown0.id);
  }

  protected _parse(buffer: CTRMemory, ctx: SigilKSMContext): void {
    this.unknown0 = ctx.var(buffer.u32());
  }

  protected override _sizeof(): number {
    return CTRMemory.U32_SIZE * 1;
  }
}

export { SigilKSMUnsure4Instruction, SigilKSMUnsure4Instruction as KSMUnsure4Instruction };
