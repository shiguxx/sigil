import { CTRMemory } from "libctr";
import { SigilKSMCommand } from "#ksm/ksm-command";

abstract class SigilKSMNamedCommand extends SigilKSMCommand {
  public name: null | string;

  public constructor() {
    super();
    this.name = null;
  }

  protected _buildname(buffer: CTRMemory): void {
    if (this.name !== null) {
      if (!this.name.endsWith("\0")) {
        this.name = `${this.name}\0`;
      }

      const count = CTRMemory.align(Buffer.byteLength(this.name, "utf8"), 4);
      buffer.u32(count / 4);

      buffer.string(this.name, {
        count,
        padding: "\0",
        encoding: "utf8"
      });
    }
  }

  protected _parsename(buffer: CTRMemory, incomprehensible: number): void {
    if (incomprehensible === 0xffffffff) {
      this.name = buffer.string({
        strip: true,
        encoding: "utf8",
        terminator: "\0",
        count: buffer.u32() * 4
      });
    }

    if (this.name === null && incomprehensible !== 0) {
      throw "ksm.err_malformed_file";
    }
  }

  protected _sizeofname(): number {
    if (this.name === null) {
      return 0;
    }

    return (
      CTRMemory.U32_SIZE +
      CTRMemory.align(
        CTRMemory.bytelength(
          this.name.endsWith("\0") ? this.name : `${this.name}\0`,
          "utf8"
        ),
        4
      )
    );
  }
}

export { SigilKSMNamedCommand, SigilKSMNamedCommand as KSMNamedCommand };
