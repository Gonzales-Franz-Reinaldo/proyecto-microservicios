import nodemailer, { Transporter } from 'nodemailer';
import config from '../config/config';
import logger, { logEmailEnviado, logEmailError } from '../utils/logger';
import { DatosNotificacion } from '../models/notificacion.model';
import { generarEmailConfirmacion, generarEmailTextoPlano } from '../templates/email.template';

class EmailService {
    private transporter: Transporter;

    constructor() {
        logger.debug(`[notificaciones-service]: Configurando transporter SMTP (${config.email.host}:${config.email.port})`);
        
        this.transporter = nodemailer.createTransport({
            host: config.email.host,
            port: config.email.port,
            secure: config.email.secure,
            auth: {
                user: config.email.user,
                pass: config.email.pass,
            },
        });
    }

    /**
     * Verifica la conexión con el servidor SMTP
     */
    async verificarConexion(): Promise<boolean> {
        try {
            logger.info(`[notificaciones-service]: Verificando conexión SMTP (${config.email.host}:${config.email.port})...`);
            
            const startTime = Date.now();
            await this.transporter.verify();
            const durationMs = Date.now() - startTime;
            
            logger.info(
                `[notificaciones-service]: Conexión SMTP verificada exitosamente (${durationMs}ms) | ` +
                `Usuario: ${config.email.user}`
            );
            return true;
        } catch (error: any) {
            logger.error(
                `[notificaciones-service]: Error al conectar con servidor SMTP: ${error.message}`,
                { stack: error.stack }
            );
            return false;
        }
    }

    /**
     * Envía email de confirmación de pago (HTML + texto plano)
     */
    async enviarConfirmacionPago(datos: DatosNotificacion): Promise<boolean> {
        const { usuario, compra, evento } = datos;

        try {
            logger.debug(
                `[notificaciones-service]: Generando contenido del email | ` +
                `CompraID: ${compra.id} | Evento: ${evento.nombre}`
            );
            
            const contenidoHTML = generarEmailConfirmacion(datos);
            const contenidoTexto = generarEmailTextoPlano(datos);

            const mailOptions = {
                from: `"🎫 Sistema de Entradas" <${config.email.user}>`,
                to: usuario.email,
                subject: `✓ Confirmación de Pago - Compra #${String(compra.id).padStart(6, '0')}`,
                text: contenidoTexto,  
                html: contenidoHTML,  
            };

            logger.info(
                `[notificaciones-service]: Enviando email | ` +
                `Destinatario: ${usuario.email} | ` +
                `Asunto: "${mailOptions.subject}"`
            );

            const startTime = Date.now();
            const info = await this.transporter.sendMail(mailOptions);
            const durationMs = Date.now() - startTime;

            logEmailEnviado(usuario.email, compra.id, info.messageId);
            logger.debug(`[notificaciones-service]: Email enviado (${durationMs}ms)`);
            
            return true;
        } catch (error: any) {
            logEmailError(usuario.email, compra.id, error.message);
            logger.error(
                `[notificaciones-service]: Detalles del error de email`,
                {
                    compraId: compra.id,
                    destinatario: usuario.email,
                    error: error.message,
                    stack: error.stack,
                }
            );
            return false;
        }
    }
}

export default new EmailService();