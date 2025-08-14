import { assertEquals } from "jsr:@std/assert";
import { __setIsTerminalOverride, isTTY } from "../src/utils.ts";

Deno.test("isTTY respects override: non-TTY", () => {
  __setIsTerminalOverride(() => false);
  try {
    assertEquals(isTTY(), false);
  } finally {
    __setIsTerminalOverride(null);
  }
});

Deno.test("isTTY respects override: TTY", () => {
  __setIsTerminalOverride(() => true);
  try {
    assertEquals(isTTY(), true);
  } finally {
    __setIsTerminalOverride(null);
  }
});
