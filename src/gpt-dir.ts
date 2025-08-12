#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import * as path from 'path';
import * as fs from 'fs/promises';
import { ConversionOptions } from './types';
import { DirectoryConverter } from './converter';

const program = new Command();

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
        console.error(chalk.red('❌ Error: At least one input directory must be specified'));
        console.log(chalk.yellow('Use: gpt-dir -i <directory> [options]'));
        process.exit(1);
      }

      // Validate input directories exist
      const inputDirs: string[] = [];
      for (const dir of options.input) {
        const absolutePath = path.resolve(dir);
        try {
          const stats = await fs.stat(absolutePath);
          if (!stats.isDirectory()) {
            console.error(chalk.red(`❌ Error: ${dir} is not a directory`));
            process.exit(1);
          }
          inputDirs.push(absolutePath);
        } catch (error) {
          console.error(chalk.red(`❌ Error: Directory ${dir} does not exist`));
          console.warn(error);
          process.exit(1);
        }
      }

      // Parse boolean options with multiple flag support
      const parseBooleanOption = (
        value: string | boolean | undefined,
        defaultValue: boolean = true
      ): boolean => {
        if (value === undefined) return defaultValue;
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
          const lowerValue = value.toLowerCase();
          return lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes';
        }
        return defaultValue;
      };

      const conversionOptions: ConversionOptions = {
        inputDirs,
        outputDir: path.resolve(options.output),
        minify: parseBooleanOption(options.minify || options.minifyFlag),
        escape: parseBooleanOption(options.escape || options.escapeFlag),
        tree: parseBooleanOption(options.tree || options.treeFlag),
        clean: options.clean || false,
      };

      console.log(chalk.blue('🔧 Configuration:'));
      console.log(chalk.gray(`   Input directories: ${conversionOptions.inputDirs.join(', ')}`));
      console.log(chalk.gray(`   Output directory: ${conversionOptions.outputDir}`));
      console.log(chalk.gray(`   Minify: ${conversionOptions.minify}`));
      console.log(chalk.gray(`   Escape: ${conversionOptions.escape}`));
      console.log(chalk.gray(`   Tree: ${conversionOptions.tree}`));
      console.log(chalk.gray(`   Clean: ${conversionOptions.clean}`));
      console.log();

      // Clean output directory if requested
      if (conversionOptions.clean) {
        console.log(chalk.yellow('🧹 Cleaning output directory...'));
        try {
          await fs.rm(conversionOptions.outputDir, { recursive: true, force: true });
        } catch (error) {
          // Directory might not exist, that's OK
          console.warn(chalk.red(`❌ Warn: Directory might not exist`));
          console.log(error);
        }
      }

      // Perform conversion
      const converter = new DirectoryConverter();
      await converter.convert(conversionOptions);
    } catch (error) {
      console.error(chalk.red('❌ Conversion failed:'));
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  });

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n🛑 Conversion interrupted by user'));
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error(chalk.red('❌ Uncaught exception:'), error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('❌ Unhandled rejection at:'), promise, chalk.red('reason:'), reason);
  process.exit(1);
});

// Parse command line arguments
program.parse();

// Show help if no arguments provided
if (process.argv.length <= 2) {
  program.help();
}
