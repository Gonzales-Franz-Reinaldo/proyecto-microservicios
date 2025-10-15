"""
Aplicación FastAPI - Servicio de Compras
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import time
import uuid
from app.config import settings
from app.database import connect_db, disconnect_db
from app.routes import compras
from app.services.rabbitmq_client import rabbitmq_client 
from app.utils.logger import logger, log_request


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manejo del ciclo de vida de la aplicación"""
    # Startup
    logger.info("=" * 50)
    logger.info(f"[compras-service]: Iniciando {settings.app_name} v{settings.app_version}")
    logger.info(f"[compras-service]: Ambiente: {settings.node_env}")
    logger.info("=" * 50)
    
    await connect_db()
    await rabbitmq_client.conectar()
    
    logger.info(f"[compras-service]: Servidor escuchando en http://0.0.0.0:{settings.port}")
    logger.info(f"[compras-service]: Documentación disponible en http://localhost:{settings.port}/docs")
    logger.info("=" * 50)
    
    yield
    
    # Shutdown
    logger.info("[compras-service]: Iniciando cierre del servicio...")
    await rabbitmq_client.cerrar()
    await disconnect_db()
    logger.info("[compras-service]: Servicio de compras cerrado correctamente")


# Crear aplicación
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="API REST para gestión de compra de entradas",
    lifespan=lifespan
)


# Middleware para Request ID y timing
@app.middleware("http")
async def log_requests_middleware(request: Request, call_next):
    """Middleware para logging de peticiones HTTP"""
    # Generar Request ID único
    request_id = str(uuid.uuid4())[:8]
    request.state.request_id = request_id
    
    # Registrar inicio
    start_time = time.time()
    
    # Procesar request
    response = await call_next(request)
    
    # Calcular duración
    duration_ms = (time.time() - start_time) * 1000
    
    # Obtener usuario si existe
    user_id = getattr(request.state, "user_id", None)
    
    # Log de la petición
    log_request(
        method=request.method,
        path=request.url.path,
        status_code=response.status_code,
        duration_ms=duration_ms,
        user_id=user_id
    )
    
    # Agregar headers de respuesta
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Response-Time"] = f"{duration_ms:.2f}ms"
    
    return response


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar rutas
app.include_router(compras.router)


@app.get("/", tags=["Health"])
async def root():
    """Endpoint raíz - health check"""
    logger.debug("[compras-service]: Health check solicitado")
    return {
        "servicio": settings.app_name,
        "version": settings.app_version,
        "status": "operational",
        "ambiente": settings.node_env
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Manejador global de excepciones"""
    request_id = getattr(request.state, "request_id", "unknown")
    logger.error(
        f"[compras-service]: Error no manejado [req:{request_id}] | "
        f"{request.method} {request.url.path} | Error: {str(exc)}",
        exc_info=True
    )
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Error interno del servidor",
            "request_id": request_id
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.port,
        reload=settings.node_env == "development",
        log_level="warning"  
    )