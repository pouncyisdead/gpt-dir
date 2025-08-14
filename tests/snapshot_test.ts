import { assert } from "jsr:@std/assert@1.0.6";
import { convertDirectories } from "../src/converter.ts";

Deno.test("basic convert text", async () => {
  const tmp = await Deno.makeTempDir();
  try {
    await Deno.writeTextFile(`${tmp}/.gptdirignore`, "");
    await Deno.writeTextFile(`${tmp}/x.txt`, "hello\n\n\nworld  \n");
    const res = await convertDirectories({
      inputDirs: [tmp],
      tree: false,
      outFile: undefined,
      format: "text",
      escapeMode: "minimal",
      minify: true,
      includeGlobs: [],
      excludeGlobs: [],
      maxSize: undefined,
      progress: false,
      jsonPretty: false,
    });
    const text = res.text!;
    assert(text.includes("=== GPT-DIR v1 ==="));
    assert(text.includes("x.txt"));
    // minify collapsed blanks
    assert(text.includes("hello\n\nworld"));
  } finally {
    await Deno.remove(tmp, { recursive: true });
  }
});
