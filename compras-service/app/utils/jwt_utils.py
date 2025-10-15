"""
Validación de JWT compatible con servicio de Usuarios (Node.js)
"""
import jwt
from fastapi import HTTPException, Security, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from app.config import settings
from app.utils.logger import logger

security = HTTPBearer()


def verify_jwt(
    credentials: HTTPAuthorizationCredentials = Security(security),
    request: Request = None
) -> dict:
    """
    Valida el token JWT y retorna los claims
    
    Args:
        credentials: Token Bearer del header Authorization
        request: Request actual (para logging)
        
    Returns:
        dict con claims (id, role, exp)
        
    Raises:
        HTTPException 401 si el token es inválido
    """
    token = credentials.credentials
    token_preview = f"{token[:10]}...{token[-10:]}" if len(token) > 20 else "token_corto"
    
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm]
        )
        
        # Validar campos requeridos
        if "id" not in payload or "role" not in payload:
            logger.warning(
                f"[compras-service]: Token inválido - faltan claims requeridos | "
                f"Token: {token_preview}"
            )
            raise HTTPException(
                status_code=401,
                detail="Token inválido: faltan claims requeridos"
            )
        
        logger.info(
            f"[compras-service]: Autenticación exitosa | "
            f"Usuario: {payload['id']} | Rol: {payload['role']}"
        )
        
        # Guardar user_id en request.state para el middleware de logging
        if request:
            request.state.user_id = payload['id']
        
        return payload
        
    except jwt.ExpiredSignatureError:
        logger.warning(
            f"[compras-service]: Token expirado | Token: {token_preview}"
        )
        raise HTTPException(
            status_code=401,
            detail="Token expirado"
        )
    except jwt.InvalidTokenError as e:
        logger.warning(
            f"[compras-service]: Token inválido | Error: {str(e)} | Token: {token_preview}"
        )
        raise HTTPException(
            status_code=401,
            detail=f"Token inválido: {str(e)}"
        )


def get_current_user(token_data: dict = Security(verify_jwt)) -> dict:
    """Obtiene el usuario actual del token"""
    return {
        "id": token_data["id"],
        "role": token_data["role"]
    }