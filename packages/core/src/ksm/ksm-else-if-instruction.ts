import { CTRMemory } from "libctr";
import { SigilKSMInstruction } from "#ksm/ksm-instruction";
import type { SigilKSMContext, SigilKSMExpression } from "#ksm/ksm-context";
import { SigilKSMOpCode } from "./ksm-opcode";
import exprsizeof from "./ksm-exprsizeof";

class SigilKSMElseIfInstruction extends SigilKSMInstruction {
  public unknown0: number;
  public unknown1: number;
  public unknown2: number;
  public unknown3: number;
  public unknown4: number;
  public condition: SigilKSMExpression;

  public constructor() {
    super();

    this.unknown0 = 0;
    this.unknown1 = 0;
    this.unknown2 = 0;
    this.unknown3 = 0;
    this.unknown4 = 0;
    this.condition = [];
  }

  public override get const(): boolean {
    return false;
  }

  public override get opcode(): number {
    return SigilKSMOpCode.OPCODE_ELSE_IF;
  }

  protected _build(buffer: CTRMemory, ctx: SigilKSMContext): void {
    buffer.u32(this.unknown0);
    buffer.u32(this.unknown1);
    ctx.expr(buffer, this.condition);
    buffer.u32(this.unknown2);
    buffer.u32(this.unknown3);
    buffer.u32(this.unknown4);
  }

  protected _parse(buffer: CTRMemory, ctx: SigilKSMContext): void {
    if (ctx.const) {
      throw "bad...";
    }

    this.unknown0 = buffer.u32();
    this.unknown1 = buffer.u32();
    this.condition = ctx.expr(buffer, null);
    this.unknown2 = buffer.u32();
    this.unknown3 = buffer.u32();
    this.unknown4 = buffer.u32();
  }

  protected override _sizeof(): number {
    let sizeof = 0;

    sizeof += CTRMemory.U32_SIZE * 5;
    sizeof += exprsizeof(this.condition);

    return sizeof;
  }
}

export {
  SigilKSMElseIfInstruction,
  SigilKSMElseIfInstruction as KSMElseIfInstruction
};
