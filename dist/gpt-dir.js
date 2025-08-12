#!/usr/bin/env node
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
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs/promises"));
const converter_1 = require("./converter");
const program = new commander_1.Command();
program
    .name('gpt-dir')
    .description('Convert directories into structured text files optimized for AI processing')
    .version('1.0.0');
program
    .option('-i, --input <dirs...>', 'input directories to convert', [])
    .option('-o, --output <dir>', 'output directory for the converted file', './output')
    .option('--minify [value]', 'minify content by removing extra whitespace', 'true')
    .option('-m, --minify-flag [value]', 'alternative minify flag', 'true')
    .option('--escape [value]', 'escape special characters', 'true')
    .option('-e, --escape-flag [value]', 'alternative escape flag', 'true')
    .option('--tree [value]', 'include directory tree in output', 'true')
    .option('-t, --tree-flag [value]', 'alternative tree flag', 'true')
    .option('--clean', 'clean output directory before conversion', false)
    .action(async (options) => {
    try {
        // Validate input directories
        if (!options.input || options.input.length === 0) {
            console.error(chalk_1.default.red('❌ Error: At least one input directory must be specified'));
            console.log(chalk_1.default.yellow('Use: gpt-dir -i <directory> [options]'));
            process.exit(1);
        }
        // Validate input directories exist
        const inputDirs = [];
        for (const dir of options.input) {
            const absolutePath = path.resolve(dir);
            try {
                const stats = await fs.stat(absolutePath);
                if (!stats.isDirectory()) {
                    console.error(chalk_1.default.red(`❌ Error: ${dir} is not a directory`));
                    process.exit(1);
                }
                inputDirs.push(absolutePath);
            }
            catch (error) {
                console.error(chalk_1.default.red(`❌ Error: Directory ${dir} does not exist`));
                console.warn(error);
                process.exit(1);
            }
        }
        // Parse boolean options with multiple flag support
        const parseBooleanOption = (value, defaultValue = true) => {
            if (value === undefined)
                return defaultValue;
            if (typeof value === 'boolean')
                return value;
            if (typeof value === 'string') {
                const lowerValue = value.toLowerCase();
                return lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes';
            }
            return defaultValue;
        };
        const conversionOptions = {
            inputDirs,
            outputDir: path.resolve(options.output),
            minify: parseBooleanOption(options.minify || options.minifyFlag),
            escape: parseBooleanOption(options.escape || options.escapeFlag),
            tree: parseBooleanOption(options.tree || options.treeFlag),
            clean: options.clean || false,
        };
        console.log(chalk_1.default.blue('🔧 Configuration:'));
        console.log(chalk_1.default.gray(`   Input directories: ${conversionOptions.inputDirs.join(', ')}`));
        console.log(chalk_1.default.gray(`   Output directory: ${conversionOptions.outputDir}`));
        console.log(chalk_1.default.gray(`   Minify: ${conversionOptions.minify}`));
        console.log(chalk_1.default.gray(`   Escape: ${conversionOptions.escape}`));
        console.log(chalk_1.default.gray(`   Tree: ${conversionOptions.tree}`));
        console.log(chalk_1.default.gray(`   Clean: ${conversionOptions.clean}`));
        console.log();
        // Clean output directory if requested
        if (conversionOptions.clean) {
            console.log(chalk_1.default.yellow('🧹 Cleaning output directory...'));
            try {
                await fs.rm(conversionOptions.outputDir, { recursive: true, force: true });
            }
            catch (error) {
                // Directory might not exist, that's OK
                console.warn(chalk_1.default.red(`❌ Warn: Directory might not exist`));
                console.log(error);
            }
        }
        // Perform conversion
        const converter = new converter_1.DirectoryConverter();
        await converter.convert(conversionOptions);
    }
    catch (error) {
        console.error(chalk_1.default.red('❌ Conversion failed:'));
        console.error(chalk_1.default.red(error instanceof Error ? error.message : String(error)));
        process.exit(1);
    }
});
// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log(chalk_1.default.yellow('\n🛑 Conversion interrupted by user'));
    process.exit(0);
});
process.on('uncaughtException', (error) => {
    console.error(chalk_1.default.red('❌ Uncaught exception:'), error);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error(chalk_1.default.red('❌ Unhandled rejection at:'), promise, chalk_1.default.red('reason:'), reason);
    process.exit(1);
});
// Parse command line arguments
program.parse();
// Show help if no arguments provided
if (process.argv.length <= 2) {
    program.help();
}
//# sourceMappingURL=gpt-dir.js.map