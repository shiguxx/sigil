import { CTRMemory } from "libctr";
import { SigilKSMInstruction } from "#ksm/ksm-instruction";
import type { SigilKSMContext, SigilKSMExpression } from "#ksm/ksm-context";
import { SigilKSMOpCode } from "./ksm-opcode";
import exprsizeof from "./ksm-exprsizeof";

class SigilKSMIfInstruction extends SigilKSMInstruction {
  public unknown0: number;
  public unknown1: number;
  public unknown2: number;
  public condition: SigilKSMExpression;

  public constructor() {
    super();

    this.unknown0 = 0;
    this.unknown1 = 0;
    this.unknown2 = 0;
    this.condition = [];
  }

  public override get const(): boolean {
    return false;
  }

  public override get opcode(): number {
    return SigilKSMOpCode.OPCODE_IF;
  }

  protected _build(buffer: CTRMemory, ctx: SigilKSMContext): void {
    ctx.expr(buffer, this.condition);
    buffer.u32(this.unknown0);
    buffer.u32(this.unknown1);
    buffer.u32(this.unknown2);
  }

  protected _parse(buffer: CTRMemory, ctx: SigilKSMContext): void {
    if (ctx.const) {
      throw "bad...";
    }

    this.condition = ctx.expr(buffer, null);
    this.unknown0 = buffer.u32();
    this.unknown1 = buffer.u32();
    this.unknown2 = buffer.u32();
  }

  protected override _sizeof(): number {
    let sizeof = 0;

    sizeof += CTRMemory.U32_SIZE * 3;
    sizeof += exprsizeof(this.condition);

    return sizeof;
  }
}

export { SigilKSMIfInstruction, SigilKSMIfInstruction as KSMIfInstruction };
