use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize, sqlx::FromRow)]
pub struct VehicleModel {
    pub id: i32,
    pub name: String,
    pub description: Option<String>,
}
