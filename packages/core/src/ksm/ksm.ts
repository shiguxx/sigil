import { SigilKSMImport } from "#ksm/ksm-import";
import { SigilKSMContext } from "#ksm/ksm-context";
import { SigilKSMFunction } from "#ksm/ksm-function";
import { SigilKSMInstruction } from "#ksm/ksm-instruction";
import { CTRBinarySerializable, CTRMemory } from "libctr";
import { SigilKSMGetArgsInstruction } from "#ksm/ksm-get-args-instruction";
import { SigilKSMVariable, SigilKSMVariableScope } from "#ksm/ksm-variable";
import { SigilKSMSetInstruction } from "#ksm/ksm-set-instruction";
import { SigilKSMOpCode } from "#ksm/ksm-opcode";
import { SigilKSMCallInstruction } from "#ksm/ksm-call-instruction";
import { SigilKSMIfInstruction } from "#ksm/ksm-if-instruction";
import { SigilKSMElseIfInstruction } from "#ksm/ksm-else-if-instruction";
import { SigilKSMEndIfInstruction } from "#ksm/ksm-end-if-instruction";
import { SigilKSMWaitInstruction } from "#ksm/ksm-wait-instruction";
import { SigilKSMReturnInstruction } from "#ksm/ksm-return-instruction";
import { SigilKSMNoOpInstruction } from "#ksm/ksm-noop-cmd";
import { SigilKSMElseInstruction } from "#ksm/ksm-else-instruction";
import { SigilKSMGotoInstruction } from "#ksm/ksm-goto-instruction";
import { SigilKSMThread2Instruction } from "#ksm/ksm-thread2-instruction";
import { SigilKSMWaitMSInstruction } from "#ksm/ksm-wait-ms-instruction";
import { SigilKSMLabelInstruction } from "#ksm/ksm-label-instruction";

class SigilKSM extends CTRBinarySerializable<never> {
  private static readonly MAGIC = new CTRMemory([
    0x4b, 0x53, 0x4d, 0x52, 0x00, 0x03, 0x01, 0x00
  ]);

  private _section0: number;
  private _section1: number;
  private _section2: number;
  private _section3: number;
  private _section4: number;
  private _section5: number;
  private _section6: number;
  private _section7: number;

  public readonly unknown0: number[];
  public readonly unknown1: number[];
  public readonly unknown2: number[];

  public readonly imports: Map<number, SigilKSMImport>;
  public readonly functions: Map<number, SigilKSMFunction>;
  public readonly variables: Map<number, SigilKSMVariable>;

  public constructor() {
    super();

    this.imports = new Map();
    this.functions = new Map();
    this.variables = new Map();

    this._section0 = 0;
    this._section1 = 0;
    this._section2 = 0;
    this._section3 = 0;
    this._section4 = 0;
    this._section5 = 0;
    this._section6 = 0;
    this._section7 = 0;

    this.unknown0 = [];
    this.unknown1 = [];
    this.unknown2 = [];
  }

  public buildInstruction(
    buffer: CTRMemory,
    instruction: SigilKSMInstruction,
    ctx: SigilKSMContext
  ): void {
    ctx.const = instruction.const;
    ctx.opcode = instruction.opcode;

    buffer.u32(ctx.opcode | (ctx.const ? 0x100 : 0));
    instruction.build(buffer, ctx);
  }

  public parseInstruction(
    buffer: CTRMemory,
    ctx: SigilKSMContext
  ): SigilKSMInstruction {
    const raw = buffer.u32();

    ctx.opcode = raw & 0xfffffeff;
    ctx.const = (raw & 0x100) !== 0;

    switch (ctx.opcode) {
      case SigilKSMOpCode.OPCODE_IF:
        return new SigilKSMIfInstruction().parse(buffer, ctx);
      case SigilKSMOpCode.OPCODE_SET:
        return new SigilKSMSetInstruction().parse(buffer, ctx);
      case SigilKSMOpCode.OPCODE_CALL:
        return new SigilKSMCallInstruction().parse(buffer, ctx);
      case SigilKSMOpCode.OPCODE_ELSE:
        return new SigilKSMElseInstruction().parse(buffer, ctx);
      case SigilKSMOpCode.OPCODE_GOTO:
        return new SigilKSMGotoInstruction().parse(buffer, ctx);
      case SigilKSMOpCode.OPCODE_NOOP:
        return new SigilKSMNoOpInstruction().parse(buffer, ctx);
      case SigilKSMOpCode.OPCODE_WAIT:
        return new SigilKSMWaitInstruction().parse(buffer, ctx);
      case SigilKSMOpCode.OPCODE_LABEL:
        return new SigilKSMLabelInstruction().parse(buffer, ctx);
      case SigilKSMOpCode.OPCODE_END_IF:
        return new SigilKSMEndIfInstruction().parse(buffer, ctx);
      case SigilKSMOpCode.OPCODE_RETURN:
        return new SigilKSMReturnInstruction().parse(buffer, ctx);
      case SigilKSMOpCode.OPCODE_ELSE_IF:
        return new SigilKSMElseIfInstruction().parse(buffer, ctx);
      case SigilKSMOpCode.OPCODE_THREAD2:
        return new SigilKSMThread2Instruction().parse(buffer, ctx);
      case SigilKSMOpCode.OPCODE_WAIT_MS:
        return new SigilKSMWaitMSInstruction().parse(buffer, ctx);
      case SigilKSMOpCode.OPCODE_GET_ARGS:
        return new SigilKSMGetArgsInstruction().parse(buffer, ctx);
      default:
        throw new Error("unknown instruction" + ctx.opcode + "at" + buffer.offset);
    }
  }

  public buildFunctionCode(
    buffer: CTRMemory,
    ctx: SigilKSMContext,
    fn: SigilKSMFunction
  ): void {
    if (ctx.seen.has(fn)) {
      return;
    }

    ctx.seen.add(fn);

    for (const instruction of fn.instructions) {
      this.buildInstruction(buffer, instruction, ctx);
    }
  }

  public parseFunctionCode(
    buffer: CTRMemory,
    ctx: SigilKSMContext,
    fn: SigilKSMFunction,
    end: number
  ): void {
    const pushed = ctx.push(fn);

    while (buffer.offset < ctx.codeOffset + end) {
      const instruction = this.parseInstruction(buffer, pushed);

      if (instruction instanceof SigilKSMThread2Instruction) {
        instruction.caller = fn;
      }

      fn.instructions.push(instruction);
    }

    ctx.seen.add(fn);
  }

  protected override _build(buffer: CTRMemory): void {
    const start = buffer.offset;
    const ctx = new SigilKSMContext(this);

    // stuff isn't initialized yet but
    // this leaves space for the header.
    this._buildHeader(buffer);

    this._buildSection0(buffer, ctx);
    this._buildSection1(buffer, ctx);
    this._buildSection2(buffer, ctx);
    this._buildSection3(buffer, ctx);
    this._buildSection4(buffer, ctx);
    this._buildSection5(buffer, ctx);
    this._buildSection6(buffer, ctx);
    this._buildSection7(buffer, ctx);

    buffer.seek(start);
    this._buildHeader(buffer);
  }

  protected override _parse(buffer: CTRMemory): void {
    const ctx = new SigilKSMContext(this);

    for (let i = 0; i < 0x16; i += 1) {
      const variable = new SigilKSMVariable();

      variable.scope = "tmp";
      variable.id = 0x10000100 | i;

      this.variables.set(variable.id, variable);
    }

    this._parseHeader(buffer);
    this._parseSection0(buffer, ctx);
    this._parseSection1(buffer, ctx);
    this._parseSection2(buffer, ctx);
    this._parseSection3(buffer, ctx);
    this._parseSection4(buffer, ctx);
    this._parseSection5(buffer, ctx);
    this._parseSection6(buffer, ctx);
    this._parseSection7(buffer, ctx);
  }

  private _buildHeader(buffer: CTRMemory): void {
    buffer.raw(SigilKSM.MAGIC);
    buffer.u32(this._section0 / 4);
    buffer.u32(this._section1 / 4);
    buffer.u32(this._section2 / 4);
    buffer.u32(this._section3 / 4);
    buffer.u32(this._section4 / 4);
    buffer.u32(this._section5 / 4);
    buffer.u32(this._section6 / 4);
    buffer.u32(this._section7 / 4);
    buffer.u32(0x00000000);
  }

  private _parseHeader(buffer: CTRMemory): void {
    if (!buffer.raw({ count: SigilKSM.MAGIC.length }).equals(SigilKSM.MAGIC)) {
      throw "ksm.err_not_a_ksm_file";
    }

    this._section0 = buffer.u32() * 4;
    this._section1 = buffer.u32() * 4;
    this._section2 = buffer.u32() * 4;
    this._section3 = buffer.u32() * 4;
    this._section4 = buffer.u32() * 4;
    this._section5 = buffer.u32() * 4;
    this._section6 = buffer.u32() * 4;
    this._section7 = buffer.u32() * 4;

    if (buffer.u32() !== 0x00000000) {
      throw "ksm.err_malformed_file";
    }
  }

  private _buildSection0(buffer: CTRMemory, ctx: SigilKSMContext): void {
    this._section0 = this._buildUnknownSection(buffer, this.unknown0, ctx);
  }

  private _parseSection0(buffer: CTRMemory, ctx: SigilKSMContext): void {
    this._parseUnknownSection(buffer, this.unknown0, this._section1, ctx);
  }

  private _buildSection1(buffer: CTRMemory, ctx: SigilKSMContext): void {
    let codeOffset = 0;

    this._section1 = buffer.offset;
    buffer.u32(this.functions.size);

    for (const fn of this.functions.values()) {
      fn.build(buffer, ctx);
      codeOffset += fn.codesize;
    }
  }

  private _parseSection1(buffer: CTRMemory, ctx: SigilKSMContext): void {
    const count = buffer.u32();

    for (let i = 0; i < count; i += 1) {
      const fn = new SigilKSMFunction().parse(buffer, ctx);
      this.functions.set(fn.id, fn);
    }
  }

  private _buildSection2(buffer: CTRMemory, ctx: SigilKSMContext): void {
    this._section2 = this._buildVariableSection(buffer, "static", ctx);
  }

  private _parseSection2(buffer: CTRMemory, ctx: SigilKSMContext): void {
    this._parseVariableSection(buffer, "static", ctx);
  }

  private _buildSection3(buffer: CTRMemory, ctx: SigilKSMContext): void {
    this._section3 = this._buildUnknownSection(buffer, this.unknown1, ctx);
  }

  private _parseSection3(buffer: CTRMemory, ctx: SigilKSMContext): void {
    this._parseUnknownSection(buffer, this.unknown1, this._section4, ctx);
  }

  private _buildSection4(buffer: CTRMemory, ctx: SigilKSMContext): void {
    this._section4 = this._buildVariableSection(buffer, "const", ctx);
  }

  private _parseSection4(buffer: CTRMemory, ctx: SigilKSMContext): void {
    this._parseVariableSection(buffer, "const", ctx);
  }

  private _buildSection5(buffer: CTRMemory, ctx: SigilKSMContext): void {
    this._section5 = buffer.offset;
    buffer.u32(this.imports.size);

    for (const _import of this.imports.values()) {
      _import.build(buffer, ctx);
    }
  }

  private _parseSection5(buffer: CTRMemory, ctx: SigilKSMContext): void {
    const count = buffer.u32();

    for (let i = 0; i < count; i += 1) {
      const _import = new SigilKSMImport().parse(buffer, ctx);
      this.imports.set(_import.id, _import);
    }
  }

  private _buildSection6(buffer: CTRMemory, ctx: SigilKSMContext): void {
    this._section6 = this._buildVariableSection(buffer, "global", ctx);
  }

  private _parseSection6(buffer: CTRMemory, ctx: SigilKSMContext): void {
    this._parseVariableSection(buffer, "global", ctx);
  }

  private _buildSection7(buffer: CTRMemory, ctx: SigilKSMContext): void {
    this._section7 = buffer.offset;

    // count placeholder
    buffer.u32(0x00000000);

    ctx.codeOffset = buffer.offset;

    for (const fn of Array.from(this.functions.values()).reverse()) {
      if (!fn.threadfn) {
        this.buildFunctionCode(buffer, ctx, fn);
      }
    }

    this._buildUnknownSection(buffer, this.unknown2, ctx);

    const diff = buffer.offset - ctx.codeOffset;
    buffer.seek(this._section7).u32(diff / 4);
  }

  private _parseSection7(buffer: CTRMemory, ctx: SigilKSMContext): void {
    const count = buffer.u32() * 4;
    ctx.codeOffset = buffer.offset;

    const functions = Array.from(this.functions.values());

    while (ctx.seen.size < functions.length) {
      const fn = functions.find(
        (fn) => fn.codeStart === buffer.offset - ctx.codeOffset
      );

      if (fn === undefined) {
        throw "ksm.err_malformed_file";
      }

      this.parseFunctionCode(buffer, ctx, fn, fn.codeEnd);
    }

    // capture unknown remaining bytes...
    this._parseUnknownSection(buffer, this.unknown2, buffer.length, ctx);

    if (buffer.offset - ctx.codeOffset !== count) {
      throw "ksm.err_malformed_file";
    }
  }

  private _buildVariableSection(
    buffer: CTRMemory,
    scope: SigilKSMVariableScope,
    ctx: SigilKSMContext
  ): number {
    const offset = buffer.offset;

    const variables = Array.from(this.variables.values()).filter(
      (v) => v.scope === scope
    );

    buffer.u32(variables.length);

    for (const variable of variables) {
      variable.build(buffer, ctx);
    }

    return offset;
  }

  private _parseVariableSection(
    buffer: CTRMemory,
    scope: SigilKSMVariableScope,
    ctx: SigilKSMContext
  ): void {
    const count = buffer.u32();

    for (let i = 0; i < count; i += 1) {
      const variable = new SigilKSMVariable().parse(buffer, ctx);
      variable.scope = scope;

      this.variables.set(variable.id, variable);
    }
  }

  private _buildUnknownSection(
    buffer: CTRMemory,
    data: number[],
    _ctx: SigilKSMContext
  ): number {
    const offset = buffer.offset;

    for (const n of data) {
      buffer.u32(n);
    }

    return offset;
  }

  private _parseUnknownSection(
    buffer: CTRMemory,
    data: number[],
    end: number,
    _ctx: SigilKSMContext
  ): void {
    while (buffer.offset < end) {
      data.push(buffer.u32());
    }
  }
}

export { SigilKSM, SigilKSM as KSM };
