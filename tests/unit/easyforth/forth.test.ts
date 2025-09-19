import { Forth } from "../../../src//easyforth/forth";
import { AnyFunction } from "../../../src/easyforth/types";

describe("Forth", function () {
  function createInterpreter() {
    const output: string[] = [];
    const outputCallback = (o: string) => {
      if (o !== undefined) {
        output.push(o.toString().trim());
      }
    };
    const lines: string[] = [];
    const lineCallback = (l: string) => {
      lines.push(l);
    };

    const forth = new Forth(() => {});

    function readLines(lines: string[], next?: AnyFunction) {
      forth.readLines(
        lines,
        {
          outputCallback,
          lineCallback,
        },
        next
      );
    }

    return { readLines, output, lines };
  }

  it("should do a simple calculation", function (done) {
    const { output, lines, readLines } = createInterpreter();

    const inputLines = ["3", "4", "+", "."];

    readLines(inputLines, function () {
      expect(output).toEqual(["ok", "ok", "ok", "7", "ok"]);
      done();
    });
  });

  it("should support functions", function (done) {
    const { output, readLines } = createInterpreter();

    const lines = [": foo 3 + ; 2 foo ."];
    readLines(lines, function () {
      expect(output).toEqual(["", "5", "ok"]);
      done();
    });
  });

  it("should support do loops in a function", function (done) {
    const { output, readLines } = createInterpreter();

    const lines = [": loop-test 3 0 do i . loop ;", "loop-test"];
    readLines(lines, function () {
      expect(output).toEqual(["", "ok", "0", "1", "2", "ok"]);
      done();
    });
  });

  it.only("should support do loops directly", function (done) {
    const { output, readLines } = createInterpreter();

    const lines = ["3 0 do i . loop"];
    readLines(lines, function () {
      expect(output).toEqual(["0", "1", "2", "ok"]);
      done();
    });
  });
});
