import { CTRMemory } from "libctr";
import { SigilKSMNamedCommand } from "#ksm/ksm-named-command";

class SigilKSMImport extends SigilKSMNamedCommand {
  public id: number;
  public unknown0: number;
  public unknown1: number;
  public unknown2: number;
  public unknown3: number;
  public unknown4: number;

  public constructor() {
    super();

    this.id = 0;
    this.unknown0 = 0;
    this.unknown1 = 0;
    this.unknown2 = 0;
    this.unknown3 = 0;
    this.unknown4 = 0;
  }

  protected _build(buffer: CTRMemory): void {
    buffer.u32(this.name !== null ? 0xffffffff : 0);

    buffer.u32(this.unknown0);
    buffer.u32(this.unknown1);
    buffer.u32(this.unknown2);
    buffer.u32(this.id);
    buffer.u32(this.unknown3);
    buffer.u32(this.unknown4);

    this._buildname(buffer);
  }

  protected _parse(buffer: CTRMemory): void {
    const incomprehensible = buffer.u32();

    this.unknown0 = buffer.u32();
    this.unknown1 = buffer.u32();
    this.unknown2 = buffer.u32(); // unused
    this.id = buffer.u32();
    this.unknown3 = buffer.u32(); // unused
    this.unknown4 = buffer.u32(); // unused

    this._parsename(buffer, incomprehensible);
  }
}

export { SigilKSMImport, SigilKSMImport as KSMImport };
