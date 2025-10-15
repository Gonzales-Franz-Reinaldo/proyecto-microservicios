import axios from 'axios';
import config from '../config/config';
import logger, { logExternalCall } from '../utils/logger';
import { Usuario } from '../models/notificacion.model';

class UsuariosClient {
    private baseUrl: string;

    constructor() {
        this.baseUrl = config.services.usuarios;
    }

    /**
     * Obtiene datos de un usuario por ID
     */
    async getUsuario(usuarioId: string): Promise<Usuario | null> {
        const endpoint = `/api/v1/users/${usuarioId}`;
        
        try {
            const startTime = Date.now();
            const response = await axios.get(`${this.baseUrl}${endpoint}`, {
                timeout: 5000,
            });
            const durationMs = Date.now() - startTime;

            logExternalCall('usuarios-service', endpoint, response.status, durationMs);

            if (response.status === 200) {
                logger.debug(
                    `[notificaciones-service]: Usuario obtenido | ` +
                    `ID: ${usuarioId} | Email: ${response.data.email}`
                );
                return response.data;
            }

            logger.warn(`[notificaciones-service]: Usuario ${usuarioId} no encontrado (status ${response.status})`);
            return null;
        } catch (error: any) {
            const durationMs = Date.now() - Date.now();
            
            if (error.response?.status === 404) {
                logExternalCall('usuarios-service', endpoint, 404, durationMs);
                logger.warn(`[notificaciones-service]: Usuario ${usuarioId} no encontrado (404)`);
                return null;
            }
            
            logger.error(
                `[notificaciones-service]: Error al obtener usuario ${usuarioId}: ${error.message}`,
                { endpoint, stack: error.stack }
            );
            return null;
        }
    }
}

export default new UsuariosClient();