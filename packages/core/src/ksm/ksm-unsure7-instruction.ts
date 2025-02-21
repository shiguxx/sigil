import { CTRMemory } from "libctr";
import type { SigilKSMContext } from "#ksm/ksm-context";
import { SigilKSMInstruction } from "#ksm/ksm-instruction";
import { SigilKSMOpCode } from "./ksm-opcode";
import { SigilKSMVariable } from "./ksm-variable";

class SigilKSMUnsure7Instruction extends SigilKSMInstruction {
  public unknown0: SigilKSMVariable;
  public unknown1: SigilKSMVariable;
  public unknown2: SigilKSMVariable;
  public unknown3: SigilKSMVariable;

  public constructor() {
    super();

    this.unknown0 = new SigilKSMVariable();
    this.unknown1 = new SigilKSMVariable();
    this.unknown2 = new SigilKSMVariable();
    this.unknown3 = new SigilKSMVariable();
  }

  public override get const(): boolean {
    return false;
  }

  public override get opcode(): number {
    return SigilKSMOpCode.OPCODE_UNSURE7;
  }

  protected _build(buffer: CTRMemory): void {
    buffer.u32(this.unknown0.id);
    buffer.u32(this.unknown1.id);
    buffer.u32(this.unknown2.id);
    buffer.u32(this.unknown3.id);
  }

  protected _parse(buffer: CTRMemory, ctx: SigilKSMContext): void {
    if (ctx.const) {
      throw "bad...";
    }

    this.unknown0 = ctx.var(buffer.u32());
    this.unknown1 = ctx.var(buffer.u32());
    this.unknown2 = ctx.var(buffer.u32());
    this.unknown3 = ctx.var(buffer.u32());
  }

  protected override _sizeof(): number {
    return CTRMemory.U32_SIZE * 4;
  }
}

export {
  SigilKSMUnsure7Instruction,
  SigilKSMUnsure7Instruction as KSMUnsure7Instruction
};
