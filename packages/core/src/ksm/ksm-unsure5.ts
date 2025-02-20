import type { CTRMemory } from "libctr";
import type { SigilKSMContext } from "#ksm/ksm-context";
import { SigilKSMInstruction } from "#ksm/ksm-instruction";
import { SigilKSMOpCode } from "./ksm-opcode";

class SigilKSMUnsure5Instruction extends SigilKSMInstruction {
  public override get const(): boolean {
    return false;
  }

  public override get opcode(): number {
    return SigilKSMOpCode.OPCODE_UNSURE5;
  }

  protected _build(): void {}

  protected _parse(_buffer: CTRMemory, ctx: SigilKSMContext): void {
    if (ctx.const) {
      throw "bad...";
    }
  }
  
  protected override _sizeof(): number {
    return 0;
  }
}

export { SigilKSMUnsure5Instruction, SigilKSMUnsure5Instruction as KSMUnsure5Instruction };
