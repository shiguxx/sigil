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
import { SigilKSMUnsure0Instruction } from "./ksm-unsure0";
import { SigilKSMUnsure1Instruction } from "./ksm-unsure1";
import { SigilKSMReturnValInstruction } from "./ksm-returnval-instruction";
import { SigilKSMSwitchInstruction } from "./ksm-switch-instruction";
import { SigilKSMCaseInstruction } from "./ksm-case-instruction";
import { SigilKSMEndSwitchInstruction } from "./ksm-end-switch-instruction";
import { SigilKSMCallAsChildThreadInstruction } from "./ksm-call-as-child-thread-instruction";
import { SigilKSMWaitCompletedInstruction } from "./ksm-wait-completed";
import { SigilKSMDeleteRuntimeInstruction } from "./ksm-delete-runtime-instruction";
import { SigilKSMThreadInstruction } from "./ksm-thread-cmd";
import { SigilKSMDoWhileInstruction } from "./ksm-dowhile-instruction";
import { SigilKSMEndDoWhileInstruction } from "./ksm-end-dowhile-instruction";
import { SigilKSMTable } from "./ksm-table";

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

  public readonly tables: Map<number, SigilKSMTable>;
  public readonly imports: Map<number, SigilKSMImport>;
  public readonly functions: Map<number, SigilKSMFunction>;
  public readonly variables: Map<number, SigilKSMVariable>;

  public constructor() {
    super();

    this.tables = new Map();
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
      case SigilKSMOpCode.OPCODE_THREAD:
        return new SigilKSMThreadInstruction().parse(buffer, ctx);
      case SigilKSMOpCode.OPCODE_THREAD2:
        return new SigilKSMThread2Instruction().parse(buffer, ctx);
      case SigilKSMOpCode.OPCODE_WAIT_MS:
        return new SigilKSMWaitMSInstruction().parse(buffer, ctx);
      case SigilKSMOpCode.OPCODE_GET_ARGS:
        return new SigilKSMGetArgsInstruction().parse(buffer, ctx);
      case SigilKSMOpCode.OPCODE_UNSURE0:
        return new SigilKSMUnsure0Instruction().parse(buffer, ctx);
      case SigilKSMOpCode.OPCODE_UNSURE1:
        return new SigilKSMUnsure1Instruction().parse(buffer, ctx);
      case SigilKSMOpCode.OPCODE_SWITCH:
        return new SigilKSMSwitchInstruction().parse(buffer, ctx);
      case SigilKSMOpCode.OPCODE_CASE:
        return new SigilKSMCaseInstruction().parse(buffer, ctx);
      case SigilKSMOpCode.OPCODE_RETURNVAL:
        return new SigilKSMReturnValInstruction().parse(buffer, ctx);
      case SigilKSMOpCode.OPCODE_END_SWITCH:
        return new SigilKSMEndSwitchInstruction().parse(buffer, ctx);
      case SigilKSMOpCode.OPCODE_CALL_AS_CHILD_THREAD:
        return new SigilKSMCallAsChildThreadInstruction().parse(buffer, ctx);
      case SigilKSMOpCode.OPCODE_WAIT_COMPLETED:
        return new SigilKSMWaitCompletedInstruction().parse(buffer, ctx);
      case SigilKSMOpCode.OPCODE_DELETE_RUNTIME:
        return new SigilKSMDeleteRuntimeInstruction().parse(buffer, ctx);
      case SigilKSMOpCode.OPCODE_DO_WHILE:
        return new SigilKSMDoWhileInstruction().parse(buffer, ctx);
      case SigilKSMOpCode.OPCODE_END_DO_WHILE:
        return new SigilKSMEndDoWhileInstruction().parse(buffer, ctx);
      default:
        throw new Error(
          `unknown instruction 0x${ctx.opcode.toString(16)} at ${buffer.offset}`
        );
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
    size: number,
    noadd?: boolean
  ): void {
    const pushed = ctx.push(fn);
    const start = buffer.offset;

    while (buffer.offset - start < size) {
      const instruction = this.parseInstruction(buffer, pushed);

      if (
        instruction instanceof SigilKSMThreadInstruction ||
        instruction instanceof SigilKSMThread2Instruction
      ) {
        instruction.caller = fn;
      }

      fn.instructions.push(instruction);
    }

    if (!noadd) {
      ctx.seen.add(fn);
    }
  }

  protected override _build(buffer: CTRMemory): void {
    this._fixCodeStartOffsets();

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

    ctx.seen.clear();
    //this._fixJumpToOffsets(this.global, ctx);

    for (const fn of Array.from(this.functions.values()).reverse()) {
      this._fixLabels(fn, ctx);
      this._fixJumpToOffsets(fn, ctx);
    }

    buffer.seek(this._section1);
    this._buildSection1(buffer, ctx);

    buffer.seek(this._section7);
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

  private _fixLabels(fn: SigilKSMFunction, ctx: SigilKSMContext): void {
    let labelCounter = 0;

    for (const instruction of fn.instructions.values()) {
      if (instruction instanceof SigilKSMLabelInstruction) {
        const label = Array.from(fn.labels.values())[labelCounter];

        if (label !== undefined) {
          label.address =
            (instruction.offset! - ctx.codeOffset - CTRMemory.U32_SIZE) / 4;

          labelCounter += 1;
        }
      }
    }
  }

  private _fixCodeStartOffsets(): void {
    const seen = new Set<SigilKSMFunction>();

    let currentCodeOffset = 0;

    for (const fn of Array.from(this.functions.values()).reverse()) {
      fixCodeStartOffset(fn, null);
    }

    function fixCodeStartOffset(
      fn: SigilKSMFunction,
      inst: null | SigilKSMThreadInstruction | SigilKSMThread2Instruction
    ): void {
      if (seen.has(fn)) {
        return;
      }

      fn.codeStart = currentCodeOffset;

      if (inst !== null) {
        currentCodeOffset +=
          CTRMemory.U32_SIZE +
          CTRMemory.U32_SIZE +
          CTRMemory.U32_SIZE +
          CTRMemory.U32_SIZE +
          inst.give.length * CTRMemory.U32_SIZE +
          inst.take.length * CTRMemory.U32_SIZE;
      }

      for (const inst of fn.instructions) {
        if (
          inst instanceof SigilKSMThreadInstruction ||
          inst instanceof SigilKSMThread2Instruction
        ) {
          if (inst.callee instanceof SigilKSMFunction) {
            fixCodeStartOffset(inst.callee, inst);
            continue;
          }
        }

        currentCodeOffset += inst.sizeof + CTRMemory.U32_SIZE;
      }

      fn.codeEnd = currentCodeOffset;
      seen.add(fn);
    }
  }

  private _fixJumpToOffsets(fn: SigilKSMFunction, ctx: SigilKSMContext): void {
    for (const [index, instruction] of fn.instructions.entries()) {
      if (instruction instanceof SigilKSMElseInstruction) {
        let jumpToOffset = 0;
        let depth = 0;

        for (let i = index + 1; i < fn.instructions.length; i++) {
          const nextInstruction = fn.instructions[i]!;

          if (nextInstruction instanceof SigilKSMIfInstruction) {
            depth++;
            continue;
          }
          if (nextInstruction instanceof SigilKSMEndIfInstruction) {
            if (depth <= 0) {
              jumpToOffset = nextInstruction.offset! - ctx.codeOffset;
              break;
            } else {
              depth--;
              continue;
            }
          }
        }

        instruction.unknown0 = jumpToOffset / 4;
      } else if (
        instruction instanceof SigilKSMIfInstruction ||
        instruction instanceof SigilKSMElseIfInstruction
      ) {
        let depth = 0;
        let extraOffset = 2;
        let jumpToOffset = 0;

        for (let i = index + 1; i < fn.instructions.length; i++) {
          const nextInstruction = fn.instructions[i]!;

          if (nextInstruction instanceof SigilKSMIfInstruction) {
            depth++;
            continue;
          }

          if (nextInstruction instanceof SigilKSMEndIfInstruction) {
            if (depth <= 0) {
              jumpToOffset =
                nextInstruction.offset! - ctx.codeOffset - CTRMemory.U32_SIZE;
              extraOffset = 0;
              break;
            } else {
              depth--;
              continue;
            }
          }

          if (
            depth <= 0 &&
            (nextInstruction instanceof SigilKSMElseInstruction ||
              nextInstruction instanceof SigilKSMElseIfInstruction)
          ) {
            jumpToOffset =
              nextInstruction.offset! - ctx.codeOffset + CTRMemory.U32_SIZE;
            break;
          }
        }

        if (instruction instanceof SigilKSMIfInstruction) {
          instruction.unknown1 = jumpToOffset / 4;
        }

        if (instruction instanceof SigilKSMElseIfInstruction) {
          instruction.unknown3 = jumpToOffset / 4;
          instruction.unknown0 = instruction.unknown3 - extraOffset;
        }
      } else if (instruction instanceof SigilKSMSwitchInstruction) {
        let depth = 0;
        let jumpToOffset = 0;
        let jumpToOffset2 = 0;

        for (let i = index + 1; i < fn.instructions.length; i++) {
          const nextInstruction = fn.instructions[i]!;

          if (
            nextInstruction instanceof SigilKSMCaseInstruction &&
            jumpToOffset == 0
          ) {
            jumpToOffset =
              nextInstruction.offset! - ctx.codeOffset - CTRMemory.U32_SIZE;
            continue;
          }
          if (nextInstruction instanceof SigilKSMSwitchInstruction) {
            depth++;
            continue;
          }
          if (nextInstruction instanceof SigilKSMEndSwitchInstruction) {
            if (depth <= 0) {
              jumpToOffset2 =
                nextInstruction.offset! - ctx.codeOffset - CTRMemory.U32_SIZE;

              break;
            } else {
              depth--;
              continue;
            }
          }
        }

        instruction.unknown0 = jumpToOffset2 / 4;
        instruction.unknown1 = jumpToOffset / 4;
      } else if (instruction instanceof SigilKSMCaseInstruction) {
        let jumpToOffset = 0;
        let depth = 0;

        for (let i = index + 1; i < fn.instructions.length; i++) {
          const nextInstruction = fn.instructions[i]!;

          if (nextInstruction instanceof SigilKSMCaseInstruction && depth <= 0) {
            jumpToOffset =
              nextInstruction.offset! - ctx.codeOffset - CTRMemory.U32_SIZE;
            break;
          }
          if (nextInstruction instanceof SigilKSMSwitchInstruction) {
            depth++;
            continue;
          }
          if (nextInstruction instanceof SigilKSMEndSwitchInstruction) {
            if (depth <= 0) {
              jumpToOffset =
                nextInstruction.offset! - ctx.codeOffset - CTRMemory.U32_SIZE;
              break;
            } else {
              depth--;
              continue;
            }
          }
        }

        instruction.unknown0 = jumpToOffset / 4;
      } else if (instruction instanceof SigilKSMDoWhileInstruction) {
        let depth = 0;
        let jumpToOffset2 = 0;

        for (let i = index + 1; i < fn.instructions.length; i++) {
          const nextInstruction = fn.instructions[i]!;

          if (nextInstruction instanceof SigilKSMDoWhileInstruction) {
            depth++;
            continue;
          }

          if (nextInstruction instanceof SigilKSMEndDoWhileInstruction) {
            if (depth <= 0) {
              jumpToOffset2 =
                nextInstruction.offset! - ctx.codeOffset - CTRMemory.U32_SIZE;

              break;
            } else {
              depth--;
              continue;
            }
          }
        }

        instruction.unknown0 = jumpToOffset2 / 4;
      }
    }
  }

  private _buildSection0(buffer: CTRMemory, ctx: SigilKSMContext): void {
    this._section0 = this._buildUnknownSection(buffer, this.unknown0, ctx);
  }

  private _parseSection0(buffer: CTRMemory, ctx: SigilKSMContext): void {
    this._parseUnknownSection(buffer, this.unknown0, this._section1, ctx);
  }

  private _buildSection1(buffer: CTRMemory, ctx: SigilKSMContext): void {
    this._section1 = buffer.offset;
    buffer.u32(this.functions.size);

    for (const fn of this.functions.values()) {
      fn.build(buffer, ctx);
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
    buffer.u32(this.tables.size);

    for (const table of this.tables.values()) {
      table.build(buffer, ctx);
    }
  }

  private _parseSection3(buffer: CTRMemory, ctx: SigilKSMContext): void {
    const count = buffer.u32();

    for (let i = 0; i < count; i += 1) {
      const table = new SigilKSMTable().parse(buffer, ctx);
      this.tables.set(table.id, table);
    }
  }

  private _buildSection4(buffer: CTRMemory, ctx: SigilKSMContext): void {
    this._section4 = this._buildVariableSection(buffer, "const", ctx);
  }

  private _parseSection4(buffer: CTRMemory, ctx: SigilKSMContext): void {
    this._parseVariableSection(buffer, "const", ctx);
  }

  private _buildSection5(buffer: CTRMemory, ctx: SigilKSMContext): void {
    const imports = Array.from(this.imports.values());
    imports.sort((a, b) => b.id - a.id);

    this._section5 = buffer.offset;
    buffer.u32(imports.length);

    for (const im of imports) {
      im.build(buffer, ctx);
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

  private _parseTableValues(
    buffer: CTRMemory,
    ctx: SigilKSMContext,
    table: SigilKSMTable
  ): void {
    if (ctx.seen.has(table)) {
      throw "what are you doing lil bro?";
    }

    ctx.seen.add(table);

    const opening = buffer.u32();

    if (opening !== 0x63 && opening !== 0x64 && opening !== 0x65) {
      throw new Error("invalid opening code");
    }

    for (let i = 0; i < table.length; i += 1) {
      if (table.type === "int") {
        table.values.push(buffer.i32());
      } else if (table.type === "byte") {
        table.values.push(buffer.u8());
      } else if (table.type === "float") {
        table.values.push(buffer.f32());
      } else if (table.type === "variable") {
        table.values.push(ctx.var(buffer.u32()));
      } else {
        throw new Error("Invalid table type " + table.type);
      }
    }

    if (buffer.u32() !== 0x66) {
      throw new Error("invalid closing code");
    }
  }

  private _parseSection7(buffer: CTRMemory, ctx: SigilKSMContext): void {
    const count = buffer.u32() * 4;
    ctx.codeOffset = buffer.offset;

    const functionsAndTables = Array.from([
      ...this.tables.values(),
      ...this.functions.values()
    ]);

    functionsAndTables.sort((a, b) => {
      const aStart = a instanceof SigilKSMFunction ? a.codeStart : a.startOffset;
      const bStart = b instanceof SigilKSMFunction ? b.codeStart : b.startOffset;

      return aStart - bStart;
    });

    while (ctx.seen.size < functionsAndTables.length) {
      const fnOrTable = functionsAndTables.shift();

      if (fnOrTable === undefined) {
        break;
      }

      const relativeStart =
        fnOrTable instanceof SigilKSMFunction
          ? fnOrTable.codeStart
          : fnOrTable.startOffset;

      const absoluteStart = relativeStart + ctx.codeOffset;

      console.log(
        `PARSING ROUTINE FOR ${fnOrTable.name} (${fnOrTable.constructor.name})`
      );

      console.log(`start: ${absoluteStart} (r: ${relativeStart})`);

      console.log(
        `current: ${buffer.offset} (r: ${buffer.offset - ctx.codeOffset})`
      );

      console.log("\n");

      // were not at the start of this function so parse
      // the code until then into a global function
      if (buffer.offset !== absoluteStart) {
        const globalfn = new SigilKSMFunction();

        globalfn.name = "SIGIL_GLOBAL";
        globalfn.codeStart = buffer.offset - ctx.codeOffset;

        this.parseFunctionCode(
          buffer,
          ctx,
          globalfn,
          absoluteStart - buffer.offset,
          true
        );
      }

      if (buffer.offset !== absoluteStart) {
        throw "what?";
      }

      if (fnOrTable instanceof SigilKSMFunction) {
        this.parseFunctionCode(
          buffer,
          ctx,
          fnOrTable,
          fnOrTable.codeEnd - fnOrTable.codeStart
        );

        continue;
      }

      this._parseTableValues(buffer, ctx, fnOrTable);
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

    const variables = Array.from(this.variables.values())
      .filter((v) => v.scope === scope)
      .sort((a, b) => b.id - a.id);

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
