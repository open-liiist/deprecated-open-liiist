mod handlers;
mod models;
mod search;
mod utils;

use ::elasticsearch::Elasticsearch;
use axum::{
    routing::{get, post},
    Router,
};
use std::sync::Arc;
use tokio::sync::Mutex;

pub struct AppState {
    client: Mutex<Elasticsearch>,
    db_pool: sqlx::PgPool,
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_target(false)
        .with_level(true)
        .pretty()
        .init();

    // Initialize Elasticsearch client
    let transport =
        elasticsearch::http::transport::Transport::single_node("http://elasticsearch:9200")
            .unwrap();
    let database_url = std::env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgresql://user:postgrespw@db:5432/appdb".to_string());
    let db_pool = sqlx::PgPool::connect(&database_url)
        .await
        .expect("Failed to connect to database");
    let app_state = Arc::new(AppState {
        client: Mutex::new(Elasticsearch::new(transport)),
        db_pool,
    });

    // Configure Axum router with the search route, passing client as State
    let app = Router::new()
        .route("/search", get(handlers::search_handler))
        .route("/product/exists", post(handlers::check_product_exist))
        .route("/product/in-shop", post(handlers::search_product_in_shop))
        .route("/product/lowest-price", post(handlers::find_lowest_price))
        .route("/stores", get(handlers::get_all_stores))
        .route("/store/:id/products", get(handlers::get_products_by_store))
        .with_state(app_state);

    // Start server
    let port = std::env::var("SEARCH_SERVICE_PORT").unwrap_or_else(|_| "4001".to_string());
    let url = format!("0.0.0.0:{port}");
    let listener = tokio::net::TcpListener::bind(url).await.unwrap();
    println!("Search service started at port {}", port);
    axum::serve(listener, app).await.unwrap();
}
