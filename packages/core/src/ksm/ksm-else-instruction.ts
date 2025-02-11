import { CTRMemory } from "libctr";
import type { SigilKSMContext } from "#ksm/ksm-context";
import { SigilKSMInstruction } from "#ksm/ksm-instruction";
import { SigilKSMOpCode } from "./ksm-opcode";

class SigilKSMElseInstruction extends SigilKSMInstruction {
  public unknown0: number;

  public constructor() {
    super();
    this.unknown0 = 0;
  }

  public override get const(): boolean {
    return false;
  }

  public override get opcode(): number {
    return SigilKSMOpCode.OPCODE_ELSE;
  }

  protected _build(buffer: CTRMemory): void {
    buffer.u32(this.unknown0);
  }

  protected _parse(buffer: CTRMemory, ctx: SigilKSMContext): void {
    if (ctx.const) {
      throw "bad...";
    }

    this.unknown0 = buffer.u32();
  }

  protected override _sizeof(): number {
    return CTRMemory.U32_SIZE;
  }
}

export { SigilKSMElseInstruction, SigilKSMElseInstruction as KSMElseInstruction };
