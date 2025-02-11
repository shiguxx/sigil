import { SigilKSMOpCode } from "#ksm/ksm-opcode";
import { SigilKSMWaitInstruction } from "#ksm/ksm-wait-instruction";

class SigilKSMWaitMSInstruction extends SigilKSMWaitInstruction {
  public override get opcode(): number {
    return SigilKSMOpCode.OPCODE_WAIT_MS;
  }
}

export {
  SigilKSMWaitMSInstruction,
  SigilKSMWaitMSInstruction as KSMWaitMSInstruction
};
