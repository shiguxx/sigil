import { SigilKSMCommand } from "#ksm/ksm-command";

abstract class SigilKSMInstruction extends SigilKSMCommand {
  public abstract readonly opcode: number;
  public abstract get const(): boolean;
}

export { SigilKSMInstruction, SigilKSMInstruction as KSMInstruction };
