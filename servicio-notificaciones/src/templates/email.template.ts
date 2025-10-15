import { DatosNotificacion } from '../models/notificacion.model';

/**
 * Genera el contenido HTML del email de confirmación
 */
export function generarEmailConfirmacion(datos: DatosNotificacion): string {
    const { usuario, evento, compra } = datos;
    
    const fechaEvento = new Date(evento.fecha).toLocaleString('es-ES', {
        dateStyle: 'full',
        timeStyle: 'short',
        timeZone: 'America/La_Paz'
    });
    
    const fechaPago = new Date(compra.fechaPago).toLocaleString('es-ES', {
        dateStyle: 'long',
        timeStyle: 'medium',
        timeZone: 'America/La_Paz'
    });

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación de Pago</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f7; color: #333;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f4f7;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <!-- Container principal -->
                <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                                ✓ Pago Confirmado
                            </h1>
                            <p style="margin: 10px 0 0 0; color: #e0e7ff; font-size: 16px;">
                                Compra #${String(compra.id).padStart(6, '0')}
                            </p>
                        </td>
                    </tr>

                    <!-- Saludo -->
                    <tr>
                        <td style="padding: 30px 30px 20px 30px;">
                            <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #333;">
                                Hola <strong>${usuario.name}</strong>,
                            </p>
                            <p style="margin: 15px 0 0 0; font-size: 16px; line-height: 1.6; color: #555;">
                                ¡Tu pago ha sido procesado exitosamente! 🎉 Aquí están los detalles de tu compra:
                            </p>
                        </td>
                    </tr>

                    <!-- Detalles del Evento -->
                    <tr>
                        <td style="padding: 0 30px;">
                            <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8fafc; border-radius: 8px; overflow: hidden;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <h2 style="margin: 0 0 15px 0; font-size: 20px; color: #667eea; font-weight: 600;">
                                            🎫 ${evento.nombre}
                                        </h2>
                                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                            <tr>
                                                <td style="padding: 8px 0; font-size: 14px; color: #666;">
                                                    <strong style="color: #333;">📅 Fecha:</strong>
                                                </td>
                                                <td style="padding: 8px 0; font-size: 14px; color: #555; text-align: right;">
                                                    ${fechaEvento}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; font-size: 14px; color: #666;">
                                                    <strong style="color: #333;">📍 Lugar:</strong>
                                                </td>
                                                <td style="padding: 8px 0; font-size: 14px; color: #555; text-align: right;">
                                                    ${evento.lugar}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; font-size: 14px; color: #666;">
                                                    <strong style="color: #333;">🎟️ Cantidad:</strong>
                                                </td>
                                                <td style="padding: 8px 0; font-size: 14px; color: #555; text-align: right;">
                                                    ${compra.cantidad} ${compra.cantidad === 1 ? 'entrada' : 'entradas'}
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Resumen de Pago -->
                    <tr>
                        <td style="padding: 25px 30px 20px 30px;">
                            <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #333; font-weight: 600;">
                                💳 Resumen de Pago
                            </h3>
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 10px 0; font-size: 15px; color: #555; border-bottom: 1px solid #e5e7eb;">
                                        Precio unitario
                                    </td>
                                    <td style="padding: 10px 0; font-size: 15px; color: #555; text-align: right; border-bottom: 1px solid #e5e7eb;">
                                        $${evento.precio.toFixed(2)}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; font-size: 15px; color: #555; border-bottom: 1px solid #e5e7eb;">
                                        Cantidad
                                    </td>
                                    <td style="padding: 10px 0; font-size: 15px; color: #555; text-align: right; border-bottom: 1px solid #e5e7eb;">
                                        ${compra.cantidad}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; font-size: 15px; color: #555; border-bottom: 1px solid #e5e7eb;">
                                        Método de pago
                                    </td>
                                    <td style="padding: 10px 0; font-size: 15px; color: #555; text-align: right; border-bottom: 1px solid #e5e7eb;">
                                        ${compra.metodoPago.charAt(0).toUpperCase() + compra.metodoPago.slice(1)}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 15px 0 0 0; font-size: 18px; color: #333; font-weight: 700;">
                                        Total Pagado
                                    </td>
                                    <td style="padding: 15px 0 0 0; font-size: 22px; color: #10b981; text-align: right; font-weight: 700;">
                                        $${compra.total.toFixed(2)}
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Información de la Transacción -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <p style="margin: 0 0 10px 0; font-size: 14px; color: #92400e; font-weight: 600;">
                                            ℹ️ Información de la Transacción
                                        </p>
                                        <p style="margin: 5px 0; font-size: 13px; color: #78350f; line-height: 1.6;">
                                            <strong>ID:</strong> #${String(compra.id).padStart(6, '0')}<br>
                                            <strong>Fecha:</strong> ${fechaPago}<br>
                                            <strong>Usuario:</strong> ${usuario.email}<br>
                                            <strong>Estado:</strong> <span style="color: #10b981; font-weight: 600;">✓ PAGADO</span>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Call to Action -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px; text-align: center;">
                            <table role="presentation" style="margin: 0 auto; border-collapse: collapse;">
                                <tr>
                                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; padding: 0;">
                                        <a href="#" style="display: inline-block; padding: 15px 40px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none;">
                                            Ver mis entradas
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">
                                ¿Necesitas ayuda? Contáctanos en <a href="mailto:soporte@tickets.com" style="color: #667eea; text-decoration: none;">soporte@tickets.com</a>
                            </p>
                            <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                                Sistema de Venta de Entradas © 2025<br>
                                Este correo fue enviado a ${usuario.email}
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
}

/**
 * Genera versión de texto plano (fallback para clientes que no soportan HTML)
 */
export function generarEmailTextoPlano(datos: DatosNotificacion): string {
    const { usuario, evento, compra } = datos;
    
    const fechaEvento = new Date(evento.fecha).toLocaleString('es-ES', {
        dateStyle: 'full',
        timeStyle: 'short',
        timeZone: 'America/La_Paz'
    });
    
    const fechaPago = new Date(compra.fechaPago).toLocaleString('es-ES', {
        dateStyle: 'long',
        timeStyle: 'medium',
        timeZone: 'America/La_Paz'
    });

    return `
═══════════════════════════════════════════════════════════════
✓ CONFIRMACIÓN DE PAGO - COMPRA #${String(compra.id).padStart(6, '0')}
═══════════════════════════════════════════════════════════════

Hola ${usuario.name},

¡Tu pago ha sido procesado exitosamente! 🎉

───────────────────────────────────────────────────────────────
🎫 DETALLES DEL EVENTO
───────────────────────────────────────────────────────────────

Evento: ${evento.nombre}
📅 Fecha: ${fechaEvento}
📍 Lugar: ${evento.lugar}
🎟️ Cantidad de entradas: ${compra.cantidad}

───────────────────────────────────────────────────────────────
💳 RESUMEN DE PAGO
───────────────────────────────────────────────────────────────

Precio unitario:        $${evento.precio.toFixed(2)}
Cantidad:               ${compra.cantidad}
Método de pago:         ${compra.metodoPago.toUpperCase()}

TOTAL PAGADO:           $${compra.total.toFixed(2)}

───────────────────────────────────────────────────────────────
ℹ️  INFORMACIÓN DE LA TRANSACCIÓN
───────────────────────────────────────────────────────────────

• ID de Compra: #${String(compra.id).padStart(6, '0')}
• Fecha de Pago: ${fechaPago}
• Usuario: ${usuario.email}
• Estado: ✓ PAGADO

───────────────────────────────────────────────────────────────

¿Necesitas ayuda? Contáctanos en soporte@tickets.com

Sistema de Venta de Entradas © 2025
Este correo fue enviado a ${usuario.email}
    `.trim();
}