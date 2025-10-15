"""
Cliente RabbitMQ para publicar mensajes de notificación
"""
import json
import aio_pika
from typing import Optional
import time
from app.config import settings
from app.utils.logger import logger


class RabbitMQClient:
    """Cliente para publicar mensajes en RabbitMQ"""
    
    def __init__(self):
        self.connection: Optional[aio_pika.Connection] = None
        self.channel: Optional[aio_pika.Channel] = None
        self.queue_name = settings.rabbitmq_queue
    
    async def conectar(self):
        """Conecta a RabbitMQ"""
        logger.info(f"[compras-service]: Conectando a RabbitMQ ({settings.rabbitmq_url})...")
        
        try:
            start_time = time.time()
            self.connection = await aio_pika.connect_robust(settings.rabbitmq_url)
            self.channel = await self.connection.channel()
            
            # Declarar cola (asegura que existe)
            await self.channel.declare_queue(self.queue_name, durable=True)
            
            duration_ms = (time.time() - start_time) * 1000
            logger.info(
                f"[compras-service]: Conectado a RabbitMQ exitosamente ({duration_ms:.2f}ms) | "
                f"Cola: {self.queue_name}"
            )
        except Exception as e:
            logger.error(
                f"[compras-service]: Error al conectar a RabbitMQ: {str(e)}",
                exc_info=True
            )
            raise
    
    async def publicar_mensaje(self, mensaje: dict):
        """Publica un mensaje en la cola"""
        if not self.channel:
            await self.conectar()
        
        try:
            start_time = time.time()
            mensaje_json = json.dumps(mensaje)
            
            await self.channel.default_exchange.publish(
                aio_pika.Message(
                    body=mensaje_json.encode(),
                    delivery_mode=aio_pika.DeliveryMode.PERSISTENT
                ),
                routing_key=self.queue_name
            )
            
            duration_ms = (time.time() - start_time) * 1000
            logger.info(
                f"[compras-service]: Mensaje publicado en RabbitMQ ({duration_ms:.2f}ms) | "
                f"CompraID: {mensaje.get('compraId')} | Usuario: {mensaje.get('usuarioId')}"
            )
            
        except Exception as e:
            logger.error(
                f"[compras-service]: Error al publicar mensaje en RabbitMQ: {str(e)}",
                exc_info=True
            )
            raise
    
    async def cerrar(self):
        """Cierra la conexión"""
        if self.connection:
            await self.connection.close()
            logger.info("[compras-service]: Conexión a RabbitMQ cerrada")


rabbitmq_client = RabbitMQClient()