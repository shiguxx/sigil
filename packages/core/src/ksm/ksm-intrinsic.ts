import { CTRMemory } from "libctr";
import { SigilKSMInstruction } from "#ksm/ksm-instruction";
import { SigilKSMOpCode } from "#ksm/ksm-opcode";

type SigilKSMIntrinsicType =
  | "eq"
  | "gt"
  | "lt"
  | "or"
  | "add"
  | "and"
  | "div"
  | "gte"
  | "lte"
  | "mul"
  | "neq"
  | "sub"
  | "left_paren"
  | "right_paren"
  | "next_function"
  | "bwo"
  | "bwa"
  | "bwx"
  | "bsl"
  | "bsr"
  | "mod";

class SigilKSMIntrinsic extends SigilKSMInstruction {
  public type: SigilKSMIntrinsicType;

  public constructor(type?: SigilKSMIntrinsicType) {
    super();
    this.type = type || "next_function";
  }

  public override get const(): boolean {
    return false;
  }

  public override get opcode(): number {
    switch (this.type) {
      case "eq":
        return SigilKSMOpCode.OPCODE_EQ;
      case "gt":
        return SigilKSMOpCode.OPCODE_GT;
      case "lt":
        return SigilKSMOpCode.OPCODE_LT;
      case "or":
        return SigilKSMOpCode.OPCODE_OR;
      case "add":
        return SigilKSMOpCode.OPCODE_ADD;
      case "and":
        return SigilKSMOpCode.OPCODE_AND;
      case "div":
        return SigilKSMOpCode.OPCODE_DIV;
      case "gte":
        return SigilKSMOpCode.OPCODE_GTE;
      case "lte":
        return SigilKSMOpCode.OPCODE_LTE;
      case "mul":
        return SigilKSMOpCode.OPCODE_MUL;
      case "neq":
        return SigilKSMOpCode.OPCODE_NEQ;
      case "sub":
        return SigilKSMOpCode.OPCODE_SUB;
      case "left_paren":
        return SigilKSMOpCode.OPCODE_LEFT_PAREN;
      case "right_paren":
        return SigilKSMOpCode.OPCODE_RIGHT_PAREN;
      case "next_function":
        return SigilKSMOpCode.OPCODE_NEXT_FUNCTION;
      case "bwo":
        return SigilKSMOpCode.OPCODE_BWOR;
      case "bwa":
        return SigilKSMOpCode.OPCODE_BWAND;
      case "bwx":
        return SigilKSMOpCode.OPCODE_BWXOR;
      case "bsl":
        return SigilKSMOpCode.OPCODE_LSHFT;
      case "bsr":
        return SigilKSMOpCode.OPCODE_RSHFT;
      case "mod":
        return SigilKSMOpCode.OPCODE_MOD;
      default:
        return this.type;
    }
  }

  public override set opcode(opcode: number) {
    switch (opcode) {
      case SigilKSMOpCode.OPCODE_EQ:
        this.type = "eq";
        break;
      case SigilKSMOpCode.OPCODE_GT:
        this.type = "gt";
        break;
      case SigilKSMOpCode.OPCODE_LT:
        this.type = "lt";
        break;
      case SigilKSMOpCode.OPCODE_OR:
        this.type = "or";
        break;
      case SigilKSMOpCode.OPCODE_ADD:
        this.type = "add";
        break;
      case SigilKSMOpCode.OPCODE_AND:
        this.type = "and";
        break;
      case SigilKSMOpCode.OPCODE_DIV:
        this.type = "div";
        break;
      case SigilKSMOpCode.OPCODE_GTE:
        this.type = "gte";
        break;
      case SigilKSMOpCode.OPCODE_LTE:
        this.type = "lte";
        break;
      case SigilKSMOpCode.OPCODE_MUL:
        this.type = "mul";
        break;
      case SigilKSMOpCode.OPCODE_NEQ:
        this.type = "neq";
        break;
      case SigilKSMOpCode.OPCODE_SUB:
        this.type = "sub";
        break;
      case SigilKSMOpCode.OPCODE_LEFT_PAREN:
        this.type = "left_paren";
        break;
      case SigilKSMOpCode.OPCODE_RIGHT_PAREN:
        this.type = "right_paren";
        break;
      case SigilKSMOpCode.OPCODE_NEXT_FUNCTION:
        this.type = "next_function";
        break;
      case SigilKSMOpCode.OPCODE_BWOR:
        this.type = "bwo";
        break;
      case SigilKSMOpCode.OPCODE_BWAND:
        this.type = "bwa";
        break;
      case SigilKSMOpCode.OPCODE_BWXOR:
        this.type = "bwx";
        break;
      case SigilKSMOpCode.OPCODE_LSHFT:
        this.type = "bsl";
        break;
      case SigilKSMOpCode.OPCODE_RSHFT:
        this.type = "bsr";
        break;
      case SigilKSMOpCode.OPCODE_MOD:
        this.type = "mod";
        break;
      default:
        throw new Error("bad intristic " + opcode);
    }
  }

  protected _build(buffer: CTRMemory): void {
    buffer.u32(this.opcode);
  }

  protected _parse(buffer: CTRMemory): void {
    this.opcode = buffer.u32();
  }

  protected override _sizeof(): number {
    return CTRMemory.U32_SIZE;
  }
}

export { SigilKSMIntrinsic, SigilKSMIntrinsic as KSMIntrinsic };
