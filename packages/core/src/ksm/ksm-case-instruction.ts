import { CTRMemory } from "libctr";
import { SigilKSMInstruction } from "#ksm/ksm-instruction";
import type { SigilKSMContext, SigilKSMExpression } from "#ksm/ksm-context";
import { SigilKSMOpCode } from "./ksm-opcode";
import { SigilKSMVariable } from "./ksm-variable";
import exprsizeof from "./ksm-exprsizeof";

class SigilKSMCaseInstruction extends SigilKSMInstruction {
  public unknown0: number;
  public value: SigilKSMExpression | SigilKSMVariable;

  public constructor() {
    super();

    this.unknown0 = 0;
    this.value = new SigilKSMVariable();
  }

  public override get const(): boolean {
    return false;
  }

  public override get opcode(): number {
    return SigilKSMOpCode.OPCODE_CASE;
  }

  protected _build(buffer: CTRMemory, ctx: SigilKSMContext): void {
    if (Array.isArray(this.value)) {
      ctx.buildExpr(buffer, this.value);
    } else {
      buffer.u32(this.value.id);
    }

    buffer.u32(this.unknown0);
  }

  protected _parse(buffer: CTRMemory, ctx: SigilKSMContext): void {
    if (ctx.const) {
      throw "bad...";
    }

    this.value = ctx.var(buffer.u32());
    this.unknown0 = buffer.u32();
  }

  protected override _sizeof(): number {
    return (
      CTRMemory.U32_SIZE +
      (Array.isArray(this.value) ? exprsizeof(this.value) : CTRMemory.U32_SIZE)
    );
  }
}

export { SigilKSMCaseInstruction, SigilKSMCaseInstruction as KSMCaseInstruction };
