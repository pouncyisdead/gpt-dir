import { relative } from "@std/path";
import { crypto } from "jsr:@std/crypto"; // deno std polyfill for subtle (ensures availability)

export function toPosix(p: string): string {
  return p.replaceAll("\\", "/");
}

export function relPosix(from: string, to: string): string {
  const r = relative(from, to);
  return toPosix(r || ".");
}

export async function sha256Hex(data: Uint8Array): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-256", data);
  const bytes = new Uint8Array(hash);
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function isProbablyBinaryByExt(path: string): boolean {
  const exts = [
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".webp",
    ".ico",
    ".bmp",
    ".tiff",
    ".pdf",
    ".woff",
    ".woff2",
    ".ttf",
    ".otf",
    ".zip",
    ".gz",
    ".tar",
    ".bz2",
    ".7z",
    ".mp3",
    ".wav",
    ".m4a",
    ".flac",
    ".mp4",
    ".mov",
    ".mkv",
    ".webm",
  ];
  const lower = path.toLowerCase();
  return exts.some((e) => lower.endsWith(e));
}

export function detectBinarySample(bytes: Uint8Array): boolean {
  // If there are nulls or many non-texty bytes, call it binary.
  let nonText = 0;
  const len = Math.min(bytes.length, 4096);
  for (let i = 0; i < len; i++) {
    const b = bytes[i];
    if (b === 0) return true;
    // Allow common text range + whitespace + UTF-8 multibyte starts.
    if (
      !(b === 9 || b === 10 || b === 13 || (b >= 32 && b <= 126) || b >= 194)
    ) {
      nonText++;
    }
  }
  return nonText > len * 0.3;
}

export function minifyContent(text: string): string {
  // Normalize EOL and trim trailing spaces and excessive blank lines.
  const normalized = text.replaceAll("\r\n", "\n");
  const lines = normalized.split("\n").map((l) => l.replace(/[ \t]+$/g, ""));
  // Collapse 3+ blank lines to at most 1 blank line
  const out: string[] = [];
  let blankRun = 0;
  for (const l of lines) {
    if (l.trim() === "") {
      blankRun++;
      if (blankRun <= 1) out.push("");
    } else {
      blankRun = 0;
      out.push(l);
    }
  }
  return out.join("\n");
}

export function escapeContent(
  text: string,
  mode: "none" | "minimal" | "strict",
): string {
  if (mode === "none") return text;
  if (mode === "strict") {
    return JSON.stringify(text);
  }
  // minimal: escape record separator and sentinel line heads
  let out = text.replaceAll("\x1E", "\\x1E");
  out = out.replaceAll("\n=== ", "\n\u200B=== "); // zero-width space
  if (out.startsWith("=== ")) out = "\u200B" + out;
  return out;
}

let __isTerminalOverride: (() => boolean) | null = null;
export function __setIsTerminalOverride(fn: (() => boolean) | null) {
  __isTerminalOverride = fn;
}
export function isTTY(): boolean {
  try {
    // Deno 1.40+: Deno.stdout.isTerminal()
    if (__isTerminalOverride) return __isTerminalOverride();
    // deno-lint-ignore no-explicit-any
    const termFn = (Deno.stdout as any)?.isTerminal;
    return typeof termFn === "function" ? termFn.call(Deno.stdout) : false;
  } catch {
    return false;
  }
}

export function nowIso(): string {
  return new Date().toISOString();
}
