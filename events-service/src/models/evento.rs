use chrono::{NaiveDateTime, Utc};
use bigdecimal::BigDecimal;  
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use validator::Validate;

#[derive(FromRow, Serialize, Deserialize, Clone, Debug)]
pub struct Evento {
    pub id: i32,
    pub nombre: String,
    pub fecha: NaiveDateTime,
    pub lugar: String,
    pub capacidad: i32,
    #[serde(serialize_with = "serialize_bigdecimal")]  
    pub precio: BigDecimal,  
    pub creado_por: Option<String>,
    #[serde(skip_deserializing)]
    pub creado_en: Option<NaiveDateTime>,
}

//  Helper para serializar BigDecimal como número en JSON
fn serialize_bigdecimal<S>(decimal: &BigDecimal, serializer: S) -> Result<S::Ok, S::Error>
where
    S: serde::Serializer,
{
    use bigdecimal::ToPrimitive;
    serializer.serialize_f64(decimal.to_f64().unwrap_or(0.0))
}

#[derive(Deserialize, Validate, Debug)]
pub struct EventoInput {
    #[validate(length(min = 3, max = 255, message = "El nombre debe tener entre 3 y 255 caracteres"))]
    pub nombre: String,
    
    #[validate(custom(function = "validate_future_date", message = "La fecha debe ser futura"))]
    pub fecha: NaiveDateTime,
    
    #[validate(length(min = 3, max = 255, message = "El lugar debe tener entre 3 y 255 caracteres"))]
    pub lugar: String,
    
    #[validate(range(min = 1, message = "La capacidad debe ser mayor a 0"))]
    pub capacidad: i32,
    
    #[validate(range(min = 0.0, message = "El precio debe ser mayor o igual a 0"))]
    pub precio: f64,
}

fn validate_future_date(fecha: &NaiveDateTime) -> Result<(), validator::ValidationError> {
    let now = Utc::now().naive_utc();
    if *fecha <= now {
        return Err(validator::ValidationError::new("fecha_pasada"));
    }
    Ok(())
}

impl EventoInput {
    pub fn validate(&self) -> Result<(), validator::ValidationErrors> {
        Validate::validate(self)
    }
}
