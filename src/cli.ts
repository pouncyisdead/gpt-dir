import { parseArgs as parse } from "jsr:@std/cli/parse-args";
import type { Options } from "./types.ts";

export function parseArgs(argv: string[]): Options | null {
  const a = parse(argv, {
    string: ["out-file", "format", "escape-mode", "profile", "include", "exclude", "max-size"],
    boolean: ["tree", "minify", "no-progress", "no-tree", "json-pretty", "help"],
    alias: {
      f: "format",
      h: "help",
      i: "input",
      o: "out-file",
      p: "profile",
      t: "tree",
    },
    default: {
      format: "text",
      "escape-mode": "minimal",
    },
    "--": true,
  });

  if (a.help) {
    console.log(help());
    return null;
  }

  const inputs = ([] as string[]).concat(a.i as string[] ?? a.input ?? []);
  const inputDirs = inputs.length ? inputs : ["."];
  const include = ([] as string[]).concat(a.include ?? []);
  const exclude = ([] as string[]).concat(a.exclude ?? []);
  const profile = a.profile as string | undefined;

  let escapeMode = (a["escape-mode"] as "none" | "minimal" | "strict") ?? "minimal";
  let minify = !!a.minify;
  let tree = !!a.tree && !a["no-tree"];

  if (profile === "ai") {
    escapeMode = "strict";
    minify = true;
    tree = true;
  }

  const options: Options = {
    inputDirs,
    tree,
    outFile: a["out-file"],
    format: (a.format as "text" | "json") ?? "text",
    escapeMode,
    minify,
    includeGlobs: include,
    excludeGlobs: exclude,
    maxSize: a["max-size"] ? Number(a["max-size"]) : undefined,
    progress: !a["no-progress"],
    jsonPretty: !!a["json-pretty"],
  };

  return options;
}

export function help(): string {
  return `gpt-dir (Deno-first)
Usage:
  deno run -A src/main.ts [options]

Options:
  -i, --input <dir>          One or more input directories. Default: "."
  -t, --tree                 Include emoji tree.
  -o, --out-file <path>      Write output to a file (otherwise stdout).
  -f, --format <fmt>         text | json (default: text)
      --escape-mode <m>      none | minimal | strict (default: minimal)
      --minify               Minify file contents
      --profile <name>       "ai" -> strict escaping, minify, tree
      --include <glob>       Include glob (repeatable)
      --exclude <glob>       Exclude glob (repeatable)
      --max-size <bytes>     Skip files larger than this
      --no-progress          Disable progress
      --no-tree              Disable tree generation
      --json-pretty          Pretty-print JSON
  -h, --help                 Show help
`;
}
