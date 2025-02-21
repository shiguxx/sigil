enum SigilKSMOpCode {
  OPCODE_NOOP = 0x02,
  OPCODE_GET_ARGS = 0x00000005,
  OPCODE_SET = 0x00000003d,
  OPCODE_EXPR_END = 0x40,
  OPCODE_CALL_END = 0x00000011,
  OPCODE_CALL = 0x0c,
  OPCODE_GET_ARGS_END = 0x00000008,
  OPCODE_IF = 0x18,
  OPCODE_ELSE_IF = 0x27,
  OPCODE_END_IF = 0x28,
  OPCODE_WAIT = 0x16,
  OPCODE_RETURN = 0x09,
  OPCODE_ELSE = 0x26,
  OPCODE_GOTO = 0x0a,
  OPCODE_THREAD2 = 0x7,
  OPCODE_WAIT_MS = 0x17,
  OPCODE_LABEL = 0x04,
  OPCODE_RETURNVAL = 0x03,
  OPCODE_SWITCH = 0x29,
  OPCODE_CASE = 0x2a,
  OPCODE_END_SWITCH = 0x38,
  OPCODE_CALL_AS_CHILD_THREAD = 0xe,
  OPCODE_WAIT_COMPLETED = 0x89,
  OPCODE_DELETE_RUNTIME = 0x12,
  OPCODE_THREAD = 0x6,
  OPCODE_DO_WHILE = 0x39,
  OPCODE_END_DO_WHILE = 0x3c,
  OPCODE_CALL_AS_THREAD = 0x0d,
  OPCODE_BREAK = 0x3a,
  OPCODE_CASE2 = 0x2f,
  OPCODE_BREAK_SWITCH = 0x37,

  OPCODE_UNSURE0 = 0x6e,
  OPCODE_UNSURE1 = 0x6f,
  OPCODE_UNSURE2 = 0x76,
  OPCODE_UNSURE3 = 0x85,
  OPCODE_UNSURE4 = 0x86,
  OPCODE_UNSURE5 = 0x77,
  OPCODE_UNSURE6 = 0x92,
  OPCODE_UNSURE7 = 0x91,
  OPCODE_UNSURE8 = 0x90,
  OPCODE_UNSURE9 = 0x8A,
  OPCODE_UNSURE10 = 0x15,
  OPCODE_UNSURE11 = 0x8E,

  OPCODE_GET_INDEX = 0x6D,
  OPCODE_READ_TABLE_LENGTH = 0x67,

  // instristics
  OPCODE_NEXT_FUNCTION = 0x3f,
  OPCODE_LEFT_PAREN = 0x41,
  OPCODE_RIGHT_PAREN = 0x42,
  OPCODE_OR = 0x43,
  OPCODE_AND = 0x44,

  OPCODE_BWOR = 0x45,
  OPCODE_BWAND = 0x46,
  OPCODE_BWXOR = 0x47,
  OPCODE_LSHFT = 0x48,
  OPCODE_RSHFT = 0x49,

  OPCODE_EQ = 0x4a,
  OPCODE_NEQ = 0x4b,
  OPCODE_GT = 0x4c,
  OPCODE_LT = 0x4d,
  OPCODE_GTE = 0x4e,
  OPCODE_LTE = 0x4f,

  OPCODE_INC = 0x50,
  OPCODE_DEC = 0x51,

  OPCODE_MOD = 0x52,
  OPCODE_ADD = 0x53,
  OPCODE_SUB = 0x54,
  OPCODE_MUL = 0x55,
  OPCODE_DIV = 0x56
}

export { SigilKSMOpCode, SigilKSMOpCode as KSMOpCode };
