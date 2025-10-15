const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');

const logDir = 'logs';
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

// Formato logs legibles
const customFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, service, stack, ...meta }) => {
        const levelString = level.includes('\u001b[') ? level : level.toUpperCase();
        let log = `[${timestamp}] [${levelString}] [${service}]: ${message}`;
        
        // Agregar metadata si existe
        if (Object.keys(meta).length > 0) {
            log += ` ${JSON.stringify(meta)}`;
        }
        
        // Agregar stack trace si es un error
        if (stack) {
            log += `\n${stack}`;
        }
        
        return log;
    })
);

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    defaultMeta: { service: 'users-service' },
    transports: [
        // Consola con colores
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                customFormat
            )
        }),
        
        // Archivo único rotativo para todos los logs
        new DailyRotateFile({
            filename: path.join(logDir, 'application-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
            format: customFormat,
            auditFile: path.join(logDir, '.audit.json') 
        })
    ]
});

// Stream para Morgan
logger.stream = {
    write: (message) => logger.info(message.trim())
};

module.exports = logger;