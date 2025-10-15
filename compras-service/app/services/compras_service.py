"""
Lógica de negocio para el servicio de Compras
"""
from decimal import Decimal
from datetime import datetime
from typing import List
import time
from fastapi import HTTPException
from app.database import database, compras_table
from app.models.compra import CompraCreate, CompraPago, CompraResponse, CompraDetallada
from app.services.eventos_client import eventos_client
from app.services.rabbitmq_client import rabbitmq_client
from app.utils.logger import logger, log_db_operation, log_business_event


class ComprasService:
    """Servicio de gestión de compras"""
    
    async def crear_compra(self, compra_data: CompraCreate, usuario_id: str) -> CompraResponse:
        """Crea una nueva compra de entradas"""
        logger.info(
            f"[compras-service]: Creando compra | "
            f"Usuario: {usuario_id} | Evento: {compra_data.evento_id} | Cantidad: {compra_data.cantidad}"
        )
        
        # 1. Obtener evento
        evento = await eventos_client.get_evento(compra_data.evento_id)
        
        if not evento:
            logger.warning(
                f"[compras-service]: Evento no encontrado | "
                f"EventoID: {compra_data.evento_id} | Usuario: {usuario_id}"
            )
            raise HTTPException(
                status_code=404,
                detail=f"Evento con ID {compra_data.evento_id} no encontrado"
            )
        
        # 2. Validar disponibilidad
        capacidad_disponible = evento.get("capacidad", 0)
        if compra_data.cantidad > capacidad_disponible:
            logger.warning(
                f"[compras-service]: Capacidad insuficiente | "
                f"Solicitado: {compra_data.cantidad} | Disponible: {capacidad_disponible}"
            )
            raise HTTPException(
                status_code=400,
                detail=f"No hay suficiente capacidad (disponible: {capacidad_disponible})"
            )
        
        # 3. Calcular total
        precio_unitario = Decimal(str(evento["precio"]))
        total = precio_unitario * Decimal(str(compra_data.cantidad))
        
        logger.debug(
            f"[compras-service]: Cálculo de precio | "
            f"Precio unitario: ${precio_unitario} | Total: ${total}"
        )
        
        # 4. Guardar en BD
        start_time = time.time()
        query = compras_table.insert().values(
            usuario_id=usuario_id,
            evento_id=compra_data.evento_id,
            cantidad=compra_data.cantidad,
            precio_unitario=precio_unitario,
            total=total,
            estado="pendiente"
        )
        
        try:
            compra_id = await database.execute(query)
            duration_ms = (time.time() - start_time) * 1000
            
            log_db_operation("INSERT", "compras", True, duration_ms)
            log_business_event(
                "Compra creada",
                {
                    "compra_id": compra_id,
                    "usuario_id": usuario_id,
                    "evento_id": compra_data.evento_id,
                    "total": float(total)
                }
            )
            
            logger.info(
                f"[compras-service]: Compra creada exitosamente | "
                f"CompraID: {compra_id} | Usuario: {usuario_id} | Total: ${total}"
            )
            
        except Exception as e:
            duration_ms = (time.time() - start_time) * 1000
            log_db_operation("INSERT", "compras", False, duration_ms)
            logger.error(f"[compras-service]: Error al crear compra: {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail="Error al crear compra")
        
        return await self.get_compra_by_id(compra_id)
    
    async def get_compra_by_id(self, compra_id: int) -> CompraResponse:
        """Obtiene una compra por ID"""
        logger.debug(f"[compras-service]: Consultando compra | CompraID: {compra_id}")
        
        start_time = time.time()
        query = compras_table.select().where(compras_table.c.id == compra_id)
        compra = await database.fetch_one(query)
        duration_ms = (time.time() - start_time) * 1000
        
        if not compra:
            log_db_operation("SELECT", "compras", False, duration_ms)
            logger.warning(f"[compras-service]: Compra no encontrada | CompraID: {compra_id}")
            raise HTTPException(
                status_code=404,
                detail=f"Compra con ID {compra_id} no encontrada"
            )
        
        log_db_operation("SELECT", "compras", True, duration_ms)
        return CompraResponse(**dict(compra))
    
    async def listar_compras_usuario(self, usuario_id: str) -> List[CompraDetallada]:
        """Lista todas las compras de un usuario"""
        logger.info(f"[compras-service]: Listando compras | Usuario: {usuario_id}")
        
        start_time = time.time()
        query = compras_table.select().where(
            compras_table.c.usuario_id == usuario_id
        ).order_by(compras_table.c.fecha_compra.desc())
        
        compras = await database.fetch_all(query)
        duration_ms = (time.time() - start_time) * 1000
        
        log_db_operation("SELECT", "compras", True, duration_ms)
        logger.info(
            f"[compras-service]: Compras encontradas | "
            f"Usuario: {usuario_id} | Total: {len(compras)}"
        )
        
        # Enriquecer con datos del evento
        compras_detalladas = []
        for compra in compras:
            compra_dict = dict(compra)
            evento = await eventos_client.get_evento(compra_dict["evento_id"])
            compra_dict["evento"] = evento
            compras_detalladas.append(CompraDetallada(**compra_dict))
        
        return compras_detalladas
    
    async def confirmar_pago(
        self,
        compra_id: int,
        pago_data: CompraPago,
        usuario_id: str
    ) -> CompraResponse:
        """Confirma el pago de una compra"""
        logger.info(
            f"[compras-service]: Confirmando pago | "
            f"CompraID: {compra_id} | Usuario: {usuario_id} | Método: {pago_data.metodo_pago}"
        )
        
        # 1. Obtener compra
        compra = await self.get_compra_by_id(compra_id)
        
        # 2. Validar propiedad
        if compra.usuario_id != usuario_id:
            logger.warning(
                f"[compras-service]: Intento de pago no autorizado | "
                f"CompraID: {compra_id} | Usuario intentando: {usuario_id} | Propietario: {compra.usuario_id}"
            )
            raise HTTPException(
                status_code=403,
                detail="No tienes permiso para pagar esta compra"
            )
        
        # 3. Validar estado
        if compra.estado == "pagado":
            logger.warning(f"[compras-service]: Compra ya pagada | CompraID: {compra_id}")
            raise HTTPException(status_code=400, detail="Esta compra ya ha sido pagada")
        
        if compra.estado == "cancelado":
            logger.warning(f"[compras-service]: Intento de pagar compra cancelada | CompraID: {compra_id}")
            raise HTTPException(status_code=400, detail="No se puede pagar una compra cancelada")
        
        # 4. Actualizar estado
        fecha_pago = datetime.now()
        start_time = time.time()
        
        query = compras_table.update().where(
            compras_table.c.id == compra_id
        ).values(
            estado="pagado",
            metodo_pago=pago_data.metodo_pago,
            fecha_pago=fecha_pago
        )
        
        try:
            await database.execute(query)
            duration_ms = (time.time() - start_time) * 1000
            
            log_db_operation("UPDATE", "compras", True, duration_ms)
            log_business_event(
                "Pago confirmado",
                {
                    "compra_id": compra_id,
                    "usuario_id": usuario_id,
                    "metodo_pago": pago_data.metodo_pago,
                    "total": float(compra.total)
                }
            )
            
            logger.info(
                f"[compras-service]: Pago confirmado exitosamente | "
                f"CompraID: {compra_id} | Método: {pago_data.metodo_pago} | Total: ${compra.total}"
            )
            
        except Exception as e:
            duration_ms = (time.time() - start_time) * 1000
            log_db_operation("UPDATE", "compras", False, duration_ms)
            logger.error(f"[compras-service]: Error al confirmar pago: {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail="Error al confirmar pago")
        
        # 5. Publicar mensaje en RabbitMQ
        try:
            mensaje = {
                "compraId": compra_id,
                "usuarioId": usuario_id,
                "eventoId": compra.evento_id,
                "cantidad": compra.cantidad,
                "total": float(compra.total),
                "metodoPago": pago_data.metodo_pago,
                "fechaPago": fecha_pago.isoformat()
            }
            await rabbitmq_client.publicar_mensaje(mensaje)
            logger.info(f"[compras-service]: Notificación enviada a RabbitMQ | CompraID: {compra_id}")
        except Exception as e:
            logger.error(
                f"[compras-service]: Error al publicar mensaje en RabbitMQ: {str(e)}",
                exc_info=False
            )
        
        return await self.get_compra_by_id(compra_id)
    
    async def cancelar_compra(self, compra_id: int, usuario_id: str) -> CompraResponse:
        """Cancela una compra pendiente"""
        logger.info(
            f"[compras-service]: Cancelando compra | "
            f"CompraID: {compra_id} | Usuario: {usuario_id}"
        )
        
        compra = await self.get_compra_by_id(compra_id)
        
        if compra.usuario_id != usuario_id:
            logger.warning(
                f"[compras-service]: Intento de cancelación no autorizado | "
                f"CompraID: {compra_id} | Usuario: {usuario_id}"
            )
            raise HTTPException(
                status_code=403,
                detail="No tienes permiso para cancelar esta compra"
            )
        
        if compra.estado == "pagado":
            logger.warning(
                f"[compras-service]: Intento de cancelar compra pagada | CompraID: {compra_id}"
            )
            raise HTTPException(
                status_code=400,
                detail="No se puede cancelar una compra ya pagada"
            )
        
        start_time = time.time()
        query = compras_table.update().where(
            compras_table.c.id == compra_id
        ).values(estado="cancelado")
        
        try:
            await database.execute(query)
            duration_ms = (time.time() - start_time) * 1000
            
            log_db_operation("UPDATE", "compras", True, duration_ms)
            log_business_event("Compra cancelada", {"compra_id": compra_id, "usuario_id": usuario_id})
            
            logger.info(f"[compras-service]: Compra cancelada exitosamente | CompraID: {compra_id}")
            
        except Exception as e:
            duration_ms = (time.time() - start_time) * 1000
            log_db_operation("UPDATE", "compras", False, duration_ms)
            logger.error(f"[compras-service]: Error al cancelar compra: {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail="Error al cancelar compra")
        
        return await self.get_compra_by_id(compra_id)


compras_service = ComprasService()