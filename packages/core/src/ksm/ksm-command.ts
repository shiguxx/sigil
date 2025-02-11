import type { SigilKSMContext } from "#ksm/ksm-context";
import { CTRBinarySerializable, CTREventEmitterDefaultEventMap } from "libctr";

abstract class SigilKSMCommand extends CTRBinarySerializable<
  never,
  CTREventEmitterDefaultEventMap,
  SigilKSMContext,
  SigilKSMContext
> {}

export { SigilKSMCommand, SigilKSMCommand as KSMCommand };
