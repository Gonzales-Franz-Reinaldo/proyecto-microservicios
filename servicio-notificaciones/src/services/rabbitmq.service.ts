import amqp, { Channel, Connection, ConsumeMessage } from 'amqplib';
import config from '../config/config';
import logger, { logRabbitMQConexion, logMensajeRecibido, logBusinessEvent } from '../utils/logger';
import { MensajeCompra, DatosNotificacion } from '../models/notificacion.model';
import emailService from './email.service';
import usuariosClient from './usuarios.client';
import eventosClient from './eventos.client';  

class RabbitMQService {
    private connection: Connection | null = null;
    private channel: Channel | null = null;

    /**
     * Conecta a RabbitMQ
     */
    async conectar(): Promise<void> {
        try {
            logger.info(`[notificaciones-service]: Conectando a RabbitMQ (${config.rabbitmq.url})...`);
            
            const startTime = Date.now();
            this.connection = await amqp.connect(config.rabbitmq.url);
            this.channel = await this.connection.createChannel();

            if (!this.channel) {
                throw new Error('No se pudo crear el canal de RabbitMQ');
            }

            // Asegurar que la cola existe
            await this.channel.assertQueue(config.rabbitmq.queueName, {
                durable: true,
            });

            const durationMs = Date.now() - startTime;
            logger.info(
                `[notificaciones-service]: Conectado a RabbitMQ exitosamente (${durationMs}ms) | ` +
                `Cola: ${config.rabbitmq.queueName}`
            );
            logRabbitMQConexion(config.rabbitmq.queueName, true);

            // Event handlers
            this.connection.on('close', () => {
                logger.warn('[notificaciones-service]: Conexión a RabbitMQ cerrada. Reconectando en 5s...');
                this.connection = null;
                this.channel = null;
                setTimeout(() => this.conectar(), 5000);
            });

            this.connection.on('error', (err: Error) => {
                logger.error(`[notificaciones-service]: Error en conexión RabbitMQ: ${err.message}`);
            });
        } catch (error: any) {
            logger.error(`[notificaciones-service]: Error al conectar a RabbitMQ: ${error.message}`, {
                stack: error.stack,
            });
            logRabbitMQConexion(config.rabbitmq.queueName, false);
            this.connection = null;
            this.channel = null;
            
            logger.info('[notificaciones-service]: Reintentando conexión en 5s...');
            setTimeout(() => this.conectar(), 5000);
        }
    }

    /**
     * Escucha mensajes de la cola
     */
    async consumirMensajes(): Promise<void> {
        if (!this.channel) {
            throw new Error('Canal de RabbitMQ no está disponible');
        }

        logger.info(`[notificaciones-service]: Escuchando mensajes en cola: ${config.rabbitmq.queueName}`);

        // Configurar prefetch (procesar 1 mensaje a la vez)
        await this.channel.prefetch(1);

        await this.channel.consume(
            config.rabbitmq.queueName,
            async (msg: ConsumeMessage | null) => {
                if (msg) {
                    const startTime = Date.now();
                    
                    try {
                        await this.procesarMensaje(msg.content.toString());
                        
                        const durationMs = Date.now() - startTime;
                        logger.debug(`[notificaciones-service]: Mensaje procesado correctamente (${durationMs}ms)`);
                        
                        if (this.channel) {
                            this.channel.ack(msg);
                        }
                    } catch (error: any) {
                        const durationMs = Date.now() - startTime;
                        logger.error(
                            `[notificaciones-service]: Error al procesar mensaje (${durationMs}ms): ${error.message}`,
                            { stack: error.stack }
                        );
                        
                        // Rechazar mensaje y reencolarlo
                        if (this.channel) {
                            this.channel.nack(msg, false, true);
                        }
                    }
                }
            },
            { noAck: false }
        );
    }

    /**
     * Procesa un mensaje de compra
     */
    private async procesarMensaje(contenido: string): Promise<void> {
        logger.debug(`[notificaciones-service]: Procesando mensaje: ${contenido.substring(0, 100)}...`);

        const mensaje: MensajeCompra = JSON.parse(contenido);
        
        logMensajeRecibido(mensaje.compraId, mensaje.usuarioId, mensaje.eventoId);

        // 1. Obtener datos del usuario
        logger.debug(`[notificaciones-service]: Obteniendo datos del usuario ${mensaje.usuarioId}...`);
        const usuario = await usuariosClient.getUsuario(mensaje.usuarioId);
        
        if (!usuario) {
            logger.error(
                `[notificaciones-service]: No se puede enviar notificación - ` +
                `Usuario ${mensaje.usuarioId} no encontrado | CompraID: ${mensaje.compraId}`
            );
            return;
        }

        // 2. Obtener datos del evento
        logger.debug(`[notificaciones-service]: Obteniendo datos del evento ${mensaje.eventoId}...`);
        const evento = await eventosClient.getEvento(mensaje.eventoId);
        
        if (!evento) {
            logger.error(
                `[notificaciones-service]: No se puede enviar notificación - ` +
                `Evento ${mensaje.eventoId} no encontrado | CompraID: ${mensaje.compraId}`
            );
            return;
        }

        // 3. Preparar datos completos
        const datosNotificacion: DatosNotificacion = {
            usuario,
            evento,
            compra: {
                id: mensaje.compraId,
                cantidad: mensaje.cantidad,
                total: mensaje.total,
                metodoPago: mensaje.metodoPago,
                fechaPago: mensaje.fechaPago,
            },
        };

        // 4. Enviar email
        logger.info(
            `[notificaciones-service]: Preparando envío de email | ` +
            `CompraID: ${mensaje.compraId} | Destinatario: ${usuario.email}`
        );
        
        const enviado = await emailService.enviarConfirmacionPago(datosNotificacion);

        if (enviado) {
            logBusinessEvent('Notificación enviada', {
                compraId: mensaje.compraId,
                usuarioId: mensaje.usuarioId,
                email: usuario.email,
                evento: evento.nombre,
            });
        } else {
            logger.error(
                `[notificaciones-service]: Fallo al enviar notificación | ` +
                `CompraID: ${mensaje.compraId} | Email: ${usuario.email}`
            );
        }
    }

    /**
     * Cierra la conexión
     */
    async cerrar(): Promise<void> {
        try {
            logger.info('[notificaciones-service]: Cerrando conexión a RabbitMQ...');
            
            if (this.channel) {
                await this.channel.close();
                logger.debug('[notificaciones-service]: Canal de RabbitMQ cerrado');
            }
            
            if (this.connection) {
                await this.connection.close();
                logger.debug('[notificaciones-service]: Conexión a RabbitMQ cerrada');
            }
            
            logger.info('[notificaciones-service]: Desconectado de RabbitMQ correctamente');
        } catch (error: any) {
            logger.error(`[notificaciones-service]: Error al cerrar conexión RabbitMQ: ${error.message}`);
        } finally {
            this.connection = null;
            this.channel = null;
        }
    }
}

export default new RabbitMQService();