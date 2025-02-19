import z from "zod";
import assert from "node:assert";
import fs from "node:fs/promises";
import process from "node:process";
import { SigilKSM } from "#ksm/ksm";
import { KSMVariable, SigilKSMVariable } from "#ksm/ksm-variable";
import type { SigilKSMCommand } from "#ksm/ksm-command";
import {
  KSMGetArgsInstruction,
  SigilKSMGetArgsInstruction
} from "#ksm/ksm-get-args-instruction";
import { KSMFunction, SigilKSMFunction } from "#ksm/ksm-function";
import {
  KSMCallInstruction,
  SigilKSMCallInstruction
} from "#ksm/ksm-call-instruction";
import { SigilKSMExpression } from "#ksm/ksm-context";
import {
  KSMReturnInstruction,
  SigilKSMReturnInstruction
} from "#ksm/ksm-return-instruction";
import { KSMSetInstruction, SigilKSMSetInstruction } from "#ksm/ksm-set-instruction";
import { KSMIfInstruction, SigilKSMIfInstruction } from "#ksm/ksm-if-instruction";
import { KSMNoOpInstruction, SigilKSMNoOpInstruction } from "#ksm/ksm-noop-cmd";
import {
  KSMEndIfInstruction,
  SigilKSMEndIfInstruction
} from "#ksm/ksm-end-if-instruction";
import {
  KSMElseIfInstruction,
  SigilKSMElseIfInstruction
} from "#ksm/ksm-else-if-instruction";
import {
  KSMElseInstruction,
  SigilKSMElseInstruction
} from "#ksm/ksm-else-instruction";
import {
  KSMWaitInstruction,
  SigilKSMWaitInstruction,
  SigilKSMWaitTime
} from "#ksm/ksm-wait-instruction";
import {
  KSMGotoInstruction,
  SigilKSMGotoInstruction
} from "#ksm/ksm-goto-instruction";
import {
  KSMThread2Instruction,
  SigilKSMThread2Instruction
} from "#ksm/ksm-thread2-instruction";
import {
  KSMLabelInstruction,
  SigilKSMLabelInstruction
} from "#ksm/ksm-label-instruction";
import { KSMImport, SigilKSMImport } from "#ksm/ksm-import";
import { SigilKSMIntrinsic } from "#ksm/ksm-intrinsic";
import { SigilKSMLabel } from "#ksm/ksm-label";
import { SigilKSMInstruction } from "#ksm/ksm-instruction";
import {
  KSMWaitMSInstruction,
  SigilKSMWaitMSInstruction
} from "#ksm/ksm-wait-ms-instruction";
import { KSMUnsure0Instruction, SigilKSMUnsure0Instruction } from "#ksm/ksm-unsure0";
import { KSMUnsure1Instruction, SigilKSMUnsure1Instruction } from "#ksm/ksm-unsure1";
import { SigilKSMReturnValInstruction } from "#ksm/ksm-returnval-instruction";
import { SigilKSMSwitchInstruction } from "#ksm/ksm-switch-instruction";
import { SigilKSMCaseInstruction } from "#ksm/ksm-case-instruction";
import {
  KSMEndSwitchInstruction,
  SigilKSMEndSwitchInstruction
} from "#ksm/ksm-end-switch-instruction";
import {
  KSMCallAsChildThreadInstruction,
  SigilKSMCallAsChildThreadInstruction
} from "#ksm/ksm-call-as-child-thread-instruction";
import {
  KSMWaitCompletedInstruction,
  SigilKSMWaitCompletedInstruction
} from "#ksm/ksm-wait-completed";
import { KSMDoWhileInstruction } from "#ksm/ksm-dowhile-instruction";
import {
  KSMEndDoWhileInstruction,
  SigilKSMEndDoWhileInstruction
} from "#ksm/ksm-end-dowhile-instruction";
import {
  KSMDeleteRuntimeInstruction,
  SigilKSMDeleteRuntimeInstruction
} from "#ksm/ksm-delete-runtime-instruction";
import {
  KSMThreadInstruction,
  SigilKSMThreadInstruction
} from "#ksm/ksm-thread-cmd";
import {
  KSMBreakInstruction,
  SigilKSMBreakInstruction
} from "#ksm/ksm-break-instruction";
import { SigilKSMUnsure3Instruction } from "#ksm/ksm-unsure3";
import { SigilKSMUnsure2Instruction } from "#ksm/ksm-unsure2";
import {
  KSMCallAsThreadInstruction,
  SigilKSMCallAsThreadInstruction
} from "#ksm/ksm-call-as-thread-instruction";
import { SigilKSMTable } from "#ksm/ksm-table";

const IKSMIntrisic = z
  .enum([
    "+",
    "-",
    "&&",
    "/",
    "==",
    ">",
    ">=",
    "(",
    "<",
    "<=",
    "*",
    "!=",
    "next",
    "||",
    ")"
  ])
  .or(z.number().int());

// @ts-expect-error
const IKSMExpression = z.lazy(() =>
  z.union([IKSMIntrisic, IKSMCallInstruction, z.string()]).array()
);

// @ts-expect-error
const IKSMCallInstruction = z.object({
  type: z.enum(["KSMCall", "KSMCallAsThread", "KSMCallAsChildThread"]),
  callee: z.string(),
  arguments: z.string().or(IKSMExpression).array()
});

const IKSMInstruction = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("KSMGetArgs"),
    fn: z.string(),
    arguments: z.string().array()
  }),
  z.object({
    type: z.literal("KSMReturnVal"),
    value: z.string().or(IKSMExpression)
  }),
  IKSMCallInstruction,
  z.object({
    type: z.enum([
      "KSMReturn",
      "KSMEndDoWhile",
      "KSMNone",
      "KSMBreak",
      "KSMEndIf",
      "KSMEndSwitch",
      "KSMLabelPoint",
      "KSMUnsure0",
      "KSMUnsure1"
    ])
  }),
  z.object({
    type: z.literal("KSMSet"),
    assignee: z.string(),
    value: z.string().or(IKSMExpression)
  }),
  z.object({
    type: z.literal("KSMUnsure3"),
    unknown0: z.string(),
  }),
  z.object({
    type: z.literal("KSMIf"),
    unknown0: z.number().int(),
    unknown2: z.number().int(),
    condition: IKSMExpression
  }),
  z.object({
    type: z.literal("KSMDoWhile"),
    condition: z.string().or(IKSMExpression)
  }),
  z.object({
    type: z.literal("KSMElseIf"),
    unknown1: z.number().int(),
    unknown2: z.number().int(),
    unknown4: z.number().int(),
    condition: IKSMExpression
  }),
  z.object({
    type: z.literal("KSMElse")
  }),
  z.object({
    type: z.literal("KSMWait"),
    time: z.string().or(IKSMExpression)
  }),
  z.object({
    type: z.literal("KSMWaitMS"),
    time: z.string().or(IKSMExpression)
  }),
  z.object({
    type: z.enum(["KSMWaitCompleted", "KSMDeleteRuntime"]),
    runtime: z.string().or(IKSMExpression)
  }),
  z.object({
    type: z.literal("KSMGoto"),
    label: z.string()
  }),
  z.object({
    type: z.enum(["KSMThread", "KSMThread2"]),
    callee: z.string(),
    give: z.string().array(),
    take: z.number().array()
  }),
  z.object({
    type: z.literal("KSMSwitch"),
    unknown0: z.number().int(),
    unknown1: z.number().int(),
    value: z.string().or(IKSMExpression)
  }),
  z.object({
    type: z.literal("KSMSwitchCase"),
    unknown0: z.number().int(),
    value: z.string().or(IKSMExpression)
  }),
  z.object({
    type: z.literal("KSMUnsure2"),
    unknown0: z.string().or(IKSMExpression)
  })
]);

type IKSMInstruction = z.infer<typeof IKSMInstruction>;

const IKSMLabel = z.object({
  id: z.number().int(),
  name: z.string().nullable()
});

type IKSMLabel = z.infer<typeof IKSMLabel>;

const IKSMImport = z.object({
  name: z.string(),
  id: z.number().int(),
  unknown0: z.number().int(),
  unknown1: z.number().int(),
  unknown2: z.number().int(),
  unknown3: z.number().int(),
  unknown4: z.number().int()
});

type IKSMImport = z.infer<typeof IKSMImport>;

const IKSMVariable = z.object({
  id: z.number().int(),
  flags: z.number().int(),
  name: z.string().nullable(),
  value: z.number().or(z.string()),
  type: z.enum(["int", "float", "string"]).or(z.number()),
  scope: z.enum(["tmp", "const", "local", "static", "global"])
});

type IKSMVariable = z.infer<typeof IKSMVariable>;

const IKSMTable = z.object({
  type: z.enum(["int", "byte", "float", "variable"]).or(z.number()),
  id: z.number(),
  name: z.string().nullable(),
  values: z.number().or(z.string()).array()
});

type IKSMTable = z.infer<typeof IKSMTable>;

const IKSMFunction = z.object({
  name: z.string(),
  public: z.boolean(),
  id: z.number().int(),
  inlinefn: z.boolean(),
  unknown0: z.number().int(),
  unknown1: z.number().int(),
  unknown2: z.number().int(),
  labels: IKSMLabel.array(),
  tables: IKSMTable.array(),
  variables: IKSMVariable.array(),
  instructions: IKSMInstruction.array()
});

type IKSMFunction = z.infer<typeof IKSMFunction>;

const IKSM = z.object({
  type: z.literal("KSM"),
  tables: IKSMTable.array(),
  imports: IKSMImport.array(),
  functions: IKSMFunction.array(),
  variables: IKSMVariable.array(),
  unknown0: z.number().int().array(),
  unknown1: z.number().int().array(),
  unknown2: z.number().int().array()
});

type IKSM = z.infer<typeof IKSM>;

async function main(): Promise<void> {
  try {
    const action = process.argv.at(2);
    const filepath = process.argv.at(3);

    if (action === undefined) {
      throw new Error("missing action");
    } else if (filepath === undefined) {
      throw new Error("missing filepath");
    } else if (action === "-c") {
      await compile(filepath);
    } else if (action === "-d") {
      await decompile(filepath);
    } else {
      throw new Error(`invalid action '${action}'`);
    }
  } catch (err) {
    console.error(err);
  }
}

function _export(symbol: SigilKSM | SigilKSMCommand | SigilKSMExpression): unknown {
  const object = Object.create(null);

  if (Array.isArray(symbol)) {
    const array = [];

    for (const el of symbol) {
      array.push(_export(el));
    }

    return array;
  }

  if (symbol instanceof SigilKSMIntrinsic) {
    switch (symbol.type) {
      case "add":
        return "+";
      case "sub":
        return "-";
      case "and":
        return "&&";
      case "div":
        return "/";
      case "mod":
        return "%";
      case "bwo":
        return "|";
      case "bwa":
        return "&";
      case "bwx":
        return "^";
      case "bsl":
        return "<<";
      case "bsr":
        return ">>";
      case "eq":
        return "==";
      case "gt":
        return ">";
      case "gte":
        return ">=";
      case "left_paren":
        return "(";
      case "lt":
        return "<";
      case "lte":
        return "<=";
      case "mul":
        return "*";
      case "neq":
        return "!=";
      case "next_function":
        return "next";
      case "or":
        return "||";
      case "right_paren":
        return ")";
      default:
        return symbol.type;
    }
  }

  if (symbol instanceof SigilKSMUnsure2Instruction) {
    object.type = "KSMUnsure2";
    object.unknown0 = _export(symbol.unknown);

    return object;
  }

  if (symbol instanceof SigilKSMUnsure3Instruction) {
    object.type = "KSMUnsure3";
    object.unknown0 = _export(symbol.unknown0);

    return object;
  }

  if (symbol instanceof SigilKSMCaseInstruction) {
    object.type = "KSMSwitchCase";
    object.unknown0 = symbol.unknown0;
    object.value = _export(symbol.value);

    return object;
  }

  if (symbol instanceof SigilKSMSwitchInstruction) {
    object.type = "KSMSwitch";
    object.unknown0 = symbol.unknown0;
    object.unknown1 = symbol.unknown1;
    object.value = _export(symbol.value);

    return object;
  }

  if (symbol instanceof SigilKSMReturnValInstruction) {
    object.type = "KSMReturnVal";

    object.value = _export(symbol.value);
    return object;
  }

  if (symbol instanceof SigilKSM) {
    const tables: IKSMTable[] = [];
    const imports: IKSMImport[] = [];
    const functions: IKSMFunction[] = [];
    const variables: IKSMVariable[] = [];

    for (const ta of symbol.tables.values()) {
      const values: (string | number)[] = [];

      for (const va of ta.values) {
        if (typeof va === "number") {
          values.push(va);
          continue;
        }

        values.push(<string>_export(va));
      }

      tables.push({ ...ta, values, type: ta.type });
    }

    for (const im of symbol.imports.values()) {
      assert(im.name !== null);
      imports.push({ ...im, name: im.name });
    }

    for (const fn of symbol.functions.values()) {
      const name = fn.name;
      const labels: IKSMLabel[] = [];
      const tables: IKSMTable[] = [];
      const variables: IKSMVariable[] = [];
      const instructions: IKSMInstruction[] = [];

      for (const la of fn.labels.values()) {
        labels.push(la);
      }

      for (const ta of fn.tables.values()) {
        const values: (string | number)[] = [];

        for (const va of ta.values) {
          if (typeof va === "number") {
            values.push(va);
            continue;
          }

          values.push(<string>_export(va));
        }

        tables.push({ ...ta, values, type: ta.type });
      }

      for (const va of fn.variables.values()) {
        variables.push(va);
      }

      for (const instruction of fn.instructions) {
        instructions.push(<IKSMInstruction>_export(instruction));
      }

      assert(name !== null);

      functions.push({
        ...fn,
        name,
        labels,
        tables,
        variables,
        instructions
      });
    }

    for (const va of symbol.variables.values()) {
      variables.push(va);
    }

    object.type = "KSM";
    object.tables = tables;
    object.imports = imports;
    object.functions = functions;
    object.variables = variables;
    object.unknown0 = symbol.unknown0;
    object.unknown1 = symbol.unknown1;
    object.unknown2 = symbol.unknown2;

    return object;
  }

  if (
    symbol instanceof SigilKSMLabel ||
    symbol instanceof SigilKSMImport ||
    symbol instanceof SigilKSMFunction ||
    symbol instanceof SigilKSMVariable
  ) {
    return symbol.name || `ref:${symbol.id}`;
  }

  if (symbol instanceof KSMLabelInstruction) {
    object.type = "KSMLabelPoint";
    return object;
  }

  if (symbol instanceof KSMThreadInstruction) {
    object.type = "KSMThread";
    Object.assign(object, symbol);

    object.callee = _export(symbol.callee);
    object.give = symbol.give.map((g) => _export(g));

    return object;
  }

  if (symbol instanceof KSMThread2Instruction) {
    object.type = "KSMThread2";
    Object.assign(object, symbol);

    object.callee = _export(symbol.callee);
    object.give = symbol.give.map((g) => _export(g));

    return object;
  }

  if (symbol instanceof KSMGotoInstruction) {
    object.type = "KSMGoto";
    object.label = _export(symbol.label);

    return object;
  }

  if (symbol instanceof KSMReturnInstruction) {
    object.type = "KSMReturn";
    return object;
  }

  if (symbol instanceof KSMUnsure0Instruction) {
    object.type = "KSMUnsure0";
    return object;
  }

  if (symbol instanceof KSMUnsure1Instruction) {
    object.type = "KSMUnsure1";
    return object;
  }

  if (symbol instanceof KSMCallAsThreadInstruction) {
    object.type = "KSMCallAsThread";
    object.callee = _export(symbol.callee);
    object.arguments = symbol.arguments.map((a) => _export(a));

    return object;
  }

  if (symbol instanceof KSMCallAsChildThreadInstruction) {
    object.type = "KSMCallAsChildThread";
    object.callee = _export(symbol.callee);
    object.arguments = symbol.arguments.map((a) => _export(a));

    return object;
  }

  if (symbol instanceof KSMCallInstruction) {
    object.type = "KSMCall";
    object.callee = _export(symbol.callee);
    object.arguments = symbol.arguments.map((a) => _export(a));

    return object;
  }

  if (symbol instanceof KSMGetArgsInstruction) {
    object.type = "KSMGetArgs";
    object.fn = symbol.fn.name || symbol.fn.id;
    object.arguments = symbol.arguments.map((a) => _export(a));

    return object;
  }

  if (symbol instanceof KSMSetInstruction) {
    object.type = "KSMSet";
    object.value = _export(symbol.value);
    object.assignee = _export(symbol.assignee);

    return object;
  }

  if (symbol instanceof KSMEndSwitchInstruction) {
    object.type = "KSMEndSwitch";
    return object;
  }

  if (symbol instanceof KSMEndIfInstruction) {
    object.type = "KSMEndIf";
    return object;
  }

  if (symbol instanceof KSMBreakInstruction) {
    object.type = "KSMBreak";
    return object;
  }

  if (symbol instanceof KSMEndDoWhileInstruction) {
    object.type = "KSMEndDoWhile";
    return object;
  }

  if (symbol instanceof KSMNoOpInstruction) {
    object.type = "KSMNone";
    return object;
  }

  if (symbol instanceof KSMDoWhileInstruction) {
    object.type = "KSMDoWhile";
    Object.assign(object, symbol);
    object.condition = _export(symbol.condition);

    return object;
  }

  if (symbol instanceof KSMIfInstruction) {
    object.type = "KSMIf";
    Object.assign(object, symbol);
    object.condition = _export(symbol.condition);

    return object;
  }

  if (symbol instanceof KSMElseIfInstruction) {
    object.type = "KSMElseIf";
    Object.assign(object, symbol);
    object.condition = _export(symbol.condition);

    return object;
  }

  if (symbol instanceof KSMElseInstruction) {
    object.type = "KSMElse";
    Object.assign(object, symbol);

    return object;
  }

  if (symbol instanceof KSMWaitMSInstruction) {
    object.type = "KSMWaitMS";
    object.time = _export(symbol.time);

    return object;
  }

  if (symbol instanceof KSMWaitInstruction) {
    object.type = "KSMWait";
    object.time = _export(symbol.time);

    return object;
  }

  if (symbol instanceof KSMWaitCompletedInstruction) {
    object.type = "KSMWaitCompleted";
    object.runtime = _export(symbol.runtime);

    return object;
  }

  if (symbol instanceof KSMDeleteRuntimeInstruction) {
    object.type = "KSMDeleteRuntime";
    object.runtime = _export(symbol.runtime);

    return object;
  }

  console.error(symbol);
  throw new Error("unknown");
}

function _import(
  fn: null | SigilKSMFunction,
  script: null | SigilKSM,
  symbol: IKSM | IKSMInstruction
): SigilKSM | SigilKSMCommand | SigilKSMExpression {
  if (symbol.type === "KSM") {
    const object = new SigilKSM();

    for (const u of symbol.unknown0) {
      object.unknown0.push(u);
    }

    for (const u of symbol.unknown1) {
      object.unknown1.push(u);
    }

    for (const u of symbol.unknown2) {
      object.unknown2.push(u);
    }

    for (const ta of symbol.tables) {
      const table = new SigilKSMTable();

      table.id = ta.id;
      table.name = ta.name;
      table.length = ta.values.length;

      object.tables.set(table.id, table);

      for (const v of table.values) {
        if (typeof v === "number") {
          table.values.push(v);
          continue;
        }

        table.values.push(<SigilKSMVariable>_import(fn, script, v));
      }
    }

    for (const im of symbol.imports) {
      const _import = new SigilKSMImport();
      Object.assign(_import, im);

      object.imports.set(_import.id, _import);
    }

    for (const va of symbol.variables) {
      const _variable = new SigilKSMVariable();
      Object.assign(_variable, va);

      object.variables.set(_variable.id, _variable);
    }

    for (const fn of symbol.functions) {
      const _function = new SigilKSMFunction();

      _function.id = fn.id;
      _function.name = fn.name;
      _function.public = fn.public;
      _function.unknown0 = fn.unknown0;
      _function.unknown1 = fn.unknown1;
      _function.unknown2 = fn.unknown2;
      _function.inlinefn = fn.inlinefn;

      object.functions.set(_function.id, _function);

      for (const la of fn.labels) {
        const _label = new SigilKSMLabel();

        _label.id = la.id;
        _label.address = 0;

        _function.labels.set(_label.id, _label);
      }

      for (const va of fn.variables) {
        const _variable = new SigilKSMVariable();
        Object.assign(_variable, va);

        _function.variables.set(_variable.id, _variable);
      }

      for (const ta of fn.tables) {
        const table = new SigilKSMTable();

        table.id = ta.id;
        table.name = ta.name;
        table.length = ta.values.length;

        _function.tables.set(table.id, table);

        for (const v of table.values) {
          if (typeof v === "number") {
            table.values.push(v);
            continue;
          }

          table.values.push(<SigilKSMVariable>_import(fn, script, v));
        }
      }
    }

    for (const fn of symbol.functions) {
      const _function = object.functions.get(fn.id);
      assert(_function !== undefined);

      for (const instruction of fn.instructions) {
        _function.instructions.push(
          <SigilKSMInstruction>_import(_function, object, instruction)
        );
      }
    }

    return object;
  }

  assert(script !== null);

  if (symbol.type === "KSMUnsure2") {
    const object = new SigilKSMUnsure2Instruction();
    object.unknown = <SigilKSMExpression>_import(fn, script, symbol.unknown0);

    return object;
  }

  if (symbol.type === "KSMUnsure3") {
    const object = new SigilKSMUnsure3Instruction();
    object.unknown0 = <SigilKSMVariable>_import(fn, script, symbol.unknown0);

    return object;
  }

  if (symbol.type === "KSMBreak") {
    return new SigilKSMBreakInstruction();
  }

  if (symbol.type === "KSMReturn") {
    return new SigilKSMReturnInstruction();
  }

  if (symbol.type === "KSMUnsure0") {
    return new SigilKSMUnsure0Instruction();
  }

  if (symbol.type === "KSMUnsure1") {
    return new SigilKSMUnsure1Instruction();
  }

  if (symbol.type === "KSMGetArgs") {
    const object = new SigilKSMGetArgsInstruction();
    object.fn = <SigilKSMFunction>_resolve(null, script, symbol.fn);

    for (const a of symbol.arguments) {
      object.arguments.push(<SigilKSMVariable>_resolve(object.fn, script, a));
    }

    return object;
  }

  if (symbol.type === "KSMCall") {
    const object = new SigilKSMCallInstruction();
    object.callee = <SigilKSMFunction>_resolve(null, script, symbol.callee);

    for (const a of symbol.arguments) {
      if (typeof a === "string") {
        object.arguments.push(<SigilKSMVariable>_resolve(fn, script, a));
        continue;
      }

      object.arguments.push(<SigilKSMExpression>_import(fn, script, a));
    }

    return object;
  }

  if (symbol.type === "KSMCallAsThread") {
    const object = new SigilKSMCallAsThreadInstruction();
    object.callee = <SigilKSMFunction>_resolve(fn, script, symbol.callee);

    for (const a of symbol.arguments) {
      if (typeof a === "string") {
        object.arguments.push(<SigilKSMVariable>_resolve(fn, script, a));
        continue;
      }

      object.arguments.push(<SigilKSMExpression>_import(fn, script, a));
    }

    return object;
  }

  if (symbol.type === "KSMCallAsChildThread") {
    const object = new SigilKSMCallAsChildThreadInstruction();
    object.callee = <SigilKSMFunction>_resolve(fn, script, symbol.callee);

    for (const a of symbol.arguments) {
      if (typeof a === "string") {
        object.arguments.push(<SigilKSMVariable>_resolve(fn, script, a));
        continue;
      }

      object.arguments.push(<SigilKSMExpression>_import(fn, script, a));
    }

    return object;
  }

  if (symbol.type === "KSMElse") {
    const object = new SigilKSMElseInstruction();
    return object;
  }

  if (symbol.type === "KSMEndDoWhile") {
    const object = new SigilKSMEndDoWhileInstruction();
    return object;
  }

  if (symbol.type === "KSMDoWhile") {
    const object = new KSMDoWhileInstruction();
    object.condition = <SigilKSMExpression>_import(fn, script, symbol.condition);
    return object;
  }

  if (symbol.type === "KSMIf") {
    const object = new SigilKSMIfInstruction();

    object.unknown0 = symbol.unknown0;
    object.unknown2 = symbol.unknown2;
    object.condition = <SigilKSMExpression>_import(fn, script, symbol.condition);

    return object;
  }

  if (symbol.type === "KSMElseIf") {
    const object = new SigilKSMElseIfInstruction();

    object.unknown1 = symbol.unknown1;
    object.unknown2 = symbol.unknown2;
    object.unknown4 = symbol.unknown4;

    object.condition = <SigilKSMExpression>_import(fn, script, symbol.condition);
    return object;
  }

  if (symbol.type === "KSMGoto") {
    const object = new SigilKSMGotoInstruction();
    object.label = <SigilKSMLabel>_resolve(fn, script, symbol.label);
    return object;
  }

  if (symbol.type === "KSMThread") {
    const object = new SigilKSMThreadInstruction();
    object.callee = <SigilKSMFunction>_resolve(fn, script, symbol.callee);

    for (const g of symbol.give) {
      // TODO: this fucking sucks.
      // try first with callee's scope
      // then caller's scope
      try {
        object.give.push(
          <SigilKSMVariable>(
            _resolve(
              object.callee instanceof KSMFunction ? object.callee : fn,
              script,
              g
            )
          )
        );
      } catch {
        object.give.push(<SigilKSMVariable>_resolve(fn, script, g));
      }
    }

    for (const t of symbol.take) {
      object.take.push(t);
    }

    return object;
  }

  if (symbol.type === "KSMThread2") {
    const object = new SigilKSMThread2Instruction();
    object.callee = <SigilKSMFunction>_resolve(fn, script, symbol.callee);

    for (const g of symbol.give) {
      object.give.push(
        <SigilKSMVariable>(
          _resolve(
            object.callee instanceof KSMFunction ? object.callee : fn,
            script,
            g
          )
        )
      );
    }

    for (const t of symbol.take) {
      object.take.push(t);
    }

    return object;
  }

  if (symbol.type === "KSMLabelPoint") {
    return new SigilKSMLabelInstruction();
  }

  if (symbol.type === "KSMSet") {
    const object = new SigilKSMSetInstruction();
    object.assignee = <SigilKSMVariable>_resolve(fn, script, symbol.assignee);

    object.value = <SigilKSMExpression | SigilKSMVariable>(
      _import(fn, script, symbol.value)
    );

    return object;
  }

  if (symbol.type === "KSMNone") {
    return new SigilKSMNoOpInstruction();
  }

  if (symbol.type === "KSMEndIf") {
    return new SigilKSMEndIfInstruction();
  }

  if (symbol.type === "KSMEndSwitch") {
    return new SigilKSMEndSwitchInstruction();
  }

  if (symbol.type === "KSMWait") {
    const object = new SigilKSMWaitInstruction();
    object.time = <SigilKSMWaitTime>_import(fn, script, symbol.time);

    return object;
  }

  if (symbol.type === "KSMDeleteRuntime") {
    const object = new SigilKSMDeleteRuntimeInstruction();
    object.runtime = <SigilKSMVariable>_import(fn, script, symbol.runtime);

    return object;
  }

  if (symbol.type === "KSMWaitCompleted") {
    const object = new SigilKSMWaitCompletedInstruction();
    object.runtime = <SigilKSMWaitTime>_import(fn, script, symbol.runtime);

    return object;
  }

  if (symbol.type === "KSMWaitMS") {
    const object = new SigilKSMWaitMSInstruction();
    object.time = <SigilKSMWaitTime>_import(fn, script, symbol.time);

    return object;
  }

  if (symbol.type === "KSMReturnVal") {
    const object = new SigilKSMReturnValInstruction();
    object.value = <SigilKSMVariable>_import(fn, script, symbol.value);

    return object;
  }

  if (symbol.type === "KSMSwitch") {
    const object = new SigilKSMSwitchInstruction();

    object.unknown0 = symbol.unknown0;
    object.unknown1 = symbol.unknown1;
    object.value = <SigilKSMVariable>_import(fn, script, symbol.value);

    return object;
  }

  if (symbol.type === "KSMSwitchCase") {
    const object = new SigilKSMCaseInstruction();

    object.unknown0 = symbol.unknown0;
    object.value = <SigilKSMVariable>_import(fn, script, symbol.value);

    return object;
  }

  if (Array.isArray(symbol)) {
    const expr = [];

    for (const el of symbol) {
      if (el === "+") {
        expr.push(new SigilKSMIntrinsic("add"));
      } else if (el === "-") {
        expr.push(new SigilKSMIntrinsic("sub"));
      } else if (el === "&&") {
        expr.push(new SigilKSMIntrinsic("and"));
      } else if (el === "/") {
        expr.push(new SigilKSMIntrinsic("div"));
      } else if (el === "%") {
        expr.push(new SigilKSMIntrinsic("mod"));
      } else if (el === "|") {
        expr.push(new SigilKSMIntrinsic("bwo"));
      } else if (el === "&") {
        expr.push(new SigilKSMIntrinsic("bwa"));
      } else if (el === "^") {
        expr.push(new SigilKSMIntrinsic("bwx"));
      } else if (el === "<<") {
        expr.push(new SigilKSMIntrinsic("bsl"));
      } else if (el === ">>") {
        expr.push(new SigilKSMIntrinsic("bsr"));
      } else if (el === "==") {
        expr.push(new SigilKSMIntrinsic("eq"));
      } else if (el === ">") {
        expr.push(new SigilKSMIntrinsic("gt"));
      } else if (el === ">=") {
        expr.push(new SigilKSMIntrinsic("gte"));
      } else if (el === "(") {
        expr.push(new SigilKSMIntrinsic("left_paren"));
      } else if (el === "<") {
        expr.push(new SigilKSMIntrinsic("lt"));
      } else if (el === "<=") {
        expr.push(new SigilKSMIntrinsic("lte"));
      } else if (el === "*") {
        expr.push(new SigilKSMIntrinsic("mul"));
      } else if (el === "!=") {
        expr.push(new SigilKSMIntrinsic("neq"));
      } else if (el === "next") {
        expr.push(new SigilKSMIntrinsic("next_function"));
      } else if (el === "||") {
        expr.push(new SigilKSMIntrinsic("or"));
      } else if (el === ")") {
        expr.push(new SigilKSMIntrinsic("right_paren"));
      } else if (typeof el === "object") {
        // KSMCall
        expr.push(_import(fn, script, el));
      } else {
        expr.push(_resolve(fn, script, el));
      }
    }

    return <SigilKSMExpression>expr;
  }

  if (typeof symbol === "string") {
    return _resolve(fn, script, symbol);
  }

  console.error(symbol);
  throw new Error("unknown");
}

function _resolve(
  fn: null | SigilKSMFunction,
  script: SigilKSM,
  ref: string
): SigilKSMLabel | SigilKSMImport | SigilKSMVariable | SigilKSMFunction {
  const prop = ref.startsWith("ref:") ? "id" : "name";
  const id = ref.startsWith("ref:") ? Number.parseInt(ref.replace("ref:", "")) : ref;

  for (const im of script.imports.values()) {
    if (im[prop] === id) {
      return im;
    }
  }

  for (const fn of script.functions.values()) {
    if (fn[prop] === id) {
      return fn;
    }
  }

  if (fn !== null && fn instanceof KSMFunction) {
    for (const la of fn.labels.values()) {
      if (la[prop] === id) {
        return la;
      }
    }

    for (const va of fn.variables.values()) {
      if (va[prop] === id) {
        return va;
      }
    }
  }

  for (const va of script.variables.values()) {
    if (va[prop] === id) {
      return va;
    }
  }

  throw new Error(`unknown ref '${ref}'`);
}

const hex = (a: number) => "0x" + a.toString(16).padStart(8, "0").toUpperCase();

async function compile(filepath: string): Promise<void> {
  const script = _import(
    null,
    null,
    IKSM.parse(JSON.parse(await fs.readFile(filepath, "utf8")))
  );

  assert(script instanceof SigilKSM);
  await fs.writeFile(filepath.replace(".json", ".bin"), script.build().steal());
}

async function decompile(filepath: string): Promise<void> {
  const script = new SigilKSM().parse(await fs.readFile(filepath));

  console.log("\nTables:");

  for (const ta of script.tables.values()) {
    console.log(
      `* ${ta.name !== null ? `${ta.name}` : `unnamed_${hex(ta.id)}`} (id: ${hex(ta.id)}, type: ${ta.type})`
    );
  }

  console.log("\nImports:");

  for (const im of script.imports.values()) {
    console.log(
      `* ${im.name !== null ? `${im.name}` : `unnamed_${hex(im.id)}`} (id: ${hex(im.id)})`
    );
  }

  console.log("\nFunctions:");

  for (const fn of script.functions.values()) {
    console.log(
      `* ${fn.name !== null ? `${fn.name}` : `unnamed_${hex(fn.id)}`} (id: ${hex(fn.id)})`
    );
  }

  console.log("\nVariables:");

  for (const va of script.variables.values()) {
    console.log(
      `* ${va.name !== null ? `${va.name}` : `unnamed_${hex(va.id)}`} (id: ${hex(va.id)}, scope: ${va.scope})`
    );
  }

  await fs.writeFile(
    `${filepath}.out.json`,
    JSON.stringify(IKSM.parse(_export(script)), undefined, 4)
  );
}

main();
