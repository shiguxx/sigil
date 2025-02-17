import { CTRMemory } from "libctr";
import { SigilKSMNamedCommand } from "#ksm/ksm-named-command";

class SigilKSMLabel extends SigilKSMNamedCommand {
  public id: number;
  public address: number;

  public constructor() {
    super();

    this.id = 0;
    this.address = 0;
  }

  protected _build(buffer: CTRMemory): void {
    buffer.u32(this.name !== null ? 0xffffffff : 0);

    buffer.u32(this.id);
    buffer.u32(this.address);

    this._buildname(buffer);
  }

  protected _parse(buffer: CTRMemory): void {
    const incomprehensible = buffer.u32();

    this.id = buffer.u32();
    this.address = buffer.u32();

    this._parsename(buffer, incomprehensible);
  }

  protected override _sizeof(): number {
    let sizeof = 0;

    sizeof += this._sizeofname();
    sizeof += CTRMemory.U32_SIZE * 2;

    return sizeof;
  }
}

export { SigilKSMLabel, SigilKSMLabel as KSMLabel };
