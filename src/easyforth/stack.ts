class StackUnderflowError extends Error {
  constructor(name: string) {
    super("Stack underflow in " + name);
  }
}

export class Stack {
  constructor(public name: string) {}

  arr: any[] = [];

  push(item: any) {
    this.arr.push(item);
  }

  peek(offset?: number) {
    offset = offset || 1;
    return this.arr[this.arr.length - offset];
  }

  pop() {
    if (this.arr.length > 0) {
      return this.arr.pop();
    } else {
      throw new StackUnderflowError(this.name);
    }
  }

  print() {
    return this.arr.join(" ") + " <- Top ";
  }
}
