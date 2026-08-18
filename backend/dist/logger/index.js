"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
require("winston-daily-rotate-file");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const LOGS_DIR = path_1.default.join(process.cwd(), 'logs');
// Ensure logs directory exists
if (!fs_1.default.existsSync(LOGS_DIR)) {
    fs_1.default.mkdirSync(LOGS_DIR, { recursive: true });
}
const { combine, timestamp, errors, json, colorize, simple } = winston_1.default.format;
const consoleFormat = combine(colorize({ all: true }), timestamp({ format: 'HH:mm:ss' }), errors({ stack: true }), simple());
const fileFormat = combine(timestamp(), errors({ stack: true }), json());
const logger = winston_1.default.createLogger({
    level: LOG_LEVEL,
    defaultMeta: { service: 'social-intelligence-platform' },
    transports: [
        // Console — always on in development
        new winston_1.default.transports.Console({
            format: consoleFormat,
            silent: process.env.NODE_ENV === 'test',
        }),
        // Daily rotating file — errors only
        new winston_1.default.transports.DailyRotateFile({
            filename: path_1.default.join(LOGS_DIR, 'error-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            format: fileFormat,
            maxSize: '10m',
            maxFiles: '7d',
        }),
        // Daily rotating file — all levels
        new winston_1.default.transports.DailyRotateFile({
            filename: path_1.default.join(LOGS_DIR, 'combined-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            format: fileFormat,
            maxSize: '20m',
            maxFiles: '14d',
        }),
    ],
});
exports.default = logger;
//# sourceMappingURL=index.js.map