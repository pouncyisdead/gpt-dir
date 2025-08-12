# GPT Directory Converter

A powerful Node.js CLI tool that converts directories into structured text files optimized for AI processing, with smart filtering, visual trees, and content processing options.

## 🚀 Features

- **Smart File Filtering**: Automatically excludes binaries, `node_modules`, `.git`, and other unwanted files
- **Visual Directory Trees**: Unicode-based folder structure with emoji file type icons
- **Content Processing**: Minification and character escaping options
- **Progress Tracking**: Real-time progress bars and detailed statistics
- **Multiple Input Support**: Process multiple directories in a single run
- **TypeScript**: Fully typed with comprehensive error handling

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>
cd gpt-directory-converter

# Install dependencies
npm install

# Build the project
npm run build
```

## 🔧 Usage

### Basic Usage

```bash
# Convert a single directory
npm run start -- -i ./project -o ./output

# Convert multiple directories
npm run start -- -i ./src -i ./docs -o ./output

# With custom options
npm run start -- -i ./project -o ./output --minify false --tree --clean
```

### CLI Options

- `-i, --input <dirs...>`: Input directories to convert (required)
- `-o, --output <dir>`: Output directory for converted files (default: './output')
- `--minify [value]`: Minify content by removing extra whitespace (default: true)
- `--escape [value]`: Escape special characters for AI safety (default: true)  
- `--tree [value]`: Include visual directory tree in output (default: true)
- `--clean`: Clean output directory before conversion
- `-h, --help`: Display help information

### Boolean Options

Boolean options support multiple formats:
- `--minify` or `--minify true` - Enable
- `--minify false` - Disable
- `-m false` - Disable (short form)

## 📊 Output Format

The tool generates structured text files with the following sections:

```text
=== CONVERSION from './project' ===

=== DETAILS ===
Generated: 2024-01-15 10:30:45
Options: minify=true, escape=true, tree=true
Files: 2 processed, 1 skipped
Size: 23.45 KB
Duration: 150ms
=== END DETAILS ===

=== TREE ===
📁 project/
├── 📁 src/
│   ├── 🔧 index.ts
│   └── 📄 utils.ts
└── 📖 README.md
=== END TREE ===

=== FILES ===

=== FILE: './project/src/index.ts' ===
[file contents here]
=== END FILE: './project/src/index.ts' ===
Size: 1024 bytes, Type: .ts

=== END FILES ===

=== END CONVERSION ===
```

## 🎯 File Processing

### Included Files
- Text files (`.txt`, `.md`, `.json`, etc.)
- Source code files (`.js`, `.ts`, `.py`, `.java`, etc.)
- Configuration files (`package.json`, `tsconfig.json`, etc.)
- Documentation files

### Excluded Files/Directories
- Binary files (executables, images, videos, archives)
- `node_modules`, `.git`, `.DS_Store`
- Files larger than 1MB
- Hidden files and directories (starting with `.`)

### File Type Icons
- 📁 Directories
- 🟨 JavaScript files
- 🔷 TypeScript files  
- ⚛️ React components
- 🌐 HTML files
- 🎨 CSS/SCSS files
- 🔧 Configuration files
- 📖 Documentation files
- 📄 Generic text files

## 🏗️ Architecture

The project is organized into modular TypeScript components:

- **`src/gpt-dir.ts`**: CLI entry point with Commander.js integration
- **`src/converter.ts`**: Core conversion logic and orchestration
- **`src/file-processor.ts`**: File reading, filtering, and content processing
- **`src/tree-generator.ts`**: Visual directory tree generation
- **`src/types.ts`**: TypeScript type definitions

## ⚡ Performance

- Processes files asynchronously for optimal performance
- Real-time progress tracking with visual progress bars
- Memory-efficient streaming for large directory structures
- Comprehensive error handling and graceful degradation

## 🛠️ Development

```bash
# Run in development mode
npm run dev -- -i ./example -o ./output

# Build for production
npm run build

# Run built version
node dist/gpt-dir.js -i ./example -o ./output
```

## 📝 License

MIT License - feel free to use this tool for your projects!