# **TypeScript Directory Converter - Recreation Guide**

---

## **🎯 Project Overview**

A Node.js CLI tool that converts directories into structured text files
optimized for AI processing, with smart filtering, visual trees, and content
processing options.

## **📦 Project Setup**

```shell
npm init -y
npm add typescript @types/node tsx --save-dev
npm add commander chalk cli-progress mime-types
```

## **🏗️ Core Architecture**

**Main Entry Point (`src/gpt-dir.ts`):**

- CLI argument parsing using Commander.js
- Input validation and help system
- Orchestrates the conversion process

**Core Converter (`src/converter.ts`):**

- `DirectoryConverter` class with main conversion logic
- File filtering and binary detection
- Progress tracking and statistics
- Output file generation

**File Processing (`src/file-processor.ts`):**

- Text file reading and validation
- Content minification (remove extra whitespace/newlines)
- Character escaping for special characters
- Binary file detection using MIME types

**Tree Generator (`src/tree-generator.ts`):**

- Unicode folder tree visualization
- Emoji-based file type icons
- Recursive directory traversal
- Smart sorting (directories first, then files)

**Types (`src/types.ts`):**

```typescript
interface ConversionOptions {
  inputDirs: string[];
  outputDir: string;
  minify: boolean;
  escape: boolean;
  tree: boolean;
  clean: boolean;
}
interface FileStats {
  totalFiles: number;
  processedFiles: number;
  skippedFiles: number;
  fileTypes: Record<string, number>;
  totalSize: number;
}
```

## **🔧 Key Features to Implement**

**Smart File Filtering:**

- Exclude: `node_modules`, `.git`, `.DS_Store`, binaries, files >1MB
- Include: Text files, source code, documentation
- Use MIME type detection for binary files

**Visual Folder Tree:**

- Unicode characters: `├──`, `└──`, `│`
- File type emojis: 📁 folders, 📄 files, 🔧 configs
- Recursive traversal with proper indentation

**Content Processing Options:**

- **Minify**: Remove extra whitespace and empty lines
- **Escape**: Escape special characters for AI safety
- **Tree**: Include/exclude folder tree in output

**CLI Interface:**

```shell
# Basic usage
tsx src/gpt-dir.ts -i ./project -o ./output
# With options
tsx src/gpt-dir.ts -i ./src -i ./docs -o ./output --minify false --tree
# Multiple directories
tsx src/gpt-dir.ts -i ./frontend -i ./backend -o ./combined
```

**Boolean Options Logic:**

- Default: `minify=true, escape=true, tree=true`
- `--minify`\= enable, `--minify true`\= enable, `--minify false`\=
  disable, `-m false`\= disable
- Same pattern for `--escape` and `--tree`

## **📊 Output Format**

```text
=== CONVERSION from './project' ===

=== DETAILS ===
Generated: 2024-01-15 10:30:45
Options: minify=true, escape=true, tree=true
Files: 2 processed, 1 skipped
Size: 23.45 KB
=== END DETAILS ===

=== TREE ===
📁 project/
├── 📁 src/
│   ├── 🔧 index.ts
│   └── 📄 utils.ts
└── 📄 README.md
=== END TREE ===

=== FILES ===

=== FILE: './project/src/index.ts' ===
[index.ts contents here]
=== END FILE: './project/src/index.ts' ===
[index.ts details here]

=== FILE: './project/src/utils.ts' ===
[utils.ts contents here]
=== END FILE: './project/src/utils.ts' ===
[utils.ts details here]

=== END FILES ===

=== END CONVERSION ===
```

## **⚡ Implementation Tips**

- Use `cli-progress` for progress bars
- Use `chalk` for colored console output
- Implement graceful shutdown with `process.on('SIGINT')`
- Add comprehensive error handling
- Use async/await for file operations
- Generate statistics and timing information

This guide provides a blueprint for recreating the directory converter as a
modern TypeScript project with all the features we developed.
