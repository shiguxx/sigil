import { CTRMemory } from "libctr";
import type { SigilKSMContext } from "#ksm/ksm-context";
import { SigilKSMInstruction } from "#ksm/ksm-instruction";
import { SigilKSMLabel } from "#ksm/ksm-label";
import { SigilKSMOpCode } from "./ksm-opcode";

class SigilKSMGotoInstruction extends SigilKSMInstruction {
  public label: SigilKSMLabel;

  public constructor() {
    super();
    this.label = new SigilKSMLabel();
  }

  public override get const(): boolean {
    return false;
  }

  public override get opcode(): number {
    return SigilKSMOpCode.OPCODE_GOTO;
  }

  protected _build(buffer: CTRMemory): void {
    buffer.u32(this.label.id);
  }

  protected _parse(buffer: CTRMemory, ctx: SigilKSMContext): void {
    if (ctx.const) {
      throw "bad...";
    }

    this.label = ctx.label(buffer.u32());
  }

  protected override _sizeof(): number {
    return CTRMemory.U32_SIZE;
  }
}

export { SigilKSMGotoInstruction, SigilKSMGotoInstruction as KSMGotoInstruction };
