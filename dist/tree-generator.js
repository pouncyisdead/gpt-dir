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
exports.TreeGenerator = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const file_processor_1 = require("./file-processor");
class TreeGenerator {
    constructor() {
        this.fileProcessor = new file_processor_1.FileProcessor();
    }
    async generateTree(rootPath, prefix = '', isLast = true) {
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
                const filteredItems = items.filter(item => {
                    return !this.fileProcessor.shouldExcludeFile(item) && !this.fileProcessor.shouldExcludeDirectory(item);
                });
                // Sort items: directories first, then files
                const sortedItems = await this.sortItems(rootPath, filteredItems);
                for (let i = 0; i < sortedItems.length; i++) {
                    const itemPath = path.join(rootPath, sortedItems[i]);
                    const isLastItem = i === sortedItems.length - 1;
                    const newPrefix = prefix + (isLast ? '    ' : '│   ');
                    result += await this.generateTree(itemPath, newPrefix, isLastItem);
                }
            }
            catch (error) {
                // Skip directories we can't read
            }
        }
        return result;
    }
    async sortItems(rootPath, items) {
        const itemsWithStats = await Promise.all(items.map(async (item) => {
            const itemPath = path.join(rootPath, item);
            try {
                const stats = await fs.stat(itemPath);
                return { name: item, isDirectory: stats.isDirectory() };
            }
            catch {
                return { name: item, isDirectory: false };
            }
        }));
        return itemsWithStats
            .sort((a, b) => {
            if (a.isDirectory && !b.isDirectory)
                return -1;
            if (!a.isDirectory && b.isDirectory)
                return 1;
            return a.name.localeCompare(b.name);
        })
            .map(item => item.name);
    }
    getFileIcon(fileName) {
        const ext = path.extname(fileName).toLowerCase();
        const iconMap = {
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
            '.sql': '🗃️'
        };
        // Configuration files
        const configFiles = [
            'package.json', 'tsconfig.json', 'webpack.config.js',
            'vite.config.js', 'tailwind.config.js', '.env'
        ];
        if (configFiles.some(config => fileName.includes(config))) {
            return '🔧';
        }
        return iconMap[ext] || '📄';
    }
}
exports.TreeGenerator = TreeGenerator;
//# sourceMappingURL=tree-generator.js.map