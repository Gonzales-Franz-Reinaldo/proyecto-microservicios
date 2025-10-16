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
    fecha: string; // "YYYY-MM-DDTHH:mm:ss"
    lugar: string;
    capacidad: number;
    precio: number;
}

export interface EventosResponse {
    eventos: Evento[];
    total: number;
}

export interface EventoCreateResponse {
    message: string;
    evento: Evento;
}

export interface EventoUpdateResponse {
    message: string;
    id: number;
}

export interface EventoDeleteResponse {
    message: string;
    id: number;
}