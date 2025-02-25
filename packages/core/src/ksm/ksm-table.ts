import { CTRMemory } from "libctr";
import { SigilKSMNamedCommand } from "#ksm/ksm-named-command";
import { SigilKSMVariable } from "./ksm-variable";

type SigilKSMTableType = "int" | "byte" | "float" | "variable" | number;

class SigilKSMTable extends SigilKSMNamedCommand {
  private static readonly TYPE_INT = 0x00000001;
  private static readonly TYPE_BYTE = 0x00000003;
  private static readonly TYPE_FLOAT = 0x00000002;
  private static readonly TYPE_VARIABLE = 0x00000000;

  public id: number;
  private _type: number;
  public length: number;
  public unknown0: number;
  public startOffset: number;
  public readonly values: (number | SigilKSMVariable)[];

  public constructor() {
    super();
    this._type = 0;

    this.id = 0;
    this.length = 0;
    this.unknown0 = 0;
    this.startOffset = 0;

    this.values = [];
  }

  public get type(): SigilKSMTableType {
    switch (this._type) {
      case SigilKSMTable.TYPE_INT:
        return "int";
      case SigilKSMTable.TYPE_BYTE:
        return "byte";
      case SigilKSMTable.TYPE_FLOAT:
        return "float";
      case SigilKSMTable.TYPE_VARIABLE:
        return "variable";
      default:
        return this._type;
    }
  }

  public set type(type: SigilKSMTableType) {
    switch (type) {
      case "int":
        this._type = SigilKSMTable.TYPE_INT;
        break;
      case "byte":
        this._type = SigilKSMTable.TYPE_BYTE;
        break;
      case "float":
        this._type = SigilKSMTable.TYPE_FLOAT;
        break;
      case "variable":
        this._type = SigilKSMTable.TYPE_VARIABLE;
        break;
      default:
        this._type = type;
    }
  }

  protected _build(buffer: CTRMemory): void {
    buffer.u32(this.name !== null ? 0xffffffff : 0);
    buffer.u32(this.id);
    buffer.u32(this._type);

    buffer.u32(this.length);
    buffer.u32((this.startOffset / 4) + 1);

    this._buildname(buffer);
  }

  protected _parse(buffer: CTRMemory): void {
    const incomprehensible = buffer.u32();
    this.id = buffer.u32();

    this.type = buffer.u32();
    this.length = buffer.u32();

    // includes count at start of section 7, this is bad.
    // other offsets don't.
    this.startOffset = (buffer.u32() - 1) * 4;
    this._parsename(buffer, incomprehensible);
  }
}

export { SigilKSMTable, SigilKSMTable as KSMTable };
export type { SigilKSMTableType, SigilKSMTableType as KSMTableType };
