"""
Sistema de logging profesional con formato legible
"""
import logging
import sys
from datetime import datetime
from pathlib import Path
from logging.handlers import TimedRotatingFileHandler
from app.config import settings


class CustomFormatter(logging.Formatter):
    """Formateador personalizado para logs legibles"""
    
    def format(self, record):
        # Formato: [2025-10-15 16:27:00] INFO [compras-service]: mensaje
        timestamp = datetime.fromtimestamp(record.created).strftime('%Y-%m-%d %H:%M:%S')
        level = record.levelname
        
        # Construir mensaje base
        log_msg = f"[{timestamp}] {level:5s} [compras-service]: {record.getMessage()}"
        
        # Agregar información extra si existe
        if hasattr(record, 'request_id'):
            log_msg = f"[{timestamp}] {level:5s} [compras-service] [req:{record.request_id}]: {record.getMessage()}"
        
        # Agregar excepción si existe
        if record.exc_info:
            log_msg += "\n" + self.formatException(record.exc_info)
        
        return log_msg


def setup_logger():
    """Configura el sistema de logging profesional"""
    
    # Crear directorio de logs si no existe
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    # Configurar logger raíz
    logger = logging.getLogger()
    logger.setLevel(getattr(logging, settings.log_level.upper()))
    
    # Limpiar handlers existentes
    logger.handlers.clear()
    
    # ========== HANDLER PARA CONSOLA (con colores) ==========
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.DEBUG if settings.node_env == "development" else logging.INFO)
    console_formatter = CustomFormatter()
    console_handler.setFormatter(console_formatter)
    logger.addHandler(console_handler)
    
    # ========== HANDLER PARA ARCHIVO (rotación diaria) ==========
    file_handler = TimedRotatingFileHandler(
        filename=log_dir / "compras-service.log",
        when="midnight",
        interval=1,
        backupCount=14,  # Mantener 14 días
        encoding="utf-8"
    )
    file_handler.setLevel(logging.INFO)
    file_formatter = CustomFormatter()
    file_handler.setFormatter(file_formatter)
    logger.addHandler(file_handler)
    
    # ========== HANDLER PARA ERRORES (archivo separado) ==========
    error_handler = TimedRotatingFileHandler(
        filename=log_dir / "compras-service-errors.log",
        when="midnight",
        interval=1,
        backupCount=30,  # Mantener errores por 30 días
        encoding="utf-8"
    )
    error_handler.setLevel(logging.ERROR)
    error_formatter = CustomFormatter()
    error_handler.setFormatter(error_formatter)
    logger.addHandler(error_handler)
    
    # Silenciar logs muy verbosos de librerías
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("databases").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    
    logger.info("[compras-service]: Logger inicializado correctamente")
    
    return logger


# Instancia global del logger
logger = setup_logger()


# Funciones helper para logging estructurado
def log_request(method: str, path: str, status_code: int, duration_ms: float, user_id: str = None):
    """Registra una petición HTTP"""
    user_info = f" | Usuario: {user_id}" if user_id else ""
    logger.info(f"{method} {path} - {status_code} ({duration_ms:.2f}ms){user_info}")


def log_db_operation(operation: str, table: str, success: bool, duration_ms: float = None):
    """Registra operaciones de base de datos"""
    status = "exitosa" if success else "fallida"
    duration_info = f" ({duration_ms:.2f}ms)" if duration_ms else ""
    logger.info(f"Operación BD: {operation} en tabla '{table}' - {status}{duration_info}")


def log_external_call(service: str, endpoint: str, status_code: int = None, duration_ms: float = None):
    """Registra llamadas a servicios externos"""
    status_info = f" - {status_code}" if status_code else ""
    duration_info = f" ({duration_ms:.2f}ms)" if duration_ms else ""
    logger.info(f"Llamada externa a {service}: {endpoint}{status_info}{duration_info}")


def log_business_event(event: str, details: dict = None):
    """Registra eventos de negocio importantes"""
    details_str = f" | Detalles: {details}" if details else ""
    logger.info(f"Evento de negocio: {event}{details_str}")