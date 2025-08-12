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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileProcessor = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const mime = __importStar(require("mime-types"));
class FileProcessor {
    constructor() {
        this.maxFileSize = 1024 * 1024; // 1MB
        this.excludedExtensions = new Set([
            '.exe',
            '.dll',
            '.so',
            '.dylib',
            '.zip',
            '.tar',
            '.gz',
            '.rar',
            '.jpg',
            '.jpeg',
            '.png',
            '.gif',
            '.bmp',
            '.ico',
            '.tiff',
            '.mp3',
            '.mp4',
            '.avi',
            '.mov',
            '.wmv',
            '.flv',
            '.pdf',
            '.doc',
            '.docx',
            '.xls',
            '.xlsx',
            '.ppt',
            '.pptx',
        ]);
    }
    async processFile(filePath, options) {
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
                size: originalSize,
            };
        }
        catch (error) {
            console.warn(`Warning: Could not process file ${filePath}: ${error}`);
            return null;
        }
    }
    isBinaryFile(filePath) {
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
    isKnownTextType(mimeType) {
        const textTypes = [
            'application/json',
            'application/xml',
            'application/javascript',
            'application/typescript',
            'application/x-yaml',
            'application/x-sh',
        ];
        return textTypes.some((type) => mimeType.includes(type));
    }
    isTextFile(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        // Known text file extensions
        const textExtensions = new Set([
            '.js',
            '.jsx',
            '.ts',
            '.tsx',
            '.json',
            '.md',
            '.txt',
            '.html',
            '.htm',
            '.css',
            '.scss',
            '.sass',
            '.less',
            '.xml',
            '.yaml',
            '.yml',
            '.toml',
            '.ini',
            '.conf',
            '.config',
            '.env',
            '.gitignore',
            '.gitattributes',
            '.py',
            '.java',
            '.c',
            '.cpp',
            '.h',
            '.hpp',
            '.cs',
            '.php',
            '.rb',
            '.go',
            '.rs',
            '.swift',
            '.kt',
            '.scala',
            '.sh',
            '.bash',
            '.zsh',
            '.fish',
            '.ps1',
            '.bat',
            '.cmd',
            '.sql',
            '.r',
            '.m',
            '.pl',
            '.lua',
            '.vim',
            '.dockerfile',
            '.makefile',
            '.cmake',
            '.gradle',
            '.maven',
        ]);
        return textExtensions.has(ext);
    }
    minifyContent(content) {
        return content
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line.length > 0)
            .join('\n');
    }
    escapeContent(content) {
        return content
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"')
            .replace(/'/g, "\\'")
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/\t/g, '\\t');
    }
    shouldExcludeDirectory(dirName) {
        const excludedDirs = new Set([
            'node_modules',
            '.git',
            '.svn',
            '.hg',
            'dist',
            'build',
            'coverage',
            '.nyc_output',
            '.DS_Store',
            'Thumbs.db',
        ]);
        return excludedDirs.has(dirName) || dirName.startsWith('.');
    }
    shouldExcludeFile(fileName) {
        const excludedFiles = new Set([
            '.DS_Store',
            'Thumbs.db',
            '.gitignore',
            '.gitkeep',
            'package-lock.json',
            'yarn.lock',
        ]);
        return excludedFiles.has(fileName) || fileName.startsWith('.');
    }
}
exports.FileProcessor = FileProcessor;
//# sourceMappingURL=file-processor.js.map