use serde::{Deserialize, Serialize};

/// Search query parameters
#[derive(Deserialize)]
pub struct SearchQuery {
    pub query: String,
}

/// Struct for each product result
#[derive(Serialize, Clone)]
pub struct ProductResult {
    pub _id: String,
    pub name: String,
    pub full_name: String,
    pub description: String,
    pub price: f64,
    pub discount: Option<i32>,
    pub localization: Localization,
}


/// Localization information for each product
#[derive(Serialize, Clone)]
pub struct Localization {
    pub grocery: String,
    pub lat: f64,
    pub lng: f64,
}

/// Struct to organize the final response
#[derive(Serialize)]
pub struct SearchResponse {
    pub most_similar: Vec<ProductResult>,
    pub lowest_price: Vec<ProductResult>,
}
