export declare class FileProcessor {
    private readonly maxFileSize;
    private readonly excludedExtensions;
    processFile(filePath: string, options: {
        minify: boolean;
        escape: boolean;
    }): Promise<{
        content: string;
        size: number;
    } | null>;
    private isBinaryFile;
    private isKnownTextType;
    private isTextFile;
    private minifyContent;
    private escapeContent;
    shouldExcludeDirectory(dirName: string): boolean;
    shouldExcludeFile(fileName: string): boolean;
}
//# sourceMappingURL=file-processor.d.ts.map