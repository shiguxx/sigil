import { CTRMemory } from "libctr";
import { SigilKSMVariable } from "#ksm/ksm-variable";
import { SigilKSMInstruction } from "#ksm/ksm-instruction";
import type { SigilKSMContext } from "#ksm/ksm-context";
import { SigilKSMOpCode } from "./ksm-opcode";

class SigilKSMDeleteRuntimeInstruction extends SigilKSMInstruction {
  public runtime: SigilKSMVariable;

  public constructor() {
    super();
    this.runtime = new SigilKSMVariable();
  }

  public override get const(): boolean {
    return false;
  }

  public override get opcode(): number {
    return SigilKSMOpCode.OPCODE_DELETE_RUNTIME;
  }

  protected _build(buffer: CTRMemory): void {
    buffer.u32(this.runtime.id);
  }

  protected _parse(buffer: CTRMemory, ctx: SigilKSMContext): void {
    this.runtime = ctx.var(buffer.u32());
  }

  protected override _sizeof(): number {
    return CTRMemory.U32_SIZE;
  }
}

export {
  SigilKSMDeleteRuntimeInstruction,
  SigilKSMDeleteRuntimeInstruction as KSMDeleteRuntimeInstruction
};
