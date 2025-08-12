import * as fs from 'fs/promises';
import * as path from 'path';
import * as mime from 'mime-types';

export class FileProcessor {
  private readonly maxFileSize = 1024 * 1024; // 1MB
  private readonly excludedExtensions = new Set([
    '.exe', '.dll', '.so', '.dylib', '.zip', '.tar', '.gz', '.rar',
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.ico', '.tiff',
    '.mp3', '.mp4', '.avi', '.mov', '.wmv', '.flv',
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'
  ]);

  async processFile(filePath: string, options: { minify: boolean; escape: boolean }): Promise<{ content: string; size: number } | null> {
    try {
      const stats = await fs.stat(filePath);
      
      // Skip large files
      if (stats.size > this.maxFileSize) {
        return null;
      }

      // Check if file is binary
      if (this.isBinaryFile(filePath)) {
        return null;
      }

      let content = await fs.readFile(filePath, 'utf8');
      const originalSize = content.length;

      // Apply processing options
      if (options.minify) {
        content = this.minifyContent(content);
      }

      if (options.escape) {
        content = this.escapeContent(content);
      }

      return {
        content,
        size: originalSize
      };
    } catch (error) {
      console.warn(`Warning: Could not process file ${filePath}: ${error}`);
      return null;
    }
  }

  private isBinaryFile(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    
    // Check excluded extensions
    if (this.excludedExtensions.has(ext)) {
      return true;
    }

    // Check if it's a known text file first
    if (this.isTextFile(filePath)) {
      return false;
    }

    // Use MIME type detection
    const mimeType = mime.lookup(filePath);
    if (mimeType && !mimeType.startsWith('text/') && !this.isKnownTextType(mimeType)) {
      return true;
    }

    return false;
  }

  private isKnownTextType(mimeType: string): boolean {
    const textTypes = [
      'application/json',
      'application/xml',
      'application/javascript',
      'application/typescript',
      'application/x-yaml',
      'application/x-sh'
    ];
    
    return textTypes.some(type => mimeType.includes(type));
  }

  private isTextFile(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    
    // Known text file extensions
    const textExtensions = new Set([
      '.js', '.jsx', '.ts', '.tsx', '.json', '.md', '.txt', '.html', '.htm',
      '.css', '.scss', '.sass', '.less', '.xml', '.yaml', '.yml', '.toml',
      '.ini', '.conf', '.config', '.env', '.gitignore', '.gitattributes',
      '.py', '.java', '.c', '.cpp', '.h', '.hpp', '.cs', '.php', '.rb',
      '.go', '.rs', '.swift', '.kt', '.scala', '.sh', '.bash', '.zsh',
      '.fish', '.ps1', '.bat', '.cmd', '.sql', '.r', '.m', '.pl', '.lua',
      '.vim', '.dockerfile', '.makefile', '.cmake', '.gradle', '.maven'
    ]);
    
    return textExtensions.has(ext);
  }

  private minifyContent(content: string): string {
    return content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');
  }

  private escapeContent(content: string): string {
    return content
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/'/g, "\\'")
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  }

  shouldExcludeDirectory(dirName: string): boolean {
    const excludedDirs = new Set([
      'node_modules', '.git', '.svn', '.hg', 'dist', 'build',
      'coverage', '.nyc_output', '.DS_Store', 'Thumbs.db'
    ]);
    
    return excludedDirs.has(dirName) || dirName.startsWith('.');
  }

  shouldExcludeFile(fileName: string): boolean {
    const excludedFiles = new Set([
      '.DS_Store', 'Thumbs.db', '.gitignore', '.gitkeep',
      'package-lock.json', 'yarn.lock'
    ]);
    
    return excludedFiles.has(fileName) || fileName.startsWith('.');
  }
}