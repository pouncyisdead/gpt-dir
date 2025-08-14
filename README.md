# gpt-dir (Deno-first)

Convert one or more directories into a single **structured text** (or JSON) artifact, optimized for
AI ingestion and code review.

## Quick start

```bash
# Run without installation (defaults to current directory):
deno run -A src/main.ts

# Install as a command:
deno install -A -n gpt-dir src/main.ts

# Or build a native binary:
deno task build
./gpt-dir -i . --profile ai --tree --out-file snapshot.txt
```

## Features

- 🔎 Single pass directory walk with optional emoji tree.
- 🧠 Profiles (e.g., `--profile ai` flips sensible defaults).
- 🧹 `--escape-mode` (`none|minimal|strict`), `--minify` control.
- 📦 Include/exclude via globs and `.gptdirignore` (gitignore-style).
- 🧰 Binary detection with extension + sampling.
- ⚡ Small concurrency pool for IO.
- 🧾 Deterministic, POSIX-style relative paths in output.
- 📊 Per-input and combined stats; manifest header.
- 🖨️ `--format text|json`, `--out-file`, `--max-size`.

## CLI

```shell
gpt-dir [options]

Options:
  -i, --input <dir>          One or more input directories. Defaults to "." (cwd). Repeatable.
  -t, --tree                 Include an emoji directory tree.
  -o, --out-file <path>      Write output to file (otherwise stdout).
  -f, --format <fmt>         Output format: text | json (default: text).
      --escape-mode <m>      none | minimal | strict (default: minimal).
      --minify               Minify file contents (default: false; true in --profile ai).
      --profile <name>       "ai" profile sets: --escape-mode strict, --minify, --tree.
      --include <glob>       Glob to include (repeatable).
      --exclude <glob>       Glob to exclude (repeatable).
      --max-size <bytes>     Skip files larger than this (e.g., 1048576).
      --no-progress          Disable progress display.
      --no-tree              Disable tree generation (same as omitting -t).
      --json-pretty          Pretty-print JSON output.
  -h, --help                 Show help.
```

### `.gptdirignore`

Add patterns (gitignore-style) to exclude files/dirs. Example:

```text
node_modules/
dist/
*.png
```

## Output (text)

```text
=== GPT-DIR v1 ===
BEGIN:MANIFEST_JSON
{...}
END:MANIFEST_JSON
=== TREE ===
<optional tree>
=== FILES ===
\x1E FILE path=<rel> size=<n> mtime=<iso> hash=<sha256>
<content...>
\x1E END FILE
```

- Uses the **Record Separator** control char (`\x1E`) as a sentinel to avoid delimiter collisions.
- `escape-mode`:
  - `none`: emit file contents verbatim.
  - `minimal`: escape only `\x1E` and sentinel lines.
  - `strict`: JSON-stringify the file contents.

## Programmatic API

```ts
import { convertDirectories } from "./mod.ts";

const result = await convertDirectories({
  inputDirs: ["."],
  tree: true,
  escapeMode: "minimal",
  format: "text",
});
console.log(result.text);
```

## License

MIT
