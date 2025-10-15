"""
Modelos de dominio para Compra
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field, field_validator


class CompraBase(BaseModel):
    """Base para Compra"""
    evento_id: int = Field(..., gt=0, description="ID del evento")
    cantidad: int = Field(..., gt=0, le=100, description="Cantidad de entradas (1-100)")


class CompraCreate(CompraBase):
    """Request para crear compra"""
    pass


class CompraPago(BaseModel):
    """Request para confirmar pago"""
    metodo_pago: str = Field(..., min_length=3, max_length=50, description="Método de pago (tarjeta, efectivo, transferencia)")


class CompraResponse(BaseModel):
    """Response de Compra"""
    id: int
    usuario_id: str
    evento_id: int
    cantidad: int
    precio_unitario: Decimal
    total: Decimal
    estado: str
    metodo_pago: Optional[str] = None
    fecha_compra: datetime
    fecha_pago: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class CompraDetallada(CompraResponse):
    """Compra con detalles del evento"""
    evento: Optional[dict] = None