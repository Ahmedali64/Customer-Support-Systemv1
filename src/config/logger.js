import winston from "winston";
import path from 'path';
import fs from "fs";
import DailyRotateFile from 'winston-daily-rotate-file'; 
// Ensure log directory exists
const logDir = './src/logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
};

export const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf(({ timestamp, level, message }) => {
        return `${timestamp} [${level.toUpperCase()}]: ${message}`;
      })
    ),
    transports: [
      new winston.transports.Console(),
      new DailyRotateFile({ 
        filename: path.join(logDir, 'combined-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        maxFiles: '7d',
        level: 'info' // Logs info and above (error, warn, etc.)
      }),
      new DailyRotateFile({
        filename: path.join(logDir, 'error-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        maxFiles: '7d',
        level: 'error' // Logs only errors
      })
    ]
    
  });

logger.stream = {
    write: (message) => {
        logger.http(message.trim());
    },
};

export default logger;

