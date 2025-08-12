export interface ConversionOptions {
  inputDirs: string[];
  outputDir: string;
  minify: boolean;
  escape: boolean;
  tree: boolean;
  clean: boolean;
}

export interface FileStats {
  totalFiles: number;
  processedFiles: number;
  skippedFiles: number;
  fileTypes: Record<string, number>;
  totalSize: number;
}

export interface ProcessedFile {
  path: string;
  relativePath: string;
  content: string;
  size: number;
  type: string;
}

export interface ConversionResult {
  stats: FileStats;
  files: ProcessedFile[];
  tree: string;
  startTime: Date;
  endTime: Date;
}
