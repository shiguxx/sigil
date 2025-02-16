import { CTRMemory } from "libctr";
import type { SigilKSMContext, SigilKSMExpression } from "#ksm/ksm-context";
import { SigilKSMInstruction } from "#ksm/ksm-instruction";
import { SigilKSMOpCode } from "./ksm-opcode";
import { SigilKSMVariable } from "./ksm-variable";
import exprsizeof from "./ksm-exprsizeof";

class SigilKSMReturnValInstruction extends SigilKSMInstruction {
  public value: SigilKSMVariable | SigilKSMExpression;

  public constructor() {
    super();
    this.value = [];
  }

  public override get const(): boolean {
    return (
      this.value instanceof SigilKSMVariable ||
      (Array.isArray(this.value) && this.value.length === 0)
    );
  }

  public override get opcode(): number {
    return SigilKSMOpCode.OPCODE_RETURNVAL;
  }

  protected _build(buffer: CTRMemory, ctx: SigilKSMContext): void {
    if (this.value instanceof SigilKSMVariable) {
      buffer.u32(this.value.id);
      return;
    }

    ctx.buildExpr(buffer, this.value);
  }

  protected _parse(buffer: CTRMemory, ctx: SigilKSMContext): void {
    if (ctx.const) {
      const id = buffer.u32();

      if (id === 0x40) {
        this.value = [];
        return;
      }

      this.value = ctx.var(id);
      return;
    }

    this.value = ctx.parseExpr(buffer, null);
  }

  protected override _sizeof(): number {
    return Array.isArray(this.value) ? exprsizeof(this.value) : CTRMemory.U32_SIZE;
  }
}

export {
  SigilKSMReturnValInstruction,
  SigilKSMReturnValInstruction as KSMReturnValInstruction
};
