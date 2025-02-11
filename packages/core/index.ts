import z from "zod";
import assert from "node:assert";
import fs from "node:fs/promises";
import process from "node:process";
import { SigilKSM } from "#ksm/ksm";
import type { SigilKSMCommand } from "#ksm/ksm-command";
import { KSMGetArgsInstruction } from "#ksm/ksm-get-args-instruction";
import { KSMFunction, SigilKSMFunction } from "#ksm/ksm-function";
import { KSMVariable, SigilKSMVariable } from "#ksm/ksm-variable";
import { KSMCallInstruction } from "#ksm/ksm-call-instruction";
import { SigilKSMExpression } from "#ksm/ksm-context";
import { KSMReturnInstruction } from "#ksm/ksm-return-instruction";
import { KSMSetInstruction } from "#ksm/ksm-set-instruction";
import { KSMIfInstruction } from "#ksm/ksm-if-instruction";
import { KSMNoOpInstruction } from "#ksm/ksm-noop-cmd";
import { KSMEndIfInstruction } from "#ksm/ksm-end-if-instruction";
import { KSMElseIfInstruction } from "#ksm/ksm-else-if-instruction";
import { KSMElseInstruction } from "#ksm/ksm-else-instruction";
import { KSMWaitInstruction } from "#ksm/ksm-wait-instruction";
import { KSMGotoInstruction } from "#ksm/ksm-goto-instruction";
import { KSMThread2Instruction } from "#ksm/ksm-thread2-instruction";
import { KSMLabelInstruction } from "#ksm/ksm-label-instruction";
import { KSMImport } from "#ksm/ksm-import";
import { SigilKSMIntrinsic } from "#ksm/ksm-intrinsic";

const IKSMIntrisic = z.enum([
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
]);

const IKSMExpression = z.lazy(() =>
  z.union([IKSMIntrisic, IKSMCallInstruction, z.string()]).array()
);

const IKSMCallInstruction = z.object({
  type: z.literal("KSMCall"),
  callee: z.string(),
  arguments: z.string().or(IKSMExpression).array()
});

const IKSMInstruction = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("KSMGetArgs"),
    fn: z.string(),
    arguments: z.string().array()
  }),
  IKSMCallInstruction,
  z.object({
    type: z.enum(["KSMReturn", "KSMNone", "KSMEndIf", "KSMLabelPoint"])
  }),
  z.object({
    type: z.literal("KSMSet"),
    assignee: z.string(),
    value: z.string().or(IKSMExpression)
  }),
  z.object({
    type: z.literal("KSMIf"),
    unknown0: z.number().int(),
    unknown1: z.number().int(),
    unknown2: z.number().int(),
    condition: IKSMExpression
  }),
  z.object({
    type: z.literal("KSMElseIf"),
    unknown0: z.number().int(),
    unknown1: z.number().int(),
    unknown2: z.number().int(),
    unknown3: z.number().int(),
    unknown4: z.number().int(),
    condition: IKSMExpression
  }),
  z.object({
    type: z.literal("KSMElse"),
    unknown0: z.number().int()
  }),
  z.object({
    type: z.literal("KSMWait"),
    time: z.string().or(IKSMExpression)
  }),
  z.object({
    type: z.literal("KSMGoto"),
    label: z.string()
  }),
  z.object({
    type: z.literal("KSMThread2"),
    callee: z.string(),
    give: z.string().array(),
    take: z.number().array()
  })
]);

type IKSMInstruction = z.infer<typeof IKSMInstruction>;

const IKSMLabel = z.object({
  id: z.number().int(),
  address: z.number().int(),
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

const IKSMFunction = z.object({
  name: z.string(),
  public: z.boolean(),
  id: z.number().int(),
  threadfn: z.boolean(),
  unknown0: z.number().int(),
  unknown1: z.number().int(),
  unknown2: z.number().int(),
  labels: IKSMLabel.array(),
  variables: IKSMVariable.array(),
  code: IKSMInstruction.array()
});

type IKSMFunction = z.infer<typeof IKSMFunction>;

const IKSM = z.object({
  imports: IKSMImport.array(),
  functions: IKSMFunction.array(),
  variables: IKSMVariable.array(),
  unknown0: z.number().int().array(),
  unknown1: z.number().int().array(),
  unknown2: z.number().int().array()
});

async function main(): Promise<void> {
  const action = process.argv.at(2);
  const filepath = process.argv.at(3);

  if (action === undefined) {
    throw new Error("missing action");
  } else if (filepath === undefined) {
    throw new Error("missing filepath");
  } else if (action === "-c") {
    // await compile(filepath);
  } else if (action === "-d") {
    await decompile(filepath);
  } else {
    throw new Error(`invalid action '${action}'`);
  }

  console.log("Done...");
}

function _export(symbol: SigilKSM | SigilKSMCommand | SigilKSMExpression): unknown {
  const object = Object.create(null);

  if (Array.isArray(symbol)) {
    const array = [];

    for (const el of symbol) {
      if (
        el instanceof KSMImport ||
        el instanceof KSMVariable ||
        el instanceof KSMFunction
      ) {
        array.push(el.name || `ref:${el.id}`);
        continue;
      }

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
    }
  }

  if (symbol instanceof SigilKSM) {
    const imports: IKSMImport[] = [];
    const functions: IKSMFunction[] = [];
    const variables: IKSMVariable[] = [];

    for (const im of symbol.imports.values()) {
      assert(im.name !== null);
      imports.push({ ...im, name: im.name });
    }

    for (const fn of symbol.functions.values()) {
      const labels: IKSMLabel[] = [];
      const code: IKSMInstruction[] = [];
      const variables: IKSMVariable[] = [];

      for (const la of fn.labels.values()) {
        labels.push({ ...la, address: la.code });
      }

      for (const va of fn.variables.values()) {
        variables.push(va);
      }

      for (const instruction of fn.instructions) {
        code.push(<IKSMInstruction>_export(instruction));
      }

      assert(fn.name !== null);
      functions.push({ ...fn, code, labels, variables, name: fn.name });
    }

    for (const va of symbol.variables.values()) {
      variables.push(va);
    }

    object.imports = imports;
    object.functions = functions;
    object.variables = variables;
    object.unknown0 = symbol.unknown0;
    object.unknown1 = symbol.unknown1;
    object.unknown2 = symbol.unknown2;

    return object;
  }

  if (symbol instanceof SigilKSMFunction) {
    object.type = "KSMFunctionReference";

    if (symbol.name !== null) {
      object.name = symbol.name;
    } else {
      object.id = symbol.id;
    }

    return object;
  }

  if (symbol instanceof KSMLabelInstruction) {
    object.type = "KSMLabelPoint";
    return object;
  }

  if (symbol instanceof KSMThread2Instruction) {
    object.type = "KSMThread2";
    Object.assign(object, symbol);

    object.give = symbol.give.map((g) => g.name || `ref:${g.id}`);
    object.callee = symbol.callee.name || `ref:${symbol.callee.id}`;

    return object;
  }

  if (symbol instanceof KSMGotoInstruction) {
    object.type = "KSMGoto";
    object.label = symbol.label.name || `ref:${symbol.label.id}`;

    return object;
  }

  if (symbol instanceof KSMReturnInstruction) {
    object.type = "KSMReturn";
    return object;
  }

  if (symbol instanceof KSMCallInstruction) {
    object.type = "KSMCall";
    object.callee = symbol.callee.name || `ref:${symbol.callee.id}`;

    object.arguments = symbol.arguments.map((a) =>
      Array.isArray(a) ? _export(a) : a.name || `ref:${a.id}`
    );

    return object;
  }

  if (symbol instanceof KSMGetArgsInstruction) {
    object.type = "KSMGetArgs";
    object.fn = symbol.fn.name || symbol.fn.id;
    object.arguments = symbol.arguments.map((a) => a.name || `ref:${a.id}`);

    return object;
  }

  if (symbol instanceof KSMSetInstruction) {
    object.type = "KSMSet";
    object.value = _export(symbol.value);
    object.assignee = symbol.assignee.name || `ref:${symbol.assignee.id}`;

    return object;
  }

  if (symbol instanceof KSMEndIfInstruction) {
    object.type = "KSMEndIf";
    return object;
  }

  if (symbol instanceof KSMNoOpInstruction) {
    object.type = "KSMNone";
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

  if (symbol instanceof KSMWaitInstruction) {
    object.type = "KSMWait";
    object.time = _export(symbol.time);

    return object;
  }

  console.error(symbol);
  throw new Error("unknown");
}

// async function compile(path: string): Promise<void> {}

async function decompile(filepath: string): Promise<void> {
  const script = _export(new SigilKSM().parse(await fs.readFile(filepath)));

  await fs.writeFile(
    `${filepath}.out.json`,
    JSON.stringify(IKSM.parse(script), undefined, 4)
  );
}

main();
