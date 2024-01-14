mod model;
mod schema;

use actix_cors::Cors;
use actix_web::middleware::Logger;
use actix_web::{get, HttpResponse, Responder};
use actix_web::{web, App, HttpServer};
use dotenv::dotenv;
use env_logger;
use sqlx::mysql::{MySqlPool, MySqlPoolOptions};

use crate::model::VehicleModel;

#[get("/")]
async fn index() -> impl Responder {
    "Hello, World!"
}

#[get("/api/v1/mt/vehicles")]
async fn get_vehicles(data: web::Data<AppState>) -> impl Responder {
    let vehicles: Vec<VehicleModel> = sqlx::query_as!(
        VehicleModel,
        r#"select id, name, description from mt_vehicles mv;"#,
    )
    .fetch_all(&data.db)
    .await
    .unwrap();

    let json_response = serde_json::json!({
        "rows": vehicles.len(),
        "vehicles": vehicles
    });
    HttpResponse::Ok().json(json_response)
}

pub struct AppState {
    db: MySqlPool,
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let pool = match MySqlPoolOptions::new()
        .max_connections(10)
        .connect(&database_url)
        .await
    {
        Ok(pool) => {
            println!("✅Connection to the database is successful!");
            pool
        }
        Err(err) => {
            println!("🔥 Failed to connect to the database: {:?}", err);
            std::process::exit(1);
        }
    };

    println!("🚀 Server started successfully");

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(AppState { db: pool.clone() }))
            .wrap(
                Cors::default()
                    .allow_any_origin()
                    .allow_any_header()
                    .allow_any_method()
                    .supports_credentials(),
            )
            .wrap(Logger::default())
            .service(index)
            .service(get_vehicles)
    })
    .bind(("127.0.0.1", 3001))?
    .run()
    .await
}
