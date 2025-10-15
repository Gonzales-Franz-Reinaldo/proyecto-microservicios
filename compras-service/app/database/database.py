"""
Conexión a PostgreSQL con databases y SQLAlchemy
"""
import databases
import sqlalchemy
from sqlalchemy.ext.declarative import declarative_base
from app.config import settings
from app.utils.logger import logger
import time

# URL de conexión
DATABASE_URL = settings.database_url

# Crear conexión asíncrona
database = databases.Database(DATABASE_URL)

# Metadata de SQLAlchemy
metadata = sqlalchemy.MetaData()

# Base para modelos
Base = declarative_base()

# Tabla de compras
compras_table = sqlalchemy.Table(
    "compras",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True, autoincrement=True),
    sqlalchemy.Column("usuario_id", sqlalchemy.String(255), nullable=False, index=True),
    sqlalchemy.Column("evento_id", sqlalchemy.Integer, nullable=False, index=True),
    sqlalchemy.Column("cantidad", sqlalchemy.Integer, nullable=False),
    sqlalchemy.Column("precio_unitario", sqlalchemy.DECIMAL(10, 2), nullable=False),
    sqlalchemy.Column("total", sqlalchemy.DECIMAL(10, 2), nullable=False),
    sqlalchemy.Column(
        "estado",
        sqlalchemy.String(50),
        nullable=False,
        default="pendiente",
        index=True
    ),
    sqlalchemy.Column("metodo_pago", sqlalchemy.String(50), nullable=True),
    sqlalchemy.Column(
        "fecha_compra",
        sqlalchemy.DateTime(timezone=True),
        server_default=sqlalchemy.func.now()
    ),
    sqlalchemy.Column("fecha_pago", sqlalchemy.DateTime(timezone=True), nullable=True),
    sqlalchemy.Column(
        "creado_en",
        sqlalchemy.DateTime(timezone=True),
        server_default=sqlalchemy.func.now()
    ),
    sqlalchemy.Column(
        "actualizado_en",
        sqlalchemy.DateTime(timezone=True),
        server_default=sqlalchemy.func.now(),
        onupdate=sqlalchemy.func.now()
    ),
)


def create_tables_sync():
    """Crea las tablas de forma síncrona (solo al inicio)"""
    logger.info("[compras-service]: Verificando tablas en PostgreSQL...")
    
    # Crear engine síncrono temporal solo para crear tablas
    sync_engine = sqlalchemy.create_engine(
        DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://")
    )
    
    try:
        start_time = time.time()
        metadata.create_all(sync_engine)
        duration = (time.time() - start_time) * 1000
        logger.info(f"[compras-service]: Tablas verificadas/creadas correctamente ({duration:.2f}ms)")
    except Exception as e:
        logger.error(f"[compras-service]: Error al crear tablas: {str(e)}", exc_info=True)
        raise
    finally:
        sync_engine.dispose()


async def connect_db():
    """Conecta a la base de datos"""
    logger.info(f"[compras-service]: Conectando a PostgreSQL ({settings.db_host}:{settings.db_port})...")
    
    try:
        start_time = time.time()
        await database.connect()
        duration = (time.time() - start_time) * 1000
        logger.info(f"[compras-service]: Conectado a PostgreSQL exitosamente ({duration:.2f}ms)")
        
        # Crear tablas de forma síncrona
        create_tables_sync()
        
    except Exception as e:
        logger.error(f"[compras-service]: Error al conectar a PostgreSQL: {str(e)}", exc_info=True)
        raise


async def disconnect_db():
    """Desconecta de la base de datos"""
    try:
        await database.disconnect()
        logger.info("[compras-service]: Desconectado de PostgreSQL")
    except Exception as e:
        logger.error(f"[compras-service]: Error al desconectar de PostgreSQL: {str(e)}")