use actix_web::{error::ResponseError, http::StatusCode, HttpResponse};
use serde_json::json;
use std::fmt;

#[allow(dead_code)] 
#[derive(Debug)]
pub enum AppError {
    DatabaseError(String),
    ValidationError(String),
    NotFound(String),
    Unauthorized(String),
    BadRequest(String),
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            AppError::DatabaseError(msg) => write!(f, "Error de base de datos: {}", msg),
            AppError::ValidationError(msg) => write!(f, "Error de validación: {}", msg),
            AppError::NotFound(msg) => write!(f, "No encontrado: {}", msg),
            AppError::Unauthorized(msg) => write!(f, "No autorizado: {}", msg),
            AppError::BadRequest(msg) => write!(f, "Solicitud incorrecta: {}", msg),
        }
    }
}

impl ResponseError for AppError {
    fn error_response(&self) -> HttpResponse {
        let (status, message) = match self {
            AppError::DatabaseError(msg) => (StatusCode::INTERNAL_SERVER_ERROR, msg.clone()),
            AppError::ValidationError(msg) => (StatusCode::BAD_REQUEST, msg.clone()),
            AppError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.clone()),
            AppError::Unauthorized(msg) => (StatusCode::UNAUTHORIZED, msg.clone()),
            AppError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg.clone()),
        };

        HttpResponse::build(status).json(json!({
            "error": message,
            "status": status.as_u16()
        }))
    }
}

impl From<sqlx::Error> for AppError {
    fn from(err: sqlx::Error) -> Self {
        tracing::error!("Database error: {:?}", err);
        AppError::DatabaseError("Error al acceder a la base de datos".to_string())
    }
}

impl From<validator::ValidationErrors> for AppError {
    fn from(err: validator::ValidationErrors) -> Self {
        let messages: Vec<String> = err
            .field_errors()
            .iter()
            .map(|(field, errors)| {
                errors
                    .iter()
                    .map(move |e| {
                        format!(
                            "{}: {}",
                            field,
                            e.message.as_ref().unwrap_or(&"Error de validación".into())
                        )
                    })
                    .collect::<Vec<_>>()
            })
            .flatten()
            .collect();
        
        AppError::ValidationError(messages.join(", "))
    }
}