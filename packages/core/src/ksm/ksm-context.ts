import { CTRMemory } from "libctr";
import type { SigilKSM } from "#ksm/ksm";
import { SigilKSMOpCode } from "#ksm/ksm-opcode";
import { SigilKSMVariable } from "#ksm/ksm-variable";
import { SigilKSMImport } from "#ksm/ksm-import";
import { SigilKSMIntrinsic } from "#ksm/ksm-intrinsic";
import { SigilKSMFunction } from "#ksm/ksm-function";
import { SigilKSMCallInstruction } from "#ksm/ksm-call-instruction";
import { SigilKSMLabel } from "#ksm/ksm-label";

type SigilKSMSymbol = SigilKSMImport | SigilKSMVariable | SigilKSMFunction;

type SigilKSMExpression = (
  | SigilKSMSymbol
  | SigilKSMIntrinsic
  | SigilKSMCallInstruction
)[];

class SigilKSMContext {
  public const: boolean;
  public opcode: number;
  public codeOffset: number;
  public readonly script: SigilKSM;
  public readonly seen: Set<SigilKSMFunction>;

  private readonly _labels: Map<number, SigilKSMLabel>;
  private readonly _scope: Map<number, SigilKSMVariable>;

  public constructor(script: SigilKSM) {
    this._scope = new Map();
    this._labels = new Map();

    this.opcode = 0;
    this.const = false;
    this.codeOffset = 0;
    this.script = script;
    this.seen = new Set();
  }

  public fn(id: number, allowImports: false): SigilKSMFunction;
  public fn(id: number, allowImports: true): SigilKSMImport | SigilKSMFunction;

  public fn(id: number, allowImports: boolean): SigilKSMImport | SigilKSMFunction {
    const im = this.script.imports.get(id);
    const fn = this.script.functions.get(id);

    if (fn !== undefined) {
      return fn;
    }

    if (im !== undefined && allowImports) {
      return im;
    }

    throw new Error("Unknown function with ID" + id);
  }

  public var(id: number): SigilKSMVariable {
    const va = this._scope.get(id) || this.script.variables.get(id);

    if (va === undefined) {
      throw new Error("Unknown variable with ID " + id.toString(16));
    }

    return va;
  }

  public expr(buffer: CTRMemory, expr: SigilKSMExpression): void;

  public expr(
    buffer: CTRMemory,
    initial: null | SigilKSMExpression[number]
  ): SigilKSMExpression;

  public expr(
    buffer: CTRMemory,
    initialOrExpression: null | SigilKSMExpression | SigilKSMExpression[number]
  ): void | SigilKSMExpression {
    if (Array.isArray(initialOrExpression)) {
      for (const part of initialOrExpression) {
        if (
          part instanceof SigilKSMImport ||
          part instanceof SigilKSMFunction ||
          part instanceof SigilKSMVariable
        ) {
          buffer.u32(part.id);
          continue;
        }

        part.build(buffer, this);
      }

      buffer.u32(SigilKSMOpCode.OPCODE_EXPR_END);
      return;
    }

    const expr: SigilKSMExpression = [];

    if (initialOrExpression !== null) {
      expr.push(initialOrExpression);
    }

    let id = buffer.u32();

    while (id !== SigilKSMOpCode.OPCODE_EXPR_END) {
      if (id === SigilKSMOpCode.OPCODE_CALL) {
        this.const = false;
        expr.push(new SigilKSMCallInstruction().parse(buffer, this));
      } else {
        expr.push(this.intr(id) || this.symb(id));
      }

      id = buffer.u32();
    }

    return expr;
  }

  public intr(id: number): null | SigilKSMIntrinsic {
    try {
      const memory = new CTRMemory().u32(id).seek(0);
      return new SigilKSMIntrinsic().parse(memory, this);
    } catch (err) {
      return null;
    }
  }

  public push(fn: SigilKSMFunction): SigilKSMContext {
    const clone = this.clone();

    for (const [id, label] of fn.labels) {
      clone._labels.set(id, label);
    }

    for (const [id, variable] of fn.variables) {
      clone._scope.set(id, variable);
    }

    return clone;
  }

  public symb(id: number): SigilKSMSymbol {
    try {
      return this.var(id);
    } catch {}

    try {
      return this.fn(id, true);
    } catch {}

    throw "bad symbol" + id;
  }

  public clone(): SigilKSMContext {
    const clone = new SigilKSMContext(this.script);
    Object.defineProperty(clone, "seen", { value: this.seen });

    clone.const = this.const;
    clone.opcode = this.opcode;
    clone.codeOffset = this.codeOffset;

    for (const [id, variable] of this._scope) {
      clone._scope.set(id, variable);
    }

    for (const [id, label] of this._labels) {
      clone._labels.set(id, label);
    }

    return clone;
  }

  public label(id: number): SigilKSMLabel {
    const label = this._labels.get(id);

    if (label !== undefined) {
      return label;
    }

    throw new Error("Unknown label with ID" + id);
  }
}

export { SigilKSMContext, SigilKSMContext as KSMContext };

export type {
  SigilKSMSymbol,
  SigilKSMSymbol as KSMSymbol,
  SigilKSMExpression,
  SigilKSMExpression as KSMExpression
};
