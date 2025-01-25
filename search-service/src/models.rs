//search-service/src/models.rs
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Serialize, FromRow)]
pub struct StoreDB {
    pub id: i32,
    pub grocery: String,
    pub lat: f64,
    pub lng: f64,
    pub street: Option<String>,
    pub city: Option<String>,
    pub zip_code: Option<String>,
    pub working_hours: Option<String>,
    pub picks_up_in_store: Option<bool>,
}

#[derive(Serialize, FromRow)]
pub struct ProductDB {
    id: i32,
    name: String,
    description: String,
    current_price: f64,
    discount: f64,
    price_for_kg: Option<f64>,
    image_url: Option<String>,
}

/// Search query parameters
#[derive(Deserialize)]
pub struct SearchQuery {
    pub query: String,
}

/// Struct for each product result
#[derive(Debug, Serialize, Clone)]
pub struct ProductResult {
    pub _id: String,
    pub name: String,
    pub full_name: String,
    pub description: String,
    pub price: f64,
    pub discount: Option<f64>,
    pub localization: Localization,
    pub distance: Option<f64>,
}

/// Localization information for each product
#[derive(Debug, Serialize, Clone)]
pub struct Localization {
    pub grocery: String,
    pub lat: f64,
    pub lon: f64,
}

/// Struct to organize the final response
#[derive(Serialize)]
pub struct SearchResponse {
    pub most_similar: Vec<ProductResult>,
    pub lowest_price: Vec<ProductResult>,
}

#[derive(Deserialize)]
pub struct ProductExistRequest {
    pub product: String,
    pub position: Position,
}

#[derive(Deserialize)]
pub struct Position {
    pub latitude: f64,
    pub longitude: f64,
}

#[derive(Serialize)]
pub struct ProductExistResponse {
    pub product: String,
    pub exists: bool,
    pub details: Option<ProductResult>,
}

#[derive(Deserialize)]
pub struct ProductInShopRequest {
    pub product: String,
    pub shop: String,
    pub position: Position,
}

#[derive(Serialize)]
pub struct ProductInShopResponse {
    pub product: String,
    pub shop: String,
    pub exists: bool,
    pub details: Option<ProductResult>,
}

#[derive(Deserialize)]
pub struct ProductsLowestPriceRequest {
    pub products: Vec<String>,
    pub position: Position,
    pub mode: Option<String>,  // "risparmio" | "comodita" (o altro)
}

#[derive(Debug, Serialize, Clone)]
pub struct LowestPriceResponse {
    pub shop: String,               // Name of the shop
    pub total_price: f64,           // Total price for products from this shop
    pub products: Vec<ShopProduct>, // List of products purchased from this shop
}

#[derive(Debug, Serialize, Clone)]
pub struct ShopProduct {
    pub shop: String,          // Name of the shop
    pub name: String,          // Name of the product
    pub description: String,   // Product description
    pub price: f64,            // Price of the product
    pub discount: Option<f64>, // Discount on the product, if applicable
    pub distance: f64,         // Distance from user to shop
}