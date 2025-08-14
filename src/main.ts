#!/usr/bin/env -S deno run -A
import { parseArgs } from "./cli.ts";
import { convertDirectories } from "./converter.ts";

const options = parseArgs(Deno.args);
if (!options) Deno.exit(0);

const res = await convertDirectories(options);

if (options.outFile) {
  const path = options.outFile;
  if (options.format === "json") {
    const text = options.jsonPretty ? JSON.stringify(res.json, null, 2) : JSON.stringify(res.json);
    await Deno.writeTextFile(path, text);
  } else {
    await Deno.writeTextFile(path, res.text!);
  }
  console.log(`Wrote ${options.format} to ${path}`);
} else {
  if (options.format === "json") {
    console.log(options.jsonPretty ? JSON.stringify(res.json, null, 2) : JSON.stringify(res.json));
  } else {
    console.log(res.text);
  }
}
