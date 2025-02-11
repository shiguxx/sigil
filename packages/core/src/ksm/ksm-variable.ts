import { CTRMemory } from "libctr";
import { SigilKSMNamedCommand } from "#ksm/ksm-named-command";

type SigilKSMVariableType = "int" | "float" | "string" | number;
type SigilKSMVariableScope = "tmp" | "const" | "local" | "static" | "global";

class SigilKSMVariable extends SigilKSMNamedCommand {
  private static readonly TYPE_INT = 0x00000001;
  private static readonly TYPE_FLOAT = 0x00000000;
  private static readonly TYPE_STRING = 0x00000003;

  public id: number;
  public flags: number;
  private _type: number;
  public value: number | string;
  public scope: SigilKSMVariableScope;

  public constructor() {
    super();
    this._type = 0;

    this.id = 0;
    this.flags = 0;
    this.value = 0;
    this.scope = "const";
  }

  public get type(): SigilKSMVariableType {
    switch (this._type) {
      case SigilKSMVariable.TYPE_INT:
        return "int";
      case SigilKSMVariable.TYPE_FLOAT:
        return "float";
      case SigilKSMVariable.TYPE_STRING:
        return "string";
      default:
        return this._type;
    }
  }

  public set type(type: SigilKSMVariableType) {
    switch (type) {
      case "int":
        this._type = SigilKSMVariable.TYPE_INT;
        break;
      case "float":
        this._type = SigilKSMVariable.TYPE_FLOAT;
        break;
      case "string":
        this._type = SigilKSMVariable.TYPE_STRING;
        break;
      default:
        this._type = type;
    }
  }

  protected _build(buffer: CTRMemory): void {
    buffer.u32(this.name !== null ? 0xffffffff : 0);
    buffer.u32(this.id);
    buffer.u24(this._type);
    buffer.u8(this.flags);

    if (this.type === "int") {
      if (typeof this.value !== "number") {
        throw new TypeError();
      }

      buffer.i32(this.value);
    } else if (this.type === "float") {
      if (typeof this.value !== "number") {
        throw new TypeError();
      }

      buffer.f32(this.value);
    } else if (this.type === "string") {
      buffer.u32(0x00000000);
    } else {
      if (typeof this.value !== "number") {
        throw new TypeError();
      }

      buffer.u32(this.value);
    }

    this._buildname(buffer);

    if (this.type === "string") {
      if (typeof this.value !== "string") {
        throw new TypeError();
      }

      if (!this.value.endsWith("\0")) {
        this.value = `${this.value}\0`;
      }

      const count = CTRMemory.align(this.value.length, 4);
      buffer.u32(count / 4);

      buffer.string(this.value, {
        count,
        padding: "\0",
        encoding: "utf8"
      });
    }
  }

  protected _parse(buffer: CTRMemory): void {
    const incomprehensible = buffer.u32();
    this.id = buffer.u32();

    // prevent narrowing of type of `this.type`
    this.type = <SigilKSMVariableType>buffer.u24();
    this.flags = buffer.u8();

    if (this.type === "int") {
      this.value = buffer.i32();
    } else if (this.type === "float") {
      this.value = buffer.f32();
    } else {
      this.value = buffer.u32();
    }

    this._parsename(buffer, incomprehensible);

    if (this.type === "string") {
      if (this.value !== 0) {
        throw "ksm.err_malformed_file";
      }

      this.value = buffer.string({
        strip: true,
        encoding: "utf8",
        terminator: "\0",
        count: buffer.u32() * 4
      });
    }
  }
}

export { SigilKSMVariable, SigilKSMVariable as KSMVariable };

export type {
  SigilKSMVariableType,
  SigilKSMVariableType as KSMVariableType,
  SigilKSMVariableScope,
  SigilKSMVariableScope as KSMVariableScope
};
