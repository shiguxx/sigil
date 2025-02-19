import { CTRMemory } from "libctr";
import { SigilKSMLabel } from "#ksm/ksm-label";
import { SigilKSMTable } from "#ksm/ksm-table";
import { SigilKSMVariable } from "#ksm/ksm-variable";
import type { SigilKSMContext } from "#ksm/ksm-context";
import { SigilKSMNamedCommand } from "#ksm/ksm-named-command";
import type { SigilKSMInstruction } from "#ksm/ksm-instruction";

class SigilKSMFunction extends SigilKSMNamedCommand {
  public id: number;
  public public: boolean;
  public codeEnd: number;
  public unknown0: number;
  public unknown1: number;
  public unknown2: number;
  public codeStart: number;

  public threadfn: boolean;
  public readonly labels: Map<number, SigilKSMLabel>;
  public readonly tables: Map<number, SigilKSMTable>;
  public readonly instructions: SigilKSMInstruction[];
  public readonly variables: Map<number, SigilKSMVariable>;

  public constructor() {
    super();

    this.id = 0;
    this.codeEnd = 0;
    this.unknown0 = 0;
    this.unknown1 = 0;
    this.unknown2 = 0;
    this.codeStart = 0;
    this.public = false;
    this.threadfn = false;

    this.instructions = [];
    this.labels = new Map();
    this.tables = new Map();
    this.variables = new Map();
  }

  public get codesize(): number {
    const opcodes = this.instructions.length * CTRMemory.U32_SIZE;

    const instructions = this.instructions
      .map((i) => i.sizeof)
      .reduce((prev, curr) => prev + curr, 0);

    return opcodes + instructions;
  }

  protected _build(buffer: CTRMemory, ctx: SigilKSMContext): void {
    buffer.u32(this.name !== null ? 0xffffffff : 0);

    buffer.u32(this.id);
    buffer.u32(Number(this.public));
    buffer.u32(this.unknown0);
    buffer.u32(this.codeStart / 4);
    buffer.u32(this.codeEnd / 4);
    buffer.u32(this.unknown1);
    buffer.u32(this.unknown2);
    this._buildname(buffer);

    buffer.u32(this.variables.size);

    for (const variable of this.variables.values()) {
      variable.build(buffer, ctx);
    }

    // build tables here
    buffer.u32(0x00000000); // 0 tables

    buffer.u32(this.labels.size);

    for (const label of this.labels.values()) {
      label.build(buffer, ctx);
    }
  }

  protected _parse(buffer: CTRMemory, ctx: SigilKSMContext): void {
    const incomprehensible = buffer.u32();

    this.id = buffer.u32();
    this.public = Boolean(buffer.u32());
    this.unknown0 = buffer.u32();
    this.codeStart = buffer.u32() * 4;
    this.codeEnd = buffer.u32() * 4;
    this.unknown1 = buffer.u32();
    this.unknown2 = buffer.u32();
    this._parsename(buffer, incomprehensible);

    const variableCount = buffer.u32();

    for (let i = 0; i < variableCount; i += 1) {
      const variable = new SigilKSMVariable().parse(buffer, ctx);
      variable.scope = "local";

      this.variables.set(variable.id, variable);
    }

    const tableCount = buffer.u32();

    for (let i = 0; i < tableCount; i += 1) {

      const table = new SigilKSMTable().parse(buffer, ctx);
      this.tables.set(table.id, table);
    }

    const labelCount = buffer.u32();

    for (let i = 0; i < labelCount; i += 1) {
      const label = new SigilKSMLabel().parse(buffer, ctx);
      this.labels.set(label.id, label);
    }
  }
}

export { SigilKSMFunction, SigilKSMFunction as KSMFunction };
