import logger, { logServiceStartup, logServiceShutdown } from './utils/logger';
import rabbitmqService from './services/rabbitmq.service';
import emailService from './services/email.service';

async function iniciar() {
    logServiceStartup();

    // 1. Verificar conexión SMTP
    logger.info('[notificaciones-service]: Verificando conexión SMTP...');
    const smtpOk = await emailService.verificarConexion();
    
    if (!smtpOk) {
        logger.error('[notificaciones-service]: No se pudo conectar al servidor SMTP. Verifica la configuración.');
        process.exit(1);
    }

    // 2. Conectar a RabbitMQ
    await rabbitmqService.conectar();

    // 3. Empezar a consumir mensajes
    await rabbitmqService.consumirMensajes();

    logger.info('[notificaciones-service]: Servicio listo y escuchando mensajes');
    logger.info('='.repeat(60));
}

// Manejar cierre graceful
process.on('SIGINT', async () => {
    logger.info('\n[notificaciones-service]: Señal SIGINT recibida, cerrando servicio...');
    await rabbitmqService.cerrar();
    logServiceShutdown();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    logger.info('\n[notificaciones-service]: Señal SIGTERM recibida, cerrando servicio...');
    await rabbitmqService.cerrar();
    logServiceShutdown();
    process.exit(0);
});

process.on('uncaughtException', (error: Error) => {
    logger.error(`[notificaciones-service]: Excepción no manejada: ${error.message}`, { stack: error.stack });
    process.exit(1);
});

process.on('unhandledRejection', (reason: any) => {
    logger.error(`[notificaciones-service]: Promesa rechazada no manejada: ${reason}`);
    process.exit(1);
});

// Iniciar servicio
iniciar().catch((error) => {
    logger.error(`[notificaciones-service]: Error fatal al iniciar: ${error.message}`, { stack: error.stack });
    process.exit(1);
});