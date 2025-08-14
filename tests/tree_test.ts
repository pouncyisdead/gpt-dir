import { assert } from "jsr:@std/assert";
import { buildTree } from "../src/tree.ts";

Deno.test("tree excludes directories before adding", async () => {
  const tmp = await Deno.makeTempDir();
  try {
    await Deno.mkdir(`${tmp}/keep`);
    await Deno.mkdir(`${tmp}/skip`);
    await Deno.writeTextFile(`${tmp}/keep/a.txt`, "a");
    await Deno.writeTextFile(`${tmp}/skip/b.txt`, "b");
    const tree = await buildTree(tmp, (rel) => rel.startsWith("skip"));
    assert(tree.includes("keep"));
    assert(!tree.includes("skip")); // excluded dir should not appear
  } finally {
    await Deno.remove(tmp, { recursive: true });
  }
});
