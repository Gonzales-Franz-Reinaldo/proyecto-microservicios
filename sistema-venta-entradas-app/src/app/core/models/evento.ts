export interface Evento {
    id: number;
    nombre: string;
    fecha: string; 
    lugar: string;
    capacidad: number;
    precio: number;
    creado_por?: string;
    creado_en?: string;
}

export interface EventoInput {
    nombre: string;
    fecha: string; // "YYYY-MM-DD HH:mm:ss"
    lugar: string;
    capacidad: number;
    precio: number;
}

export interface EventosResponse {
    eventos: Evento[];
    total: number;
}