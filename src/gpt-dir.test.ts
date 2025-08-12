/// <reference lib="deno.ns" />

import { assert, assertEquals } from 'jsr:@std/assert';

Deno.test('assert works correctly', () => {
  assert(true);
  assertEquals(1, 1);
});
