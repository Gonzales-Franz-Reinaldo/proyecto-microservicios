import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import config from '../config/config';
import path from 'path';
import fs from 'fs';

// Crear directorio de logs si no existe
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Formato personalizado para logs legibles
const customFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, stack, ...metadata }) => {
        let log = `[${timestamp}] ${level.toUpperCase().padEnd(5)} [notificaciones-service]: ${message}`;
        
        // Agregar metadata si existe (excepto timestamp y level)
        const metaKeys = Object.keys(metadata).filter(key => key !== 'timestamp' && key !== 'level');
        if (metaKeys.length > 0) {
            const metaStr = metaKeys
                .map(key => `${key}=${JSON.stringify(metadata[key])}`)
                .join(', ');
            log += ` | ${metaStr}`;
        }
        
        // Agregar stack trace si existe
        if (stack) {
            log += `\n${stack}`;
        }
        
        return log;
    })
);

// Formato para consola con colores
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message }) => {
        return `[${timestamp}] ${level}: ${message}`;
    })
);

// ========== TRANSPORTS ==========

// Consola (con colores)
const consoleTransport = new winston.transports.Console({
    format: consoleFormat,
    level: config.nodeEnv === 'development' ? 'debug' : 'info',
});

// Archivo general (rotación diaria)
const fileTransport: DailyRotateFile = new DailyRotateFile({
    filename: path.join(logsDir, 'notificaciones-service-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d', // Mantener 14 días
    format: customFormat,
    level: 'info',
});

// Archivo de errores (rotación diaria)
const errorFileTransport: DailyRotateFile = new DailyRotateFile({
    filename: path.join(logsDir, 'notificaciones-service-errors-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '30d', // Mantener errores por 30 días
    format: customFormat,
    level: 'error',
});

// ========== CREAR LOGGER ==========
const logger = winston.createLogger({
    level: config.logging.level,
    transports: [
        consoleTransport,
        fileTransport,
        errorFileTransport,
    ],
    exitOnError: false,
});

// ========== FUNCIONES HELPER ==========

/**
 * Log de mensaje recibido desde RabbitMQ
 */
export function logMensajeRecibido(compraId: number, usuarioId: string, eventoId: number): void {
    logger.info(`Mensaje recibido de RabbitMQ | CompraID: ${compraId} | Usuario: ${usuarioId} | Evento: ${eventoId}`);
}

/**
 * Log de llamada a servicio externo
 */
export function logExternalCall(service: string, endpoint: string, statusCode?: number, durationMs?: number): void {
    const status = statusCode ? ` - ${statusCode}` : '';
    const duration = durationMs ? ` (${durationMs.toFixed(2)}ms)` : '';
    logger.info(`Llamada externa a ${service}: ${endpoint}${status}${duration}`);
}

/**
 * Log de evento de negocio
 */
export function logBusinessEvent(event: string, details: Record<string, any>): void {
    const detailsStr = Object.entries(details)
        .map(([key, value]) => `${key}="${value}"`)
        .join(', ');
    logger.info(`Evento de negocio: ${event} | ${detailsStr}`);
}

/**
 * Log de email enviado
 */
export function logEmailEnviado(email: string, compraId: number, messageId: string): void {
    logger.info(`Email enviado exitosamente | Destinatario: ${email} | CompraID: ${compraId} | MessageID: ${messageId}`);
}

/**
 * Log de error de email
 */
export function logEmailError(email: string, compraId: number, error: string): void {
    logger.error(`Error al enviar email | Destinatario: ${email} | CompraID: ${compraId} | Error: ${error}`);
}

/**
 * Log de conexión RabbitMQ
 */
export function logRabbitMQConexion(queueName: string, success: boolean): void {
    if (success) {
        logger.info(`Conectado a RabbitMQ exitosamente | Cola: ${queueName}`);
    } else {
        logger.error(`Error al conectar a RabbitMQ | Cola: ${queueName}`);
    }
}

/**
 * Log de inicio del servicio
 */
export function logServiceStartup(): void {
    logger.info('='.repeat(60));
    logger.info('[notificaciones-service]: Iniciando Servicio de Notificaciones');
    logger.info(`[notificaciones-service]: Ambiente: ${config.nodeEnv}`);
    logger.info(`[notificaciones-service]: Nivel de logs: ${config.logging.level}`);
    logger.info('='.repeat(60));
}

/**
 * Log de cierre del servicio
 */
export function logServiceShutdown(): void {
    logger.info('[notificaciones-service]: Servicio de notificaciones cerrado correctamente');
}

export default logger;