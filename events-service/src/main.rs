mod auth;
mod database;
mod models;
mod routes;
mod utils;

use actix_web::{middleware::Logger, web, App, HttpServer};
use actix_web_httpauth::middleware::HttpAuthentication;
use actix_cors::Cors; 
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
    
    // --- LECTURA DE FRONTEND_URLS ---
    // Si la variable FRONTEND_URLS no existe, el programa fallará
    let frontend_urls_str = env::var("FRONTEND_URLS")
        .expect("La variable de entorno FRONTEND_URLS debe estar definida.");
    
    let frontend_urls: Vec<String> = frontend_urls_str
        .split(',')
        .map(|s| s.trim().to_string())
        .collect();
        
    let frontend_urls_clone = frontend_urls.clone();
    // ---------------------------------

    tracing::info!("[events-service]: Servidor de Eventos escuchando en puerto {}", port);
    
    HttpServer::new(move || {
        //  CONFIGURAR CORS
        let mut cors = Cors::default();
        
        for url in &frontend_urls_clone {
            cors = cors.allowed_origin(url);
        }

        let cors = cors
            .allowed_methods(vec!["GET", "POST", "PUT", "DELETE", "OPTIONS"])
            .allowed_headers(vec![
                actix_web::http::header::AUTHORIZATION,
                actix_web::http::header::ACCEPT,
                actix_web::http::header::CONTENT_TYPE,
            ])
            .max_age(3600);

        App::new()
            .wrap(cors) 
            .wrap(Logger::new("%a - - [%t] \"%r\" %s %b \"%{Referer}i\" \"%{User-Agent}i\""))
            .app_data(web::Data::new(pool.clone()))
            
            // Rutas públicas
            .service(routes::home)
            .service(routes::listar_eventos)
            .service(routes::obtener_evento)
            
            // Rutas protegidas (admin)
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
