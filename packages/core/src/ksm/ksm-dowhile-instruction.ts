import { CTRMemory } from "libctr";
import { SigilKSMInstruction } from "#ksm/ksm-instruction";
import type { SigilKSMContext, SigilKSMExpression } from "#ksm/ksm-context";
import { SigilKSMOpCode } from "./ksm-opcode";
import exprsizeof from "./ksm-exprsizeof";
import { SigilKSMVariable } from "./ksm-variable";

class SigilKSMDoWhileInstruction extends SigilKSMInstruction {
  public unknown0: number;
  public condition: SigilKSMVariable | SigilKSMExpression;

  public constructor() {
    super();

    this.unknown0 = 0;
    this.condition = [];
  }

  public override get const(): boolean {
    return this.condition instanceof SigilKSMVariable;
  }

  public override get opcode(): number {
    return SigilKSMOpCode.OPCODE_DO_WHILE;
  }

  protected _build(buffer: CTRMemory, ctx: SigilKSMContext): void {
    if (this.condition instanceof SigilKSMVariable) {
      buffer.u32(this.condition.id);
    } else {
      ctx.buildExpr(buffer, this.condition);
    }

    buffer.u32(this.unknown0);
  }

  protected _parse(buffer: CTRMemory, ctx: SigilKSMContext): void {
    if (ctx.const) {
      this.condition = ctx.var(buffer.u32());
    } else {
      this.condition = ctx.parseExpr(buffer, null);
    }

    this.unknown0 = buffer.u32();
  }

  protected override _sizeof(): number {
    let sizeof = 0;

    sizeof += CTRMemory.U32_SIZE;
    
    sizeof += Array.isArray(this.condition)
      ? exprsizeof(this.condition)
      : CTRMemory.U32_SIZE;

    return sizeof;
  }
}

export {
  SigilKSMDoWhileInstruction,
  SigilKSMDoWhileInstruction as KSMDoWhileInstruction
};
