import { CTRMemory } from "libctr";
import { SigilKSMInstruction } from "#ksm/ksm-instruction";
import type { SigilKSMContext } from "#ksm/ksm-context";
import { SigilKSMOpCode } from "./ksm-opcode";
import { SigilKSMVariable } from "./ksm-variable";

class SigilKSMSwitchInstruction extends SigilKSMInstruction {
  public unknown0: number;
  public unknown1: number;
  public value: SigilKSMVariable;

  public constructor() {
    super();

    this.unknown0 = 0;
    this.unknown1 = 0;
    this.value = new SigilKSMVariable();
  }

  public override get const(): boolean {
    return false;
  }

  public override get opcode(): number {
    return SigilKSMOpCode.OPCODE_SWITCH;
  }

  protected _build(buffer: CTRMemory): void {
    buffer.u32(this.value.id);
    buffer.u32(this.unknown0);
    buffer.u32(this.unknown1);
  }

  protected _parse(buffer: CTRMemory, ctx: SigilKSMContext): void {
    if (ctx.const) {
      throw "bad...";
    }

    this.value = ctx.var(buffer.u32());
    this.unknown0 = buffer.u32();
    this.unknown1 = buffer.u32();
  }

  protected override _sizeof(): number {
    return CTRMemory.U32_SIZE * 3;
  }
}

export { SigilKSMSwitchInstruction, SigilKSMSwitchInstruction as KSMSwitchInstruction };
