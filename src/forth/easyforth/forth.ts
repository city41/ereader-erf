import { Dictionary } from "./dictionary";
import { Memory } from "./memory";
import { addPredefinedWords } from "./predefined";
import { Stack } from "./stack";
import { Token, Tokenizer } from "./tokenizer";
import { AnyFunction, Context } from "./types";

type Action = any;

type Callbacks = {
  lineCallback: AnyFunction;
  outputCallback: AnyFunction;
};

type Definition = {
  name: string;
  actions: Action[];
};

function isCallbacks(v: any): v is Callbacks {
  if (!v) {
    return false;
  }

  return "lineCallback" in v;
}

class MissingWordError extends Error {
  constructor(word: string) {
    super(word + "?");
  }
}

class Forth {
  // Core structures
  context: Context = {
    stack: new Stack("Argument Stack"),
    returnStack: new Stack("Return Stack"),
    dictionary: new Dictionary(),
    memory: new Memory(),
    // This is set when the interpreter is waiting for a key to be pressed or sleeping
    pause: false,
    // This is set within readLine as a callback to continue processing tokens
    // once a key has been pressed or sleep has finished
    onContinue: null,
  };

  // This variable is shared across multiple calls to readLine,
  // as definitions can span multiple lines
  currentDefinition: Definition | null = null;

  constructor(private next: AnyFunction) {
    addPredefinedWords(this.addToDictionary, this.readLines, () => {
      next({
        readLine: this.readLine,
        readLines: this.readLines,
        getStack() {
          return this.context.stack.print();
        },
        setMemoryHandler(cb: AnyFunction) {
          this.context.onMemoryChange = (address: number, value: any) => {
            cb(address, value, this.context.memory.getVariable("graphics"));
          };
        },
      });
    });
  }

  namedFunction(name: string, func: AnyFunction) {
    (func as any)._name = name;
    return func;
  }

  // Convert token into an action that executes that token's behavior
  tokenToAction(token: Token) {
    var word = token.value;
    var definition = this.context.dictionary.lookup(word);

    if (token.isStringLiteral) {
      return this.namedFunction("String: " + word, (context) => word);
    } else if (definition !== null) {
      return definition;
    } else if (isFinite(Number(word))) {
      return this.namedFunction("Number: " + word, (context) => {
        context.stack.push(+word);
      });
    } else {
      throw new MissingWordError(word);
    }
  }

  addToDictionary(name: string, definition: AnyFunction) {
    this.context.dictionary.add(name, this.namedFunction(name, definition));
  }

  // compile actions into definition and add definition to dictionary
  compileAndAddToDictionary(name: string, actions: Action[]) {
    var definition = compile(this.context.dictionary, actions);
    this.addToDictionary(name, definition);
  }

  createVariable(name: string) {
    let pointer = this.context.memory.addVariable(name);
    this.addToDictionary(name, (context) => {
      context.stack.push(pointer);
    });
  }

  createConstant(name: string, value: any) {
    this.addToDictionary(name, (context) => {
      context.stack.push(value);
    });
  }

  startDefinition(name: string) {
    this.currentDefinition = { name, actions: [] };
  }

  endDefinition() {
    if (this.currentDefinition === null) {
      throw new Error("forth#endDefinition: currentDefinition is null");
    }

    this.compileAndAddToDictionary(
      this.currentDefinition.name,
      this.currentDefinition.actions
    );
    this.currentDefinition = null;
  }

  addActionToCurrentDefinition(action: Action) {
    if (this.currentDefinition === null) {
      throw new Error("forth#endDefinition: currentDefinition is null");
    }

    if (action.code === ";") {
      this.endDefinition();
    } else {
      this.currentDefinition.actions.push(action);
    }
  }

  executeRuntimeAction(
    tokenizer: Tokenizer,
    action: Action,
    next: AnyFunction
  ) {
    switch (action.code) {
      case "variable":
        this.createVariable(tokenizer.requiredNextToken().value);
        break;
      case "constant":
        this.createConstant(
          tokenizer.requiredNextToken().value,
          this.context.stack.pop()
        );
        break;
      case ":":
        this.startDefinition(tokenizer.requiredNextToken().value);
        break;
      default:
        if (action.length == 2) {
          // has next callback
          action(this.context, next);
        } else {
          next(action(this.context));
        }
        return;
    }

    next("");
  }

  // Read a line of input. Callback is called with output for this line.
  readLine(
    line: string,
    outputCallback: AnyFunction | null,
    next?: AnyFunction | null
  ) {
    if (!next) {
      next = outputCallback;
      outputCallback = null;
    }
    this.context.addOutput = outputCallback || function () {};
    var tokenizer = new Tokenizer(line);

    // processNextToken recursively executes tokens
    const processNextToken = () => {
      var nextToken = tokenizer.nextToken();

      if (!nextToken) {
        // reached end of line
        if (!this.currentDefinition) {
          // don't append output while definition is in progress
          if (!this.context.addOutput) {
            throw new Error(
              "Forth#readLine: context does not have an addOutput callback set up"
            );
          }
          this.context.addOutput(" ok");
        }
        if (!next) {
          throw new Error("Forth#readLine: next() should be defined here");
        }
        next();
        return;
      }

      const action = this.tokenToAction(nextToken);

      if (this.currentDefinition) {
        // Are we currently defining a definition?
        this.addActionToCurrentDefinition(action);
        processTokens();
      } else {
        this.executeRuntimeAction(tokenizer, action, (output) => {
          if (!this.context.addOutput) {
            throw new Error(
              "Forth#readLine: context does not have an addOutput callback set up"
            );
          }
          this.context.addOutput(output);

          if (this.context.pause) {
            this.context.onContinue = processTokens;
          } else {
            processTokens();
          }
        });
      }
    };

    const processTokens = () => {
      try {
        processNextToken();
      } catch (e) {
        this.currentDefinition = null;
        const message = e instanceof Error ? e.message : String(e);

        if (!this.context.addOutput) {
          throw new Error(
            "Forth#processTokens: need to call context.addOutput, but it is undefined"
          );
        }
        this.context.addOutput(" " + message);
        if (!next) {
          throw new Error(
            "#Forth#readLine#processTokens: next() should be defined here"
          );
        }
        next();
      }
    };

    processTokens();
  }

  readLines(
    codeLines: string[],
    callbacks: Callbacks | AnyFunction,
    next?: AnyFunction
  ) {
    if (callbacks && !next) {
      next = callbacks as AnyFunction;
    }

    if (codeLines.length == 0) {
      next!();
      return;
    }

    var codeLine = codeLines[0];

    isCallbacks(callbacks) && callbacks.lineCallback(codeLine);
    this.readLine(
      codeLine,
      isCallbacks(callbacks) ? callbacks.outputCallback : null,
      () => {
        this.readLines(codeLines.slice(1), callbacks, next);
      }
    );
  }
}
