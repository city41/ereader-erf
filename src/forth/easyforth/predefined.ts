import { AnyFunction, Context, FALSE, TRUE } from "./types";

type AddToDictionary = (key: string, value: any) => void;

export function addPredefinedWords(
  addToDictionary: AddToDictionary,
  readLines: AnyFunction,
  next: AnyFunction
) {
  function controlCode(code: string) {
    return {
      isControlCode: true,
      code,
    };
  }

  [
    ":",
    ";",
    "if",
    "else",
    "then",
    "do",
    "loop",
    "+loop",
    "begin",
    "until",
    "variable",
    "constant",
    "key",
  ].forEach(function (code) {
    addToDictionary(code, controlCode(code));
  });

  addToDictionary(".", function (context: Context) {
    return context.stack.pop() + " ";
  });

  addToDictionary(".s", function (context: Context) {
    return "\n" + context.stack.print();
  });

  addToDictionary("+", function (context: Context) {
    context.stack.push(context.stack.pop() + context.stack.pop());
  });

  addToDictionary("-", function (context: Context) {
    var a = context.stack.pop(),
      b = context.stack.pop();
    context.stack.push(b - a);
  });

  addToDictionary("*", function (context: Context) {
    context.stack.push(context.stack.pop() * context.stack.pop());
  });

  addToDictionary("/", function (context: Context) {
    var a = context.stack.pop(),
      b = context.stack.pop();
    context.stack.push(Math.floor(b / a));
  });

  addToDictionary("/mod", function (context: Context) {
    var a = context.stack.pop(),
      b = context.stack.pop();
    context.stack.push(Math.floor(b % a));
    context.stack.push(Math.floor(b / a));
  });

  addToDictionary("mod", function (context: Context) {
    var a = context.stack.pop(),
      b = context.stack.pop();
    context.stack.push(Math.floor(b % a));
  });

  addToDictionary("=", function (context: Context) {
    context.stack.push(
      context.stack.pop() === context.stack.pop() ? TRUE : FALSE
    );
  });

  addToDictionary("<", function (context: Context) {
    var a = context.stack.pop(),
      b = context.stack.pop();
    context.stack.push(b < a ? TRUE : FALSE);
  });

  addToDictionary(">", function (context: Context) {
    var a = context.stack.pop(),
      b = context.stack.pop();
    context.stack.push(b > a ? TRUE : FALSE);
  });

  addToDictionary("and", function (context: Context) {
    var a = context.stack.pop(),
      b = context.stack.pop();
    context.stack.push(b & a);
  });

  addToDictionary("or", function (context: Context) {
    var a = context.stack.pop(),
      b = context.stack.pop();
    context.stack.push(b | a);
  });

  addToDictionary("invert", function (context: Context) {
    // invert is bitwise not
    context.stack.push(~context.stack.pop());
  });

  addToDictionary("i", function (context: Context) {
    context.stack.push(context.returnStack.peek(1));
  });

  addToDictionary("j", function (context: Context) {
    context.stack.push(context.returnStack.peek(2));
  });

  // I don't understand the difference between i and r@
  // http://www.forth.com/starting-forth/sf5/sf5.html
  addToDictionary("r@", function (context: Context) {
    context.stack.push(context.returnStack.peek(1));
  });

  addToDictionary(">r", function (context: Context) {
    context.returnStack.push(context.stack.pop());
  });

  addToDictionary("r>", function (context: Context) {
    context.stack.push(context.returnStack.pop());
  });

  addToDictionary("emit", function (context: Context) {
    return String.fromCharCode(context.stack.pop());
  });

  addToDictionary("swap", function (context: Context) {
    var a = context.stack.pop(),
      b = context.stack.pop();
    context.stack.push(a);
    context.stack.push(b);
  });

  addToDictionary("dup", function (context: Context) {
    var a = context.stack.pop();
    context.stack.push(a);
    context.stack.push(a);
  });

  addToDictionary("over", function (context: Context) {
    var a = context.stack.pop(),
      b = context.stack.pop();
    context.stack.push(b);
    context.stack.push(a);
    context.stack.push(b);
  });

  addToDictionary("rot", function (context: Context) {
    var a = context.stack.pop(),
      b = context.stack.pop(),
      c = context.stack.pop();
    context.stack.push(b);
    context.stack.push(a);
    context.stack.push(c);
  });

  addToDictionary("drop", function (context: Context) {
    context.stack.pop();
  });

  addToDictionary("!", function (context: Context) {
    var address = context.stack.pop();
    var value = context.stack.pop();
    context.memory.setValue(address, value);
    context.onMemoryChange && context.onMemoryChange(address, value);
  });

  addToDictionary("@", function (context: Context) {
    var address = context.stack.pop();
    context.stack.push(context.memory.getValue(address));
  });

  addToDictionary("allot", function (context: Context) {
    context.memory.allot(context.stack.pop());
  });

  addToDictionary("sleep", function (context: Context) {
    var timeout = context.stack.pop();
    context.pause = true;

    setTimeout(function () {
      context.pause = false;
      context.onContinue?.();
    }, timeout);
  });

  addToDictionary("random", function (context: Context) {
    var range = context.stack.pop();
    context.stack.push(Math.floor(Math.random() * range));
  });

  readLines(
    [
      ": cells   1 * ;",
      ": cr      10 emit ;",
      ": space   32 emit ;",
      ": spaces  0 do space loop ;",
      ": 0=      0 = ;",
      ": 0<      0 < ;",
      ": 0>      0 > ;",
      ": ?dup    dup if dup then ;",
      ": 2dup    over over ;",
      ": 1+      1 + ;",
      ": 1-      1 - ;",
      ": 2+      2 + ;",
      ": 2-      2 - ;",
      ": 2*      2 * ;",
      ": 2/      2 / ;",
      ": negate  -1 * ;",
      ": abs     dup 0< if negate then ;",
      ": min     2dup < if drop else swap drop then ;",
      ": max     2dup < if swap drop else drop then ;",
      ": ?       @ . ;",
      ": +!      dup @ rot + swap ! ;",

      "variable  graphics", // start of graphics memory
      "575 cells allot", // graphics memory takes 24 * 24 = 576 cells altogether
      "variable  last-key", // create last-key variable for keyboard input
    ],
    next
  );
}
