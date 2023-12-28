use actix_cors::Cors;
use actix_web::{get, middleware::Logger, web, App, HttpServer, Responder};
use env_logger;

#[get("/")]
async fn index() -> impl Responder {
    "Hello, World!"
}

#[get("/{name}")]
async fn hello(name: web::Path<String>) -> impl Responder {
    format!("Hello {}!", &name)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    HttpServer::new(|| {
        App::new()
            .wrap(
                Cors::default()
                    .allow_any_origin()
                    .allow_any_header()
                    .allow_any_method()
                    .supports_credentials()
            )
            .wrap(Logger::default())
            .service(index)
            .service(hello)
    })
    .bind(("127.0.0.1", 3001))?
    .run()
    .await
}
