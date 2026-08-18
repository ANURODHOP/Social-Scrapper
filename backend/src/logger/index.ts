import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const LOGS_DIR = path.join(process.cwd(), 'logs');

// Ensure logs directory exists
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

const { combine, timestamp, errors, json, colorize, simple } = winston.format;

const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  simple()
);

const fileFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

const logger = winston.createLogger({
  level: LOG_LEVEL,
  defaultMeta: { service: 'social-intelligence-platform' },
  transports: [
    // Console — always on in development
    new winston.transports.Console({
      format: consoleFormat,
      silent: process.env.NODE_ENV === 'test',
    }),
    // Daily rotating file — errors only
    new (winston.transports as any).DailyRotateFile({
      filename: path.join(LOGS_DIR, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      format: fileFormat,
      maxSize: '10m',
      maxFiles: '7d',
    }),
    // Daily rotating file — all levels
    new (winston.transports as any).DailyRotateFile({
      filename: path.join(LOGS_DIR, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      format: fileFormat,
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
});

export default logger;
