import { CTRMemory } from "libctr";
import { SigilKSMVariable } from "#ksm/ksm-variable";
import { SigilKSMInstruction } from "#ksm/ksm-instruction";
import type { SigilKSMContext, SigilKSMExpression } from "#ksm/ksm-context";
import { SigilKSMOpCode } from "./ksm-opcode";
import exprsizeof from "./ksm-exprsizeof";

class SigilKSMWaitCompletedInstruction extends SigilKSMInstruction {
  public runtime: SigilKSMVariable | SigilKSMExpression;

  public constructor() {
    super();
    this.runtime = [];
  }

  public override get const(): boolean {
    return this.runtime instanceof SigilKSMVariable;
  }

  public override get opcode(): number {
    return SigilKSMOpCode.OPCODE_WAIT_COMPLETED;
  }

  protected _build(buffer: CTRMemory, ctx: SigilKSMContext): void {
    if (this.runtime instanceof SigilKSMVariable) {
      buffer.u32(this.runtime.id);
      return;
    }

    ctx.buildExpr(buffer, this.runtime);
  }

  protected _parse(buffer: CTRMemory, ctx: SigilKSMContext): void {
    if (ctx.const) {
      this.runtime = ctx.var(buffer.u32());
      return;
    }

    this.runtime = ctx.parseExpr(buffer, null);
  }

  protected override _sizeof(): number {
    return Array.isArray(this.runtime)
      ? exprsizeof(this.runtime)
      : CTRMemory.U32_SIZE;
  }
}

export {
  SigilKSMWaitCompletedInstruction,
  SigilKSMWaitCompletedInstruction as KSMWaitCompletedInstruction
};
