"""
Schemas para respuestas HTTP
"""
from typing import List, Optional
from pydantic import BaseModel
from app.models.compra import CompraResponse, CompraDetallada


class MessageResponse(BaseModel):
    """Respuesta genérica con mensaje"""
    message: str
    data: Optional[dict] = None


class CompraListResponse(BaseModel):
    """Lista de compras"""
    total: int
    compras: List[CompraDetallada]


class ErrorResponse(BaseModel):
    """Respuesta de error"""
    detail: str
    status_code: int