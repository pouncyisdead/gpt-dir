import { walk } from "@std/fs/walk";
import { relative } from "@std/path";
import {
  detectBinarySample,
  escapeContent,
  isProbablyBinaryByExt,
  minifyContent,
  nowIso,
  relPosix,
  sha256Hex,
  toPosix,
} from "./utils.ts";
import type { ConvertResult, FileEntry, Options, WalkResult } from "./types.ts";
import { loadIgnores } from "./ignore.ts";
import { buildTree } from "./tree.ts";

const RS = "\x1E";

export async function collect(options: Options): Promise<WalkResult> {
  const perInputStats: Record<string, { processed: number; skipped: number; bytes: number }> = {};
  const files: FileEntry[] = [];
  const include = options.includeGlobs;
  const exclude = options.excludeGlobs;

  for (const dir of options.inputDirs) {
    perInputStats[dir] = { processed: 0, skipped: 0, bytes: 0 };
    const ignore = loadIgnores(dir, exclude);

    for await (
      const entry of walk(dir, { includeFiles: true, includeDirs: true, followSymlinks: false })
    ) {
      const rel = relPosix(dir, entry.path);
      if (rel === ".") continue; // skip root dummy

      // Exclude directories: skip walking into them by letting walk handle; we filter files below.
      if (entry.isDirectory) {
        // Nothing to do; walk will iterate but we only act on files
        continue;
      }

      const relPath = toPosix(relative(dir, entry.path));
      // Include/exclude checks
      if (ignore.match(relPath)) {
        perInputStats[dir].skipped++;
        continue;
      }
      if (include.length > 0) {
        // If includes are specified, require at least one to match
        const matches = include.some((g) => new RegExp(globToRegex(g)).test(relPath));
        if (!matches) {
          perInputStats[dir].skipped++;
          continue;
        }
      }

      const info = await Deno.stat(entry.path);
      if (options.maxSize && info.size > options.maxSize) {
        perInputStats[dir].skipped++;
        continue;
      }

      const isBin = isProbablyBinaryByExt(relPath) || await isBinarySample(entry.path);
      files.push({
        absolutePath: entry.path,
        relativePath: relPath,
        size: info.size,
        mtime: info.mtime ?? null,
        isBinary: isBin,
      });
      perInputStats[dir].processed++;
      perInputStats[dir].bytes += info.size;
    }
  }

  // Optional emoji tree built per root and concatenated
  let tree: string | undefined;
  if (options.tree) {
    const segments: string[] = [];
    for (const dir of options.inputDirs) {
      const ignore = loadIgnores(dir, exclude);
      const excludeDirMatcher = (rel: string) => ignore.match(rel);
      segments.push(await buildTree(dir, excludeDirMatcher));
    }
    tree = segments.join("\n");
  }

  const total = Object.values(perInputStats).reduce((acc, s) => ({
    processed: acc.processed + s.processed,
    skipped: acc.skipped + s.skipped,
    bytes: acc.bytes + s.bytes,
  }), { processed: 0, skipped: 0, bytes: 0 });

  return { files, tree, perInputStats, total };
}

function globToRegex(glob: string): string {
  // minimal glob to regex for include matching; exclude handled by ignore loader
  // convert * to .*, ? to ., keep /
  const re = glob.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".");
  return `^${re}$`;
}

async function isBinarySample(path: string): Promise<boolean> {
  try {
    const f = await Deno.open(path, { read: true });
    const buf = new Uint8Array(4096);
    const n = await f.read(buf);
    f.close();
    if (!n) return false;
    return detectBinarySample(buf.subarray(0, n));
  } catch {
    return false;
  }
}

async function readFileUint8(path: string): Promise<Uint8Array> {
  return await Deno.readFile(path);
}

export async function convertDirectories(options: Options): Promise<ConvertResult> {
  const walkRes = await collect(options);

  // Read files with small concurrency
  const pool = 8;
  let idx = 0;
  const contents: { entry: FileEntry; data: Uint8Array }[] = [];
  const errors: { path: string; error: string }[] = [];

  async function worker() {
    while (true) {
      const i = idx++;
      if (i >= walkRes.files.length) break;
      const entry = walkRes.files[i];
      try {
        const data = await readFileUint8(entry.absolutePath);
        contents.push({ entry, data });
      } catch (e) {
        errors.push({ path: entry.absolutePath, error: String(e) });
      }
    }
  }
  await Promise.all(Array.from({ length: pool }, worker));

  // Build manifest
  const manifest = {
    version: 1,
    generatedAt: nowIso(),
    inputDirs: options.inputDirs,
    counts: {
      files: walkRes.files.length,
      bytes: walkRes.total.bytes,
    },
    perInput: walkRes.perInputStats,
    options: {
      tree: options.tree,
      format: options.format,
      escapeMode: options.escapeMode,
      minify: options.minify,
      maxSize: options.maxSize ?? null,
    },
    errors,
  };

  if (options.format === "json") {
    const files = await Promise.all(contents.map(async ({ entry, data }) => {
      const text = entry.isBinary ? "(binary omitted)" : new TextDecoder().decode(data);
      const content0 = options.minify && !entry.isBinary ? minifyContent(text) : text;
      const content = escapeContent(content0, options.escapeMode);
      const hash = await sha256Hex(data);
      return {
        path: entry.relativePath,
        size: entry.size,
        mtime: entry.mtime?.toISOString() ?? null,
        hash,
        isBinary: entry.isBinary,
        content,
      };
    }));

    const json = {
      manifest,
      tree: walkRes.tree,
      files,
    };
    return { manifest, json };
  }

  // TEXT FORMAT
  const parts: string[] = [];
  parts.push("=== GPT-DIR v1 ===");
  parts.push("BEGIN:MANIFEST_JSON");
  parts.push(JSON.stringify(manifest));
  parts.push("END:MANIFEST_JSON");
  if (walkRes.tree) {
    parts.push("=== TREE ===");
    parts.push(walkRes.tree);
  }
  parts.push("=== FILES ===");

  for (const { entry, data } of contents) {
    const hash = await sha256Hex(data);
    parts.push(
      `${RS} FILE path=${entry.relativePath} size=${entry.size} mtime=${
        entry.mtime?.toISOString() ?? "null"
      } hash=${hash}`,
    );
    if (entry.isBinary) {
      parts.push("(binary omitted)");
    } else {
      const text = new TextDecoder().decode(data);
      const content0 = options.minify ? minifyContent(text) : text;
      const content = escapeContent(content0, options.escapeMode);
      parts.push(content);
    }
    parts.push(`${RS} END FILE`);
  }

  return { manifest, text: parts.join("\n") };
}
