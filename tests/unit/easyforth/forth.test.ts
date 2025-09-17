import { Forth } from "../../../src//easyforth/forth";

describe("Forth", function () {
  it("should do a simple calculation", function () {
    const next = () => {};
    const output: string[] = [];
    const outputCallback = (o: string) => {
      output.push(o);
    };
    const lines: string[] = [];
    const lineCallback = (l: string) => {
      lines.push(l);
    };

    const forth = new Forth(next);
    forth.readLines(["3", "4", "+", "."], {
      outputCallback,
      lineCallback,
    });

    // TODO: what are the undefineds?
    expect(output).toEqual([
      undefined,
      " ok",
      undefined,
      " ok",
      undefined,
      " ok",
      "7 ",
      " ok",
    ]);
  });
});
