import { CTRMemory } from "libctr";
import { SigilKSMInstruction } from "#ksm/ksm-instruction";
import type { SigilKSMContext, SigilKSMExpression } from "#ksm/ksm-context";
import { SigilKSMOpCode } from "./ksm-opcode";
import exprsizeof from "./ksm-exprsizeof";

class SigilKSMUnsure2Instruction extends SigilKSMInstruction {
  public unknown: SigilKSMExpression;

  public constructor() {
    super();
    this.unknown = [];
  }

  public override get const(): boolean {
    return this.unknown.length === 0;
  }

  public override get opcode(): number {
    return SigilKSMOpCode.OPCODE_UNSURE2;
  }

  protected _build(buffer: CTRMemory, ctx: SigilKSMContext): void {
    ctx.buildExpr(buffer, this.unknown);
  }

  protected _parse(buffer: CTRMemory, ctx: SigilKSMContext): void {
    this.unknown = ctx.parseExpr(buffer, null);
  }

  protected override _sizeof(): number {
    return exprsizeof(this.unknown);
  }
}

export {
  SigilKSMUnsure2Instruction,
  SigilKSMUnsure2Instruction as KSMUnsure2Instruction
};
