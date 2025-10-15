"""
Configuración centralizada del servicio de compras
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Configuración del servicio"""
    
    # Aplicación
    app_name: str = "Servicio de Compras"
    app_version: str = "1.0.0"
    node_env: str = "development"
    port: int = 3002
    
    # Base de datos PostgreSQL (variables individuales)
    db_host: str
    db_port: int = 5432
    db_username: str
    db_password: str
    db_database: str
    
    # JWT
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    
    # Servicios externos
    eventos_service_url: str
    usuarios_service_url: str
    
    # RabbitMQ
    rabbitmq_url: str = "amqp://guest:guest@localhost:5672"
    rabbitmq_queue: str = "notificaciones_compras"
    
    # Logging
    log_level: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = False
    
    @property
    def database_url(self) -> str:
        """Construye la URL de conexión a PostgreSQL"""
        return (
            f"postgresql://{self.db_username}:{self.db_password}"
            f"@{self.db_host}:{self.db_port}/{self.db_database}"
        )


@lru_cache()
def get_settings() -> Settings:
    """Obtiene configuración singleton"""
    return Settings()


settings = get_settings()