export class Memory {
  variables = Object.create(null);
  memArray: number[] = [];
  _memPointer = 1000;

  newMemPointer() {
    return this._memPointer++;
  }

  addVariable(name: string) {
    var address = this.newMemPointer();
    this.variables[name.toLowerCase()] = address;
    this.memArray[address];
    return this.getVariable(name);
  }

  getVariable(name: string) {
    return this.variables[name.toLowerCase()];
  }

  setValue(address: number, value: number) {
    this.memArray[address] = value;
  }

  getValue(address: number): number {
    return this.memArray[address] || 0;
  }

  allot(cells: number) {
    this._memPointer += cells;
  }
}
