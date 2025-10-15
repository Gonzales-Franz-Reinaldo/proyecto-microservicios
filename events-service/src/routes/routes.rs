use actix_web::{delete, get, post, put, web, HttpMessage, HttpRequest, HttpResponse, Responder};
use crate::auth::Claims;
use crate::database::MyPool;
use crate::utils::errors::AppError;
use crate::models::{Evento, EventoInput};
use serde_json::json;
use bigdecimal::BigDecimal;  
use std::str::FromStr;

fn require_admin(req: &HttpRequest) -> Result<Claims, AppError> {
    let claims = req
        .extensions()
        .get::<Claims>()
        .cloned()
        .ok_or_else(|| {
            tracing::error!("[events-service]: Claims no encontrados en request extensions");
            AppError::Unauthorized("Token no encontrado".to_string())
        })?;
    
    if claims.role != "admin" {
        tracing::warn!(
            "[events-service]: Acceso denegado para usuario {} con rol '{}'",
            claims.id,
            claims.role
        );
        
        return Err(AppError::Unauthorized(
            format!("Acceso denegado: rol requerido 'admin', actual '{}'", claims.role)
        ));
    }
    
    Ok(claims)
}

// ========== RUTAS PÚBLICAS ==========

#[get("/")]
pub async fn home() -> impl Responder {
    tracing::info!("[events-service]: Endpoint raíz accedido");
    
    HttpResponse::Ok().json(json!({
        "servicio": "eventos",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": {
            "publicos": [
                "GET /",
                "GET /eventos",
                "GET /eventos/{id}"
            ],
            "admin": [
                "POST /eventos",
                "PUT /eventos/{id}",
                "DELETE /eventos/{id}"
            ]
        }
    }))
}

#[get("/eventos")]
pub async fn listar_eventos(pool: web::Data<MyPool>) -> Result<HttpResponse, AppError> {
    tracing::info!("[events-service]: Listando todos los eventos");
    
    let eventos = sqlx::query_as::<_, Evento>(
        r#"SELECT id, nombre, fecha, lugar, capacidad, precio, creado_por, creado_en
           FROM eventos 
           WHERE fecha >= NOW()
           ORDER BY fecha ASC"#,
    )
    .fetch_all(pool.get_ref())
    .await
    .map_err(|e| {
        tracing::error!("[events-service]: Error al consultar eventos: {}", e);
        AppError::DatabaseError("Error al listar eventos".to_string())
    })?;

    tracing::info!("[events-service]: Se encontraron {} eventos", eventos.len());

    Ok(HttpResponse::Ok().json(json!({
        "eventos": eventos,
        "total": eventos.len()
    })))
}

#[get("/eventos/{id}")]
pub async fn obtener_evento(
    pool: web::Data<MyPool>,
    id: web::Path<i32>, 
) -> Result<HttpResponse, AppError> {
    let evento_id = id.into_inner();
    
    tracing::info!("[events-service]: Consultando evento con ID {}", evento_id);

    let evento = sqlx::query_as::<_, Evento>(
        r#"SELECT id, nombre, fecha, lugar, capacidad, precio, creado_por, creado_en
           FROM eventos WHERE id = ?"#,
    )
    .bind(evento_id)
    .fetch_optional(pool.get_ref())
    .await
    .map_err(|e| {
        tracing::error!("[events-service]: Error en consulta BD para evento {}: {}", evento_id, e);
        AppError::DatabaseError("Error al obtener evento".to_string())
    })?
    .ok_or_else(|| {
        tracing::warn!("[events-service]: Evento con ID {} no encontrado", evento_id);
        AppError::NotFound(format!("Evento {} no existe", evento_id))
    })?;

    tracing::info!("[events-service]: Evento {} encontrado: '{}'", evento_id, evento.nombre);

    Ok(HttpResponse::Ok().json(evento))
}

// ========== RUTAS PROTEGIDAS (ADMIN) ==========

#[post("/eventos")]
pub async fn crear_evento(
    pool: web::Data<MyPool>,
    body: web::Json<EventoInput>,
    req: HttpRequest,
) -> Result<HttpResponse, AppError> {
    let claims = require_admin(&req)?;
    
    tracing::info!(
        "[events-service]: Creando evento '{}' por admin {}", 
        body.nombre, 
        claims.id
    );
    
    body.validate()?;

    let precio_decimal = BigDecimal::from_str(&body.precio.to_string())
        .map_err(|_| AppError::ValidationError("Precio inválido".to_string()))?;

    let result = sqlx::query(
        r#"INSERT INTO eventos (nombre, fecha, lugar, capacidad, precio, creado_por)
           VALUES (?, ?, ?, ?, ?, ?)"#,
    )
    .bind(&body.nombre)
    .bind(&body.fecha)
    .bind(&body.lugar)
    .bind(body.capacidad)
    .bind(&precio_decimal)  
    .bind(&claims.id) 
    .execute(pool.get_ref())
    .await
    .map_err(|e| {
        tracing::error!("[events-service]: Error al crear evento: {}", e);
        AppError::DatabaseError("Error al crear evento".to_string())
    })?;

    let id = result.last_insert_id() as i32;
    
    tracing::info!(
        "[events-service]: Evento creado exitosamente {{\"eventoId\":\"{}\",\"nombre\":\"{}\"}}",
        id,
        body.nombre
    );

    Ok(HttpResponse::Created().json(json!({
        "message": "Evento creado exitosamente",
        "evento": {
            "id": id,
            "nombre": body.nombre,
            "fecha": body.fecha,
            "lugar": body.lugar,
            "capacidad": body.capacidad,
            "precio": body.precio,
            "creado_por": claims.id
        }
    })))
}

#[put("/eventos/{id}")]
pub async fn actualizar_evento(
    pool: web::Data<MyPool>,
    id: web::Path<i32>, 
    body: web::Json<EventoInput>,
    req: HttpRequest,
) -> Result<HttpResponse, AppError> {
    let claims = require_admin(&req)?;
    let evento_id = id.into_inner();
    
    tracing::info!(
        "[events-service]: Actualizando evento {} por admin {}",
        evento_id,
        claims.id
    );
    
    body.validate()?;

    let precio_decimal = BigDecimal::from_str(&body.precio.to_string())
        .map_err(|_| AppError::ValidationError("Precio inválido".to_string()))?;

    let result = sqlx::query(
        r#"UPDATE eventos 
           SET nombre = ?, fecha = ?, lugar = ?, capacidad = ?, precio = ? 
           WHERE id = ?"#,
    )
    .bind(&body.nombre)
    .bind(&body.fecha)
    .bind(&body.lugar)
    .bind(body.capacidad)
    .bind(&precio_decimal)
    .bind(evento_id)
    .execute(pool.get_ref())
    .await
    .map_err(|e| {
        tracing::error!("[events-service]: Error al actualizar evento {}: {}", evento_id, e);
        AppError::DatabaseError("Error al actualizar".to_string())
    })?;

    if result.rows_affected() == 0 {
        tracing::warn!("[events-service]: Evento {} no encontrado para actualizar", evento_id);
        return Err(AppError::NotFound(format!("Evento {} no existe", evento_id)));
    }

    tracing::info!("[events-service]: Evento actualizado {{\"eventoId\":\"{}\"}}", evento_id);

    Ok(HttpResponse::Ok().json(json!({
        "message": "Evento actualizado exitosamente",
        "id": evento_id
    })))
}

#[delete("/eventos/{id}")]
pub async fn eliminar_evento(
    pool: web::Data<MyPool>,
    id: web::Path<i32>,
    req: HttpRequest,
) -> Result<HttpResponse, AppError> {
    let claims = require_admin(&req)?;
    let evento_id = id.into_inner();
    
    tracing::info!(
        "[events-service]: Eliminando evento {} por admin {}",
        evento_id,
        claims.id
    );

    let result = sqlx::query(r#"DELETE FROM eventos WHERE id = ?"#)
        .bind(evento_id)
        .execute(pool.get_ref())
        .await
        .map_err(|e| {
            tracing::error!("[events-service]: Error al eliminar evento {}: {}", evento_id, e);
            AppError::DatabaseError("Error al eliminar".to_string())
        })?;

    if result.rows_affected() == 0 {
        tracing::warn!("[events-service]: Evento {} no encontrado para eliminar", evento_id);
        return Err(AppError::NotFound(format!("Evento {} no existe", evento_id)));
    }

    tracing::info!("[events-service]: Evento eliminado {{\"eventoId\":\"{}\"}}", evento_id);

    Ok(HttpResponse::Ok().json(json!({
        "message": "Evento eliminado exitosamente",
        "id": evento_id
    })))
}
