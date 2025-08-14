export type EscapeMode = "none" | "minimal" | "strict";
export type OutputFormat = "text" | "json";

export interface Options {
  inputDirs: string[];
  tree: boolean;
  outFile?: string;
  format: OutputFormat;
  escapeMode: EscapeMode;
  minify: boolean;
  includeGlobs: string[];
  excludeGlobs: string[];
  maxSize?: number;
  progress: boolean;
  jsonPretty: boolean;
}

export interface FileEntry {
  absolutePath: string;
  relativePath: string; // POSIX style
  size: number;
  mtime: Date | null;
  isBinary: boolean;
  hash?: string;
}

export interface WalkResult {
  files: FileEntry[];
  tree?: string;
  perInputStats: Record<string, { processed: number; skipped: number; bytes: number }>;
  total: { processed: number; skipped: number; bytes: number };
}

export interface ConvertResult {
  manifest: Record<string, unknown>;
  text?: string;
  json?: unknown;
}
