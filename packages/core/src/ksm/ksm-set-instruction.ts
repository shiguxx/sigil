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
    if (Array.isArray(this.value) && this.value.length === 0) {
      return true;
    }

    return this.value instanceof SigilKSMVariable;
  }

  public override get opcode(): number {
    return SigilKSMOpCode.OPCODE_SET;
  }

  protected _build(buffer: CTRMemory, ctx: SigilKSMContext): void {
    buffer.u32(this.assignee.id);

    if (this.value instanceof SigilKSMVariable) {
      buffer.u32(this.value.id);
      return;
    }

    ctx.buildExpr(buffer, this.value);
  }

  protected _parse(buffer: CTRMemory, ctx: SigilKSMContext): void {
    this.assignee = ctx.var(buffer.u32());

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
    let sizeof = 0;

    sizeof += CTRMemory.U32_SIZE; // assignee id
    sizeof += Array.isArray(this.value)
      ? exprsizeof(this.value)
      : CTRMemory.U32_SIZE;

    return sizeof;
  }
}

export { SigilKSMSetInstruction, SigilKSMSetInstruction as KSMSetInstruction };
