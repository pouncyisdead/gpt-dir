import { assertEquals } from "jsr:@std/assert";
import { escapeContent, minifyContent } from "../src/utils.ts";

Deno.test("escape minimal leaves text mostly intact", () => {
  const s = "=== heading\nok\x1Eok\n";
  const e = escapeContent(s, "minimal");
  // zero-width space prefixes "===" and \x1E is escaped
  assertEquals(e.includes("\\x1E"), true);
  assertEquals(e.includes("=== heading"), true);
});

Deno.test("escape strict json-stringifies", () => {
  const s = "line1\nline2";
  const e = escapeContent(s, "strict");
  assertEquals(e.startsWith('"') && e.endsWith('"'), true);
});

Deno.test("minify collapses blank lines", () => {
  const s = "a\n\n\nb";
  assertEquals(minifyContent(s), "a\n\nb");
});
