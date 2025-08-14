import { assertEquals } from "jsr:@std/assert";
import { isTTY } from "../src/utils.ts";

Deno.test(
  "isTTY returns false when Deno.stdout.isTerminal is mocked to return false",
  () => {
    const orig = Deno.stdout.isTerminal;
    try {
      Deno.stdout.isTerminal = () => false;
      assertEquals(isTTY(), false);
    } finally {
      Deno.stdout.isTerminal = orig;
    }
  }
);

Deno.test(
  "isTTY returns true when Deno.stdout.isTerminal is mocked to return true",
  () => {
    const orig = Deno.stdout.isTerminal;
    try {
      Deno.stdout.isTerminal = () => true;
      assertEquals(isTTY(), true);
    } finally {
      Deno.stdout.isTerminal = orig;
    }
  }
);
