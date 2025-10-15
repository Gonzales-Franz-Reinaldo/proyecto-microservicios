import axios from 'axios';
import config from '../config/config';
import logger, { logExternalCall } from '../utils/logger';
import { Evento } from '../models/notificacion.model';

class EventosClient {
    private baseUrl: string;

    constructor() {
        this.baseUrl = config.services.eventos;
    }

    /**
     * Obtiene datos de un evento por ID
     */
    async getEvento(eventoId: number): Promise<Evento | null> {
        const endpoint = `/eventos/${eventoId}`;
        
        try {
            const startTime = Date.now();
            const response = await axios.get(`${this.baseUrl}${endpoint}`, {
                timeout: 5000,
            });
            const durationMs = Date.now() - startTime;

            logExternalCall('eventos-service', endpoint, response.status, durationMs);

            if (response.status === 200) {
                logger.debug(
                    `[notificaciones-service]: Evento obtenido | ` +
                    `ID: ${eventoId} | Nombre: ${response.data.nombre}`
                );
                return response.data;
            }

            logger.warn(`[notificaciones-service]: Evento ${eventoId} no encontrado (status ${response.status})`);
            return null;
        } catch (error: any) {
            const durationMs = Date.now() - Date.now();
            
            if (error.response?.status === 404) {
                logExternalCall('eventos-service', endpoint, 404, durationMs);
                logger.warn(`[notificaciones-service]: Evento ${eventoId} no encontrado (404)`);
                return null;
            }
            
            logger.error(
                `[notificaciones-service]: Error al obtener evento ${eventoId}: ${error.message}`,
                { endpoint, stack: error.stack }
            );
            return null;
        }
    }
}

export default new EventosClient();