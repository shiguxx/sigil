import { CTRMemory } from "libctr";
import { SigilKSMInstruction } from "#ksm/ksm-instruction";
import type { SigilKSMContext, SigilKSMExpression } from "#ksm/ksm-context";
import { SigilKSMVariable } from "#ksm/ksm-variable";
import { SigilKSMOpCode } from "./ksm-opcode";
import exprsizeof from "./ksm-exprsizeof";

type SigilKSMWaitTime = SigilKSMVariable | SigilKSMExpression;

class SigilKSMWaitInstruction extends SigilKSMInstruction {
  public time: SigilKSMWaitTime;

  public constructor() {
    super();
    this.time = [];
  }

  public override get const(): boolean {
    return this.time instanceof SigilKSMVariable;
  }

  public override get opcode(): number {
    return SigilKSMOpCode.OPCODE_WAIT;
  }

  protected _build(buffer: CTRMemory, ctx: SigilKSMContext): void {
    if (this.time instanceof SigilKSMVariable) {
      buffer.u32(this.time.id);
      return;
    }

    ctx.buildExpr(buffer, this.time);
  }

  protected _parse(buffer: CTRMemory, ctx: SigilKSMContext): void {
    if (ctx.const) {
      this.time = ctx.var(buffer.u32());
      return;
    }

    this.time = ctx.parseExpr(buffer, null);
  }

  protected override _sizeof(): number {
    return Array.isArray(this.time) ? exprsizeof(this.time) : CTRMemory.U32_SIZE;
  }
}

export { SigilKSMWaitInstruction, SigilKSMWaitInstruction as KSMWaitInstruction };
export type { SigilKSMWaitTime, SigilKSMWaitTime as KSMWaitTime };
