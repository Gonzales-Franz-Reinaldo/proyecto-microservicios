use actix_web::{dev::ServiceRequest, Error as ActixError, HttpMessage};
use actix_web_httpauth::extractors::bearer::BearerAuth;
use jsonwebtoken::{decode, DecodingKey, Validation, Algorithm};
use serde::Deserialize;

#[derive(Debug, Clone, serde::Serialize, Deserialize)]
pub struct Claims {
    pub id: String,
    pub role: String,
    pub exp: usize,
}

// Validador para HttpAuthentication::bearer(...)
pub async fn validator(
    req: ServiceRequest,
    credentials: BearerAuth,
) -> Result<ServiceRequest, (ActixError, ServiceRequest)> {
    let secret = std::env::var("JWT_SECRET")
        .unwrap_or_else(|_| "dev_secret".into());
    
    let token = credentials.token();

    let data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &Validation::new(Algorithm::HS256),
    );

    match data {
        Ok(tok) => {
            tracing::info!(
                "[events-service]: Autenticación exitosa {{\"userId\":\"{}\",\"role\":\"{}\"}}",
                tok.claims.id,
                tok.claims.role
            );
            
            req.extensions_mut().insert(tok.claims);
            Ok(req)
        }
        Err(e) => {
            tracing::warn!("[events-service]: Token inválido o expirado: {}", e);
            
            let err = actix_web::error::ErrorUnauthorized("Token inválido o expirado");
            Err((err, req))
        }
    }
}
