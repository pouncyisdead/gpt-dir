import * as fs from 'fs/promises';
import * as path from 'path';
import chalk from 'chalk';
import cliProgress from 'cli-progress';
import { ConversionOptions, FileStats, ProcessedFile, ConversionResult } from './types';
import { FileProcessor } from './file-processor';
import { TreeGenerator } from './tree-generator';

export class DirectoryConverter {
  private fileProcessor = new FileProcessor();
  private treeGenerator = new TreeGenerator();
  private progressBar?: cliProgress.SingleBar;

  async convert(options: ConversionOptions): Promise<ConversionResult> {
    const startTime = new Date();
    console.log(chalk.blue('🚀 Starting directory conversion...'));

    // Initialize stats
    const stats: FileStats = {
      totalFiles: 0,
      processedFiles: 0,
      skippedFiles: 0,
      fileTypes: {},
      totalSize: 0
    };

    const allFiles: ProcessedFile[] = [];
    let tree = '';

    // Ensure output directory exists
    await fs.mkdir(options.outputDir, { recursive: true });

    // Process each input directory
    for (const inputDir of options.inputDirs) {
      console.log(chalk.yellow(`📂 Processing directory: ${inputDir}`));

      // Generate tree if requested
      if (options.tree) {
        console.log(chalk.cyan('🌳 Generating directory tree...'));
        const dirTree = await this.treeGenerator.generateTree(inputDir);
        tree += `📁 ${path.basename(inputDir)}/\n${dirTree}\n`;
      }

      // Collect all files
      const files = await this.collectFiles(inputDir);
      stats.totalFiles += files.length;

      // Initialize progress bar
      if (files.length > 0) {
        this.progressBar = new cliProgress.SingleBar({
          format: chalk.cyan('{bar}') + ' | {percentage}% | {value}/{total} files',
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

    console.log(chalk.green(`✅ Conversion completed!`));
    console.log(chalk.blue(`📄 Output file: ${outputPath}`));
    console.log(chalk.blue(`📊 Files processed: ${stats.processedFiles}/${stats.totalFiles}`));
    console.log(chalk.blue(`⏱️  Duration: ${endTime.getTime() - startTime.getTime()}ms`));

    return {
      stats,
      files: allFiles,
      tree,
      startTime,
      endTime
    };
  }

  private async collectFiles(dirPath: string): Promise<string[]> {
    const files: string[] = [];

    const traverse = async (currentPath: string): Promise<void> => {
      try {
        const items = await fs.readdir(currentPath);
        
        for (const item of items) {
          const itemPath = path.join(currentPath, item);
          const stats = await fs.stat(itemPath);

          if (stats.isDirectory()) {
            if (!this.fileProcessor.shouldExcludeDirectory(item)) {
              await traverse(itemPath);
            }
          } else {
            if (!this.fileProcessor.shouldExcludeFile(item)) {
              files.push(itemPath);
            }
          }
        }
      } catch (error) {
        console.warn(chalk.yellow(`Warning: Could not read directory ${currentPath}`));
      }
    };

    await traverse(dirPath);
    return files;
  }

  private async processFile(
    filePath: string,
    rootDir: string,
    options: ConversionOptions,
    stats: FileStats,
    allFiles: ProcessedFile[]
  ): Promise<void> {
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
    } else {
      stats.skippedFiles++;
    }
  }

  private generateOutput(
    options: ConversionOptions,
    stats: FileStats,
    files: ProcessedFile[],
    tree: string,
    startTime: Date,
    endTime: Date
  ): string {
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