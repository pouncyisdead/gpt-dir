import { basename, extname, relative } from "@std/path";
import { loadIgnores as _loadIgnores } from "./ignore.ts";
import { toPosix } from "./utils.ts";

function getFileIcon(fileName: string): string {
  const ext = extname(fileName).toLowerCase();

  const iconMap: Record<string, string> = {
    ".js": "🟨",
    ".ts": "🔷",
    ".jsx": "⚛️",
    ".tsx": "⚛️",
    ".html": "🌐",
    ".css": "🎨",
    ".scss": "🎨",
    ".less": "🎨",
    ".json": "📋",
    ".md": "📖",
    ".txt": "📄",
    ".yml": "🔧",
    ".yaml": "🔧",
    ".xml": "📋",
    ".csv": "📊",
    ".py": "🐍",
    ".java": "☕",
    ".cpp": "⚙️",
    ".c": "⚙️",
    ".php": "🐘",
    ".rb": "💎",
    ".go": "🐹",
    ".rs": "🦀",
    ".sh": "💻",
    ".bat": "💻",
    ".sql": "🗃️",
  };

  // Configuration files
  const configFiles = [
    "package.json",
    "tsconfig.json",
    "webpack.config.js",
    "vite.config.js",
    "tailwind.config.js",
    ".env",
  ];

  if (configFiles.some((config) => fileName.includes(config))) {
    return "🔧";
  }

  return iconMap[ext] || "📄";
}

export async function buildTree(
  inputDir: string,
  excludeDirMatcher: (rel: string) => boolean,
): Promise<string> {
  // Emoji tree with exclude check BEFORE adding the node.
  const lines: string[] = [];
  const rootName = basename(inputDir) || ".";
  lines.push(`📁 ${rootName}`);

  async function walk(dir: string, prefix: string) {
    const entries: Deno.DirEntry[] = [];
    for await (const e of Deno.readDir(dir)) entries.push(e);
    entries.sort((a, b) => a.name.localeCompare(b.name));
    const lastIdx = entries.length - 1;

    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      const path = `${dir}/${e.name}`;
      const rel = toPosix(relative(inputDir, path));
      const isLast = i === lastIdx;
      const branch = isLast ? "└─" : "├─";
      const nextPrefix = prefix + (isLast ? "  " : "│ ");

      if (e.isDirectory) {
        if (excludeDirMatcher(rel)) continue; // EXCLUDE before adding
        lines.push(`${prefix}${branch}📁 ${e.name}`);
        await walk(path, nextPrefix);
      } else {
        lines.push(`${prefix}${branch}${getFileIcon(e.name)} ${e.name}`);
      }
    }
  }

  await walk(inputDir, "");
  return lines.join("\n");
}
