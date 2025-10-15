/**
 * Mensaje que llega desde el servicio de Compras vía RabbitMQ
 */
export interface MensajeCompra {
    compraId: number;
    usuarioId: string;
    eventoId: number;
    cantidad: number;
    total: number;
    metodoPago: string;
    fechaPago: string;
}

/**
 * Datos del usuario obtenidos del servicio de Usuarios
 */
export interface Usuario {
    _id: string;
    name: string;
    email: string;
    role: string;
}

/**
 * Datos del evento obtenidos del servicio de Eventos
 */
export interface Evento {
    id: number;
    nombre: string;
    fecha: string;
    lugar: string;
    capacidad: number;
    precio: number;
}

/**
 * Datos completos para enviar el email
 */
export interface DatosNotificacion {
    usuario: Usuario;
    evento: Evento;
    compra: {
        id: number;
        cantidad: number;
        total: number;
        metodoPago: string;
        fechaPago: string;
    };
}