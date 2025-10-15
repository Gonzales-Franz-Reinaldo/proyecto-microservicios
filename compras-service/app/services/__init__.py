"""
Módulo de servicios
"""
from app.services.compras_service import compras_service
from app.services.eventos_client import eventos_client
from app.services.rabbitmq_client import rabbitmq_client

__all__ = ["compras_service", "eventos_client", "rabbitmq_client"]