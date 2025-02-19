import { CTRMemory } from "libctr";
import { SigilKSMVariable } from "#ksm/ksm-variable";
import { SigilKSMInstruction } from "#ksm/ksm-instruction";
import type { SigilKSMContext, SigilKSMExpression } from "#ksm/ksm-context";
import { SigilKSMOpCode } from "./ksm-opcode";
import exprsizeof from "./ksm-exprsizeof";
import { SigilKSMImport } from "./ksm-import";

class SigilKSMUnsure3Instruction extends SigilKSMInstruction {
  public unknown1: SigilKSMImport;
  public unknown0: SigilKSMVariable;
  public unknown2: SigilKSMVariable;

  public constructor() {
    super();

    this.unknown1 = new SigilKSMImport();
    this.unknown0 = new SigilKSMVariable();
    this.unknown2 = new SigilKSMVariable();
  }

  public override get const(): boolean {
    return false;
  }

  public override get opcode(): number {
    return SigilKSMOpCode.OPCODE_UNSURE3;
  }

  protected _build(buffer: CTRMemory): void {
    buffer.u32(this.unknown0.id);
    buffer.u32(this.unknown1.id);
    buffer.u32(this.unknown2.id);
  }

  protected _parse(buffer: CTRMemory, ctx: SigilKSMContext): void {
    this.unknown0 = ctx.var(buffer.u32());
    this.unknown1 = ctx.im(buffer.u32());
    this.unknown2 = ctx.var(buffer.u32());
  }

  protected override _sizeof(): number {
    return CTRMemory.U32_SIZE * 3;
  }
}

export { SigilKSMUnsure3Instruction, SigilKSMUnsure3Instruction as KSMUnsure3Instruction };
