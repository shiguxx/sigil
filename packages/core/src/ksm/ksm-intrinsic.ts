import { CTRMemory } from "libctr";
import { SigilKSMInstruction } from "#ksm/ksm-instruction";
import { SigilKSMOpCode } from "#ksm/ksm-opcode";

type SigilKSMIntrinsicType =
  | "=="
  | ">"
  | "<"
  | "||"
  | "+"
  | "&&"
  | "/"
  | ">="
  | "<="
  | "*"
  | "!="
  | "-"
  | "("
  | ")"
  | "next"
  | "|"
  | "&"
  | "^"
  | "<<"
  | ">>"
  | "%"
  | "++"
  | "--";

class SigilKSMIntrinsic extends SigilKSMInstruction {
  public type: SigilKSMIntrinsicType;

  public constructor(type?: SigilKSMIntrinsicType) {
    super();
    this.type = type || "next";
  }

  public override get const(): boolean {
    return false;
  }

  public override get opcode(): number {
    switch (this.type) {
      case "==":
        return SigilKSMOpCode.OPCODE_EQ;
      case ">":
        return SigilKSMOpCode.OPCODE_GT;
      case "<":
        return SigilKSMOpCode.OPCODE_LT;
      case "||":
        return SigilKSMOpCode.OPCODE_OR;
      case "+":
        return SigilKSMOpCode.OPCODE_ADD;
      case "&&":
        return SigilKSMOpCode.OPCODE_AND;
      case "/":
        return SigilKSMOpCode.OPCODE_DIV;
      case ">=":
        return SigilKSMOpCode.OPCODE_GTE;
      case "<=":
        return SigilKSMOpCode.OPCODE_LTE;
      case "*":
        return SigilKSMOpCode.OPCODE_MUL;
      case "!=":
        return SigilKSMOpCode.OPCODE_NEQ;
      case "-":
        return SigilKSMOpCode.OPCODE_SUB;
      case "(":
        return SigilKSMOpCode.OPCODE_LEFT_PAREN;
      case ")":
        return SigilKSMOpCode.OPCODE_RIGHT_PAREN;
      case "next":
        return SigilKSMOpCode.OPCODE_NEXT_FUNCTION;
      case "|":
        return SigilKSMOpCode.OPCODE_BWOR;
      case "&":
        return SigilKSMOpCode.OPCODE_BWAND;
      case "^":
        return SigilKSMOpCode.OPCODE_BWXOR;
      case "<<":
        return SigilKSMOpCode.OPCODE_LSHFT;
      case ">>":
        return SigilKSMOpCode.OPCODE_RSHFT;
      case "%":
        return SigilKSMOpCode.OPCODE_MOD;
      case "--":
        return SigilKSMOpCode.OPCODE_DEC;
      case "++":
        return SigilKSMOpCode.OPCODE_INC;
      default:
        return this.type;
    }
  }

  public override set opcode(opcode: number) {
    switch (opcode) {
      case SigilKSMOpCode.OPCODE_EQ:
        this.type = "==";
        break;
      case SigilKSMOpCode.OPCODE_GT:
        this.type = ">";
        break;
      case SigilKSMOpCode.OPCODE_LT:
        this.type = "<";
        break;
      case SigilKSMOpCode.OPCODE_OR:
        this.type = "||";
        break;
      case SigilKSMOpCode.OPCODE_ADD:
        this.type = "+";
        break;
      case SigilKSMOpCode.OPCODE_AND:
        this.type = "&&";
        break;
      case SigilKSMOpCode.OPCODE_DIV:
        this.type = "/";
        break;
      case SigilKSMOpCode.OPCODE_GTE:
        this.type = ">=";
        break;
      case SigilKSMOpCode.OPCODE_LTE:
        this.type = "<=";
        break;
      case SigilKSMOpCode.OPCODE_MUL:
        this.type = "*";
        break;
      case SigilKSMOpCode.OPCODE_NEQ:
        this.type = "!=";
        break;
      case SigilKSMOpCode.OPCODE_SUB:
        this.type = "-";
        break;
      case SigilKSMOpCode.OPCODE_LEFT_PAREN:
        this.type = "(";
        break;
      case SigilKSMOpCode.OPCODE_RIGHT_PAREN:
        this.type = ")";
        break;
      case SigilKSMOpCode.OPCODE_NEXT_FUNCTION:
        this.type = "next";
        break;
      case SigilKSMOpCode.OPCODE_BWOR:
        this.type = "|";
        break;
      case SigilKSMOpCode.OPCODE_BWAND:
        this.type = "&";
        break;
      case SigilKSMOpCode.OPCODE_BWXOR:
        this.type = "^";
        break;
      case SigilKSMOpCode.OPCODE_LSHFT:
        this.type = "<<";
        break;
      case SigilKSMOpCode.OPCODE_RSHFT:
        this.type = ">>";
        break;
      case SigilKSMOpCode.OPCODE_MOD:
        this.type = "%";
        break;
      case SigilKSMOpCode.OPCODE_DEC:
        this.type = "--";
        break;
      case SigilKSMOpCode.OPCODE_INC:
        this.type = "++";
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
