export interface Compra {
    id: number;
    usuario_id: string;
    evento_id: number;
    cantidad: number;
    precio_unitario: number;
    total: number;
    estado: 'pendiente' | 'pagado' | 'cancelado';
    metodo_pago?: string;
    fecha_compra: string;
    fecha_pago?: string;
}

export interface CompraDetallada extends Compra {
    evento?: {
        id: number;
        nombre: string;
        fecha: string;
        lugar: string;
        capacidad: number;
        precio: number;
    };
}

export interface CompraCreate {
    evento_id: number;
    cantidad: number;
}

export interface CompraPago {
    metodo_pago: string;
}

export interface CompraResponse {
    message?: string;
    data?: any;
}

export interface CompraListResponse {
    total: number;
    compras: CompraDetallada[];
}

export interface EventosDisponiblesResponse {
    total: number;
    eventos: any[];
}