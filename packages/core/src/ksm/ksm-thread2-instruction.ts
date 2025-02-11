import { CTRMemory } from "libctr";
import { SigilKSMOpCode } from "#ksm/ksm-opcode";
import { SigilKSMImport } from "#ksm/ksm-import";
import { SigilKSMFunction } from "#ksm/ksm-function";
import { SigilKSMVariable } from "#ksm/ksm-variable";
import type { SigilKSMContext } from "#ksm/ksm-context";
import { SigilKSMInstruction } from "#ksm/ksm-instruction";

class SigilKSMThread2Instruction extends SigilKSMInstruction {
  public take: number[];
  public give: SigilKSMVariable[];
  public caller: SigilKSMFunction;
  public callee: SigilKSMImport | SigilKSMFunction;

  public constructor() {
    super();

    this.give = [];
    this.take = [];
    this.callee = new SigilKSMFunction();
    this.caller = new SigilKSMFunction();
  }

  public override get const(): boolean {
    return false;
  }

  public override get opcode(): number {
    return SigilKSMOpCode.OPCODE_THREAD2;
  }

  protected _build(buffer: CTRMemory, ctx: SigilKSMContext): void {
    buffer.u32(this.callee.id);

    for (const take of this.take) {
      buffer.u32(take);
    }

    buffer.u32(SigilKSMOpCode.OPCODE_GET_ARGS_END);

    for (const give of this.give) {
      buffer.u32(give.id);
    }

    buffer.u32(SigilKSMOpCode.OPCODE_CALL_END);

    if (this.callee instanceof SigilKSMFunction) {
      ctx.script.buildFunctionCode(buffer, ctx, this.callee);
    }
  }

  protected _parse(buffer: CTRMemory, ctx: SigilKSMContext): void {
    if (ctx.const) {
      throw "bad...";
    }

    let id = buffer.u32();
    this.callee = ctx.fn(id, true);

    this.take = [];
    id = buffer.u32();

    while (id !== SigilKSMOpCode.OPCODE_GET_ARGS_END) {
      this.take.push(id);
      id = buffer.u32();
    }

    this.give = [];
    id = buffer.u32();

    while (id !== SigilKSMOpCode.OPCODE_CALL_END) {
      this.give.push(ctx.var(id));
      id = buffer.u32();
    }

    if (this.callee instanceof SigilKSMFunction) {
      const absoluteCodeStart =
        ctx.codeOffset +
        CTRMemory.U32_SIZE + // thread 2 opcode
        CTRMemory.U32_SIZE + // callee id
        CTRMemory.U32_SIZE + // give end
        CTRMemory.U32_SIZE + // take end
        this.caller.codeStart + // relative offset to global code start
        this.callee.codeStart + // relative offset to caller's code start
        this.give.length * CTRMemory.U32_SIZE + // give
        this.take.length * CTRMemory.U32_SIZE; // take

      // console.log("OWO", absoluteCodeStart, buffer.offset);

      if (buffer.offset !== absoluteCodeStart) {
        throw "ksm.err_malformed_file";
      }

      this.callee.threadfn = true;

      ctx.script.parseFunctionCode(
        buffer,
        ctx,
        this.callee,
        absoluteCodeStart - ctx.codeOffset
      );
    }
  }

  protected override _sizeof(): number {
    let sizeof = 0;

    sizeof += CTRMemory.U32_SIZE; // callee id
    sizeof += CTRMemory.U32_SIZE * this.give.length; // give
    sizeof += CTRMemory.U32_SIZE * this.take.length; // take

    if (this.callee instanceof SigilKSMFunction) {
      sizeof += this.callee.codesize;
    }

    return sizeof;
  }
}

export {
  SigilKSMThread2Instruction,
  SigilKSMThread2Instruction as KSMThread2Instruction
};
