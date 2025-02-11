import { CTRMemory } from "libctr";
import { SigilKSMFunction } from "#ksm/ksm-function";
import type { SigilKSMContext } from "#ksm/ksm-context";
import type { SigilKSMVariable } from "#ksm/ksm-variable";
import { SigilKSMInstruction } from "#ksm/ksm-instruction";
import { SigilKSMOpCode } from "#ksm/ksm-opcode";

class SigilKSMGetArgsInstruction extends SigilKSMInstruction {
  public fn: SigilKSMFunction;
  public readonly arguments: SigilKSMVariable[];

  public constructor() {
    super();

    this.arguments = [];
    this.fn = new SigilKSMFunction();
  }

  public override get const(): boolean {
    return false;
  }

  public override get opcode(): number {
    return SigilKSMOpCode.OPCODE_GET_ARGS;
  }

  protected _build(buffer: CTRMemory): void {
    buffer.u32(this.fn.id);

    for (const argument of this.arguments) {
      buffer.u32(argument.id);
    }

    buffer.u32(SigilKSMOpCode.OPCODE_GET_ARGS_END);
  }

  protected _parse(buffer: CTRMemory, ctx: SigilKSMContext): void {
    if (ctx.const) {
      throw "bad...";
    }

    let id = buffer.u32();
    this.fn = ctx.fn(id, false);

    id = buffer.u32();

    while (id !== SigilKSMOpCode.OPCODE_GET_ARGS_END) {
      this.arguments.push(ctx.var(id));
      id = buffer.u32();
    }
  }

  protected override _sizeof(): number {
    let sizeof = 0;

    sizeof += CTRMemory.U32_SIZE; // id
    sizeof += this.arguments.length * CTRMemory.U32_SIZE; // each variable id
    sizeof += CTRMemory.U32_SIZE; // end

    return sizeof;
  }
}

export {
  SigilKSMGetArgsInstruction,
  SigilKSMGetArgsInstruction as KSMGetArgsInstruction
};
