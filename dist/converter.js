"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirectoryConverter = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const cli_progress_1 = __importDefault(require("cli-progress"));
const file_processor_1 = require("./file-processor");
const tree_generator_1 = require("./tree-generator");
class DirectoryConverter {
    constructor() {
        this.fileProcessor = new file_processor_1.FileProcessor();
        this.treeGenerator = new tree_generator_1.TreeGenerator();
    }
    async convert(options) {
        const startTime = new Date();
        console.log(chalk_1.default.blue('🚀 Starting directory conversion...'));
        // Initialize stats
        const stats = {
            totalFiles: 0,
            processedFiles: 0,
            skippedFiles: 0,
            fileTypes: {},
            totalSize: 0
        };
        const allFiles = [];
        let tree = '';
        // Ensure output directory exists
        await fs.mkdir(options.outputDir, { recursive: true });
        // Process each input directory
        for (const inputDir of options.inputDirs) {
            console.log(chalk_1.default.yellow(`📂 Processing directory: ${inputDir}`));
            // Generate tree if requested
            if (options.tree) {
                console.log(chalk_1.default.cyan('🌳 Generating directory tree...'));
                const dirTree = await this.treeGenerator.generateTree(inputDir);
                tree += `📁 ${path.basename(inputDir)}/\n${dirTree}\n`;
            }
            // Collect all files
            const files = await this.collectFiles(inputDir);
            stats.totalFiles += files.length;
            // Initialize progress bar
            if (files.length > 0) {
                this.progressBar = new cli_progress_1.default.SingleBar({
                    format: chalk_1.default.cyan('{bar}') + ' | {percentage}% | {value}/{total} files',
                    barCompleteChar: '█',
                    barIncompleteChar: '░',
                    hideCursor: true
                });
                this.progressBar.start(files.length, 0);
            }
            // Process files
            for (const filePath of files) {
                await this.processFile(filePath, inputDir, options, stats, allFiles);
                this.progressBar?.increment();
            }
            this.progressBar?.stop();
        }
        const endTime = new Date();
        // Generate output file
        const outputContent = this.generateOutput(options, stats, allFiles, tree, startTime, endTime);
        const outputFileName = `conversion_${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
        const outputPath = path.join(options.outputDir, outputFileName);
        await fs.writeFile(outputPath, outputContent, 'utf8');
        console.log(chalk_1.default.green(`✅ Conversion completed!`));
        console.log(chalk_1.default.blue(`📄 Output file: ${outputPath}`));
        console.log(chalk_1.default.blue(`📊 Files processed: ${stats.processedFiles}/${stats.totalFiles}`));
        console.log(chalk_1.default.blue(`⏱️  Duration: ${endTime.getTime() - startTime.getTime()}ms`));
        return {
            stats,
            files: allFiles,
            tree,
            startTime,
            endTime
        };
    }
    async collectFiles(dirPath) {
        const files = [];
        const traverse = async (currentPath) => {
            try {
                const items = await fs.readdir(currentPath);
                for (const item of items) {
                    const itemPath = path.join(currentPath, item);
                    const stats = await fs.stat(itemPath);
                    if (stats.isDirectory()) {
                        if (!this.fileProcessor.shouldExcludeDirectory(item)) {
                            await traverse(itemPath);
                        }
                    }
                    else {
                        if (!this.fileProcessor.shouldExcludeFile(item)) {
                            files.push(itemPath);
                        }
                    }
                }
            }
            catch (error) {
                console.warn(chalk_1.default.yellow(`Warning: Could not read directory ${currentPath}`));
            }
        };
        await traverse(dirPath);
        return files;
    }
    async processFile(filePath, rootDir, options, stats, allFiles) {
        const result = await this.fileProcessor.processFile(filePath, {
            minify: options.minify,
            escape: options.escape
        });
        if (result) {
            const relativePath = path.relative(rootDir, filePath);
            const fileType = path.extname(filePath) || 'no-extension';
            stats.processedFiles++;
            stats.totalSize += result.size;
            stats.fileTypes[fileType] = (stats.fileTypes[fileType] || 0) + 1;
            allFiles.push({
                path: filePath,
                relativePath,
                content: result.content,
                size: result.size,
                type: fileType
            });
        }
        else {
            stats.skippedFiles++;
        }
    }
    generateOutput(options, stats, files, tree, startTime, endTime) {
        let output = '';
        // Header
        options.inputDirs.forEach(dir => {
            output += `=== CONVERSION from '${dir}' ===\n\n`;
        });
        // Details section
        output += '=== DETAILS ===\n';
        output += `Generated: ${new Date().toLocaleString()}\n`;
        output += `Options: minify=${options.minify}, escape=${options.escape}, tree=${options.tree}\n`;
        output += `Files: ${stats.processedFiles} processed, ${stats.skippedFiles} skipped\n`;
        output += `Size: ${(stats.totalSize / 1024).toFixed(2)} KB\n`;
        output += `Duration: ${endTime.getTime() - startTime.getTime()}ms\n`;
        output += '=== END DETAILS ===\n\n';
        // Tree section
        if (options.tree && tree) {
            output += '=== TREE ===\n';
            output += tree;
            output += '=== END TREE ===\n\n';
        }
        // Files section
        output += '=== FILES ===\n\n';
        for (const file of files) {
            output += `=== FILE: '${file.relativePath}' ===\n`;
            output += file.content;
            output += `\n=== END FILE: '${file.relativePath}' ===\n`;
            output += `Size: ${file.size} bytes, Type: ${file.type}\n\n`;
        }
        output += '=== END FILES ===\n\n';
        output += '=== END CONVERSION ===\n';
        return output;
    }
}
exports.DirectoryConverter = DirectoryConverter;
//# sourceMappingURL=converter.js.map