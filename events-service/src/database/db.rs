use sqlx::{mysql::MySqlPoolOptions, MySql, Pool};
use std::env; 

pub type MyPool = Pool<MySql>;

pub async fn init_db() -> MyPool {
    tracing::info!("[events-service]: Leyendo configuración de MySQL...");

    // 1. OBTENER VARIABLES DE ENTORNO
    let db_username = env::var("DB_USERNAME").expect("DB_USERNAME no configurado");
    let db_password = env::var("DB_PASSWORD").unwrap_or_default(); 
    let db_host = env::var("DB_HOST").expect("DB_HOST no configurado");
    let db_port = env::var("DB_PORT").expect("DB_PORT no configurado");
    let db_database = env::var("DB_DATABASE").expect("DB_DATABASE no configurado");

    // 2. CONSTRUIR LA URL DE CONEXIÓN
    let database_url = format!(
        "mysql://{user}:{password}@{host}:{port}/{database}",
        user = db_username,
        password = db_password, 
        host = db_host,
        port = db_port,
        database = db_database
    );
    
    tracing::info!("[events-service]: Conectando a MySQL...");

    // 3. CONECTAR USANDO LA URL CONSTRUIDA
    let pool = MySqlPoolOptions::new()
        .max_connections(10)
        .connect(&database_url) 
        .await
        .expect("No se pudo conectar a MySQL con la configuración proporcionada");

    // Log después de conectar exitosamente
    tracing::info!("[events-service]: Conectado a MySQL exitosamente");

    // Crear tabla si no existe
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS eventos (
            id INT PRIMARY KEY AUTO_INCREMENT,
            nombre VARCHAR(255) NOT NULL,
            fecha DATETIME NOT NULL,
            lugar VARCHAR(255) NOT NULL,
            capacidad INT NOT NULL CHECK (capacidad > 0),
            precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
            creado_por VARCHAR(255) NULL COMMENT 'ID del usuario que creó el evento',
            creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
            actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_fecha (fecha),
            INDEX idx_creado_por (creado_por)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        "#
    )
    .execute(&pool)
    .await
    .expect("No se pudo crear tabla eventos");

    pool
}