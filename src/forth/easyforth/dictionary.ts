export class Dictionary {
  dict: Array<[string, any]> = [];

  add(name: string, definition: any) {
    // The dict is searched from beginning to end, so new definitions
    // need to be unshifted.
    this.dict.unshift([name.toLowerCase(), definition]);
  }

  // Missing key returns null
  lookup(key: string) {
    key = key.toLowerCase();
    var item = this.dict.find((item) => item[0] === key);

    return item?.[1] ?? null;
  }
}
