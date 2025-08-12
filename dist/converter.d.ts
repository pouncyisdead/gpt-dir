import { ConversionOptions, ConversionResult } from './types';
export declare class DirectoryConverter {
    private fileProcessor;
    private treeGenerator;
    private progressBar?;
    convert(options: ConversionOptions): Promise<ConversionResult>;
    private collectFiles;
    private processFile;
    private generateOutput;
}
//# sourceMappingURL=converter.d.ts.map