"""
Endpoints del servicio de Compras
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.models.compra import CompraCreate, CompraPago, CompraResponse, CompraDetallada
from app.schemas.compra_schema import MessageResponse, CompraListResponse
from app.services.compras_service import compras_service
from app.services.eventos_client import eventos_client
from app.utils.jwt_utils import get_current_user

router = APIRouter(prefix="/api/compras", tags=["Compras"])


@router.get("/eventos", summary="Listar eventos disponibles")
async def listar_eventos(current_user: dict = Depends(get_current_user)):
    """
    Lista todos los eventos disponibles para comprar entradas
    
    **Requiere autenticación** (token JWT válido)
    """
    eventos = await eventos_client.listar_eventos()
    return {
        "total": len(eventos),
        "eventos": eventos
    }


@router.post(
    "/",
    response_model=CompraResponse,
    status_code=201,
    summary="Crear nueva compra"
)
async def crear_compra(
    compra_data: CompraCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Crea una nueva compra de entradas para un evento
    
    **Requiere autenticación**
    
    - **evento_id**: ID del evento (debe existir)
    - **cantidad**: Número de entradas (1-100)
    
    La compra se crea en estado "pendiente"
    """
    return await compras_service.crear_compra(
        compra_data,
        current_user["id"]
    )


@router.get(
    "/mis-compras",
    response_model=CompraListResponse,
    summary="Mis compras"
)
async def mis_compras(current_user: dict = Depends(get_current_user)):
    """
    Lista todas las compras del usuario autenticado
    
    **Requiere autenticación**
    
    Incluye detalles del evento asociado a cada compra
    """
    compras = await compras_service.listar_compras_usuario(current_user["id"])
    return {
        "total": len(compras),
        "compras": compras
    }


@router.get(
    "/{compra_id}",
    response_model=CompraResponse,
    summary="Obtener compra por ID"
)
async def obtener_compra(
    compra_id: int,
    current_user: dict = Depends(get_current_user)
):
    """
    Obtiene los detalles de una compra específica
    
    **Requiere autenticación**
    """
    compra = await compras_service.get_compra_by_id(compra_id)
    
    # Validar propiedad
    if compra.usuario_id != current_user["id"]:
        raise HTTPException(
            status_code=403,
            detail="No tienes permiso para ver esta compra"
        )
    
    return compra


@router.post(
    "/{compra_id}/pagar",
    response_model=CompraResponse,
    summary="Confirmar pago de compra"
)
async def pagar_compra(
    compra_id: int,
    pago_data: CompraPago,
    current_user: dict = Depends(get_current_user)
):
    """
    Confirma el pago de una compra pendiente
    
    **Requiere autenticación**
    
    - **metodo_pago**: Método de pago usado (tarjeta, efectivo, transferencia, etc.)
    
    La compra cambia de estado "pendiente" a "pagado"
    """
    return await compras_service.confirmar_pago(
        compra_id,
        pago_data,
        current_user["id"]
    )


@router.delete(
    "/{compra_id}",
    response_model=MessageResponse,
    summary="Cancelar compra"
)
async def cancelar_compra(
    compra_id: int,
    current_user: dict = Depends(get_current_user)
):
    """
    Cancela una compra pendiente
    
    **Requiere autenticación**
    
    Solo se pueden cancelar compras en estado "pendiente"
    """
    compra = await compras_service.cancelar_compra(compra_id, current_user["id"])
    return {
        "message": "Compra cancelada exitosamente",
        "data": {"compra_id": compra.id, "estado": compra.estado}
    }