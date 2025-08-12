import * as console from 'node:console';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { FileProcessor } from './file-processor.ts';

export class TreeGenerator {
  private fileProcessor = new FileProcessor();

  async generateTree(
    rootPath: string,
    prefix: string = '',
    isLast: boolean = true
  ): Promise<string> {
    const stats = await fs.stat(rootPath);
    const name = path.basename(rootPath);

    let result = '';
    const connector = isLast ? '└── ' : '├── ';
    const icon = stats.isDirectory() ? '📁' : this.getFileIcon(name);

    result += `${prefix}${connector}${icon} ${name}/\n`;

    if (stats.isDirectory()) {
      if (this.fileProcessor.shouldExcludeDirectory(name) && prefix !== '') {
        return result;
      }

      try {
        const items = await fs.readdir(rootPath);
        const filteredItems = items.filter((item) => {
          return (
            !this.fileProcessor.shouldExcludeFile(item) &&
            !this.fileProcessor.shouldExcludeDirectory(item)
          );
        });

        // Sort items: directories first, then files
        const sortedItems = await this.sortItems(rootPath, filteredItems);

        for (let i = 0; i < sortedItems.length; i++) {
          const itemPath = path.join(rootPath, sortedItems[i]);
          const isLastItem = i === sortedItems.length - 1;
          const newPrefix = prefix + (isLast ? '    ' : '│   ');

          result += await this.generateTree(itemPath, newPrefix, isLastItem);
        }
      } catch (error) {
        // Skip directories we can't read
        console.warn(error);
      }
    }

    return result;
  }

  private async sortItems(rootPath: string, items: string[]): Promise<string[]> {
    const itemsWithStats = await Promise.all(
      items.map(async (item) => {
        const itemPath = path.join(rootPath, item);
        try {
          const stats = await fs.stat(itemPath);
          return { name: item, isDirectory: stats.isDirectory() };
        } catch {
          return { name: item, isDirectory: false };
        }
      })
    );

    return itemsWithStats
      .sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      })
      .map((item) => item.name);
  }

  private getFileIcon(fileName: string): string {
    const ext = path.extname(fileName).toLowerCase();

    const iconMap: Record<string, string> = {
      '.js': '🟨',
      '.ts': '🔷',
      '.jsx': '⚛️',
      '.tsx': '⚛️',
      '.html': '🌐',
      '.css': '🎨',
      '.scss': '🎨',
      '.less': '🎨',
      '.json': '📋',
      '.md': '📖',
      '.txt': '📄',
      '.yml': '🔧',
      '.yaml': '🔧',
      '.xml': '📋',
      '.csv': '📊',
      '.py': '🐍',
      '.java': '☕',
      '.cpp': '⚙️',
      '.c': '⚙️',
      '.php': '🐘',
      '.rb': '💎',
      '.go': '🐹',
      '.rs': '🦀',
      '.sh': '💻',
      '.bat': '💻',
      '.sql': '🗃️',
    };

    // Configuration files
    const configFiles = [
      'package.json',
      'tsconfig.json',
      'webpack.config.js',
      'vite.config.js',
      'tailwind.config.js',
      '.env',
    ];

    if (configFiles.some((config) => fileName.includes(config))) {
      return '🔧';
    }

    return iconMap[ext] || '📄';
  }
}
