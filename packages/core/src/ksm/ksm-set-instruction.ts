import { CTRMemory } from "libctr";
import { SigilKSMVariable } from "#ksm/ksm-variable";
import { SigilKSMInstruction } from "#ksm/ksm-instruction";
import type { SigilKSMContext, SigilKSMExpression } from "#ksm/ksm-context";
import { SigilKSMOpCode } from "./ksm-opcode";
import exprsizeof from "./ksm-exprsizeof";

class SigilKSMSetInstruction extends SigilKSMInstruction {
  public assignee: SigilKSMVariable;
  public value: SigilKSMVariable | SigilKSMExpression;

  public constructor() {
    super();

    this.value = [];
    this.assignee = new SigilKSMVariable();
  }

  public override get const(): boolean {
    return this.value instanceof SigilKSMVariable;
  }

  public override get opcode(): number {
    return SigilKSMOpCode.OPCODE_SET;
  }

  protected _build(buffer: CTRMemory, ctx: SigilKSMContext): void {
    buffer.u32(this.assignee.id);

    if (this.value instanceof SigilKSMVariable) {
      this.value.build(buffer, ctx);
      return;
    }

    ctx.expr(buffer, this.value);
  }

  protected _parse(buffer: CTRMemory, ctx: SigilKSMContext): void {
    this.assignee = ctx.var(buffer.u32());

    if (ctx.const) {
      this.value = ctx.var(buffer.u32());
      return;
    }

    this.value = ctx.expr(buffer, null);
  }

  protected override _sizeof(): number {
    let sizeof = 0;

    sizeof += CTRMemory.U32_SIZE; // assignee id
    sizeof += Array.isArray(this.value) ? exprsizeof(this.value) : this.value.sizeof;

    return sizeof;
  }
}

export { SigilKSMSetInstruction, SigilKSMSetInstruction as KSMSetInstruction };
