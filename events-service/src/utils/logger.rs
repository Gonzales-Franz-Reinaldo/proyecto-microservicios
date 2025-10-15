use tracing_subscriber::{
    fmt::{self, format::FmtSpan, time::FormatTime, format::Writer},
    layer::SubscriberExt,
    util::SubscriberInitExt,
    EnvFilter, Layer,
};
use tracing_appender::rolling::{RollingFileAppender, Rotation};
use std::env;

struct CustomTimeFormat;

impl FormatTime for CustomTimeFormat {
    fn format_time(&self, w: &mut Writer<'_>) -> std::fmt::Result {
        let now = chrono::Local::now();
        write!(w, "[{}]", now.format("%Y-%m-%d %H:%M:%S"))
    }
}

pub fn init_logger() {
    // Crear directorio de logs si no existe
    std::fs::create_dir_all("logs").expect("No se pudo crear directorio logs");

    // Nivel de log según ambiente
    let log_level = env::var("RUST_LOG")
        .unwrap_or_else(|_| {
            if env::var("NODE_ENV").unwrap_or_default() == "production" {
                "events_service=info,actix_web=warn,sqlx=warn".to_string()
            } else {
                "events_service=info,actix_web=info,sqlx=info".to_string()
            }
        });

    let env_filter = EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| EnvFilter::new(&log_level));

    // ========== LOGS EN CONSOLA ==========
    let console_layer = fmt::layer()
        .with_target(false)
        .with_thread_ids(false)
        .with_thread_names(false)
        .with_file(false)
        .with_line_number(false)
        .with_span_events(FmtSpan::NONE)
        .with_ansi(true) // Colores en consola
        .with_filter(env_filter.clone());

    // ========== LOGS EN ARCHIVO ==========
    let file_appender = RollingFileAppender::builder()
        .rotation(Rotation::DAILY)
        .filename_prefix("events-service")
        .filename_suffix("log")
        .max_log_files(14) // Mantener 14 días
        .build("logs")
        .expect("No se pudo crear file appender");

    // Filtro menos restrictivo para capturar TODOS los logs INFO
    let file_filter = EnvFilter::new("events_service=info,actix_web=info");

    let file_layer = fmt::layer()
        .with_writer(file_appender)
        .with_ansi(false) // Sin colores en archivo
        .with_target(false)
        .with_thread_ids(false)
        .with_file(false)
        .with_line_number(false)
        .with_level(true)
        .with_timer(CustomTimeFormat)
        .with_filter(file_filter);

    // ========== INICIALIZAR SUBSCRIBER ==========
    tracing_subscriber::registry()
        .with(console_layer)
        .with(file_layer)
        .init();

    tracing::info!("[events-service]: Logger inicializado correctamente");
}