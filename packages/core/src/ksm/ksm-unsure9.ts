import { CTRMemory } from "libctr";
import { SigilKSMInstruction } from "#ksm/ksm-instruction";
import type { SigilKSMContext, SigilKSMExpression } from "#ksm/ksm-context";
import { SigilKSMOpCode } from "./ksm-opcode";
import exprsizeof from "./ksm-exprsizeof";

class SigilKSMUnsure9Instruction extends SigilKSMInstruction {
  public unknown0: SigilKSMExpression;

  public constructor() {
    super();

    this.unknown0 = [];
  }

  public override get const(): boolean {
    return false;
  }

  public override get opcode(): number {
    return SigilKSMOpCode.OPCODE_UNSURE9;
  }

  protected _build(buffer: CTRMemory, ctx: SigilKSMContext): void {
    ctx.buildExpr(buffer, this.unknown0);
  }

  protected _parse(buffer: CTRMemory, ctx: SigilKSMContext): void {
    if (ctx.const) {
      throw "bad...";
    }

    this.unknown0 = ctx.parseExpr(buffer, null);
  }

  protected override _sizeof(): number {
    return exprsizeof(this.unknown0);
  }
}

export { SigilKSMUnsure9Instruction, SigilKSMUnsure9Instruction as KSMUnsure9Instruction };
