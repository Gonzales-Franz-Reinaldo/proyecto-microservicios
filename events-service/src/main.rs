mod auth;
mod database;
mod models;
mod routes;
mod utils;

use actix_web::{middleware::Logger, web, App, HttpServer};
use actix_web_httpauth::middleware::HttpAuthentication;
use dotenvy::dotenv;
use std::env;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    
    utils::logger::init_logger();
    
    tracing::info!("[events-service]: Servidor de Eventos iniciando...");

    let port: u16 = env::var("PORT")
        .unwrap_or_else(|_| "3001".into())
        .parse()
        .unwrap_or(3001);

    let pool = database::init_db().await;
    
    let auth_mw = HttpAuthentication::bearer(auth::validator);

    tracing::info!("[events-service]: Servidor de Eventos escuchando en puerto {}", port);
    
    HttpServer::new(move || {
        App::new()
            .wrap(Logger::new("%a - - [%t] \"%r\" %s %b \"%{Referer}i\" \"%{User-Agent}i\""))
            .app_data(web::Data::new(pool.clone()))
            
            .service(routes::home)
            .service(routes::listar_eventos)
            .service(routes::obtener_evento)
            
            .service(
                web::scope("")
                    .wrap(auth_mw.clone())
                    .service(routes::crear_evento)
                    .service(routes::actualizar_evento)
                    .service(routes::eliminar_evento)
            )
            
            .default_service(web::to(|| async {
                tracing::warn!("[events-service]: Ruta no encontrada - 404");
                actix_web::HttpResponse::NotFound().json(serde_json::json!({
                    "error": "Ruta no encontrada",
                    "status": 404
                }))
            }))
    })
    .bind(("127.0.0.1", port))?
    .run()
    .await
}
