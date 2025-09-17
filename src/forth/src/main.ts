import * as fsp from "node:fs/promises";
import * as path from "node:path";

function tokenize(src: string): string[] {
  const lines = src.split("\n");

  return lines.flatMap((line) => {
    return line.split(" ").map((t) => t.trim());
  });
}

async function main(erfPath: string) {
  const src = (await fsp.readFile(erfPath)).toString();
  const tokens = tokenize(src);

  const stack: any[] = [];
  const output: string[] = [];

  while (tokens.length) {
    const cur = tokens.shift();

    const asm = number(cur) || erapi(cur) || loop(cur);
  }
}

if (require.main === module) {
  const [_tsNode, _main, erfFilePath] = process.argv;

  if (!erfFilePath) {
    console.error("usage: ts-node forth/main.ts <erf-src-path>");
    process.exit(1);
  }

  main(path.resolve(erfFilePath))
    .then(() => console.log("done"))
    .catch((e) => console.error(e));
}
