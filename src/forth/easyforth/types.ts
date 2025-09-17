import { Stack } from "./stack";
import { Memory } from "./memory";
import { Dictionary } from "./dictionary";

export type AnyFunction = (...args: any[]) => any;

export type Context = {
  stack: Stack;
  returnStack: Stack;
  dictionary: Dictionary;
  memory: Memory;
  pause: boolean;
  addOutput?: AnyFunction;
  onContinue: null | (() => void);
  onMemoryChange?: (address: number, value: any) => void;
};

export const TRUE = -1;
export const FALSE = 0;
