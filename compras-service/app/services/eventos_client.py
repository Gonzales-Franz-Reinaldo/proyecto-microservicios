"""
Cliente HTTP para el servicio de Eventos (Rust)
"""
import httpx
from typing import Optional
import time
from app.config import settings
from app.utils.logger import logger, log_external_call


class EventosClient:
    """Cliente para comunicarse con el servicio de Eventos"""
    
    def __init__(self):
        self.base_url = settings.eventos_service_url
    
    async def get_evento(self, evento_id: int) -> Optional[dict]:
        """Obtiene un evento por ID"""
        endpoint = f"/eventos/{evento_id}"
        
        try:
            start_time = time.time()
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.base_url}{endpoint}")
                duration_ms = (time.time() - start_time) * 1000
                
                log_external_call("eventos-service", endpoint, response.status_code, duration_ms)
                
                if response.status_code == 200:
                    return response.json()
                elif response.status_code == 404:
                    logger.warning(
                        f"[compras-service]: Evento no encontrado en servicio externo | "
                        f"EventoID: {evento_id}"
                    )
                    return None
                else:
                    logger.error(
                        f"[compras-service]: Error al obtener evento | "
                        f"EventoID: {evento_id} | Status: {response.status_code}"
                    )
                    return None
                    
        except httpx.RequestError as e:
            logger.error(
                f"[compras-service]: Error de conexión con eventos-service | "
                f"Endpoint: {endpoint} | Error: {str(e)}"
            )
            return None
    
    async def listar_eventos(self) -> list:
        """Lista todos los eventos disponibles"""
        endpoint = "/eventos"
        
        try:
            start_time = time.time()
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{self.base_url}{endpoint}")
                duration_ms = (time.time() - start_time) * 1000
                
                log_external_call("eventos-service", endpoint, response.status_code, duration_ms)
                
                if response.status_code == 200:
                    data = response.json()
                    eventos = data.get("eventos", [])
                    logger.info(
                        f"[compras-service]: Eventos obtenidos | Total: {len(eventos)}"
                    )
                    return eventos
                else:
                    logger.error(
                        f"[compras-service]: Error al listar eventos | Status: {response.status_code}"
                    )
                    return []
                    
        except httpx.RequestError as e:
            logger.error(
                f"[compras-service]: Error de conexión con eventos-service | "
                f"Endpoint: {endpoint} | Error: {str(e)}"
            )
            return []


eventos_client = EventosClient()