//search-service/src/search.rs
use crate::models::{Localization, ProductResult};
use crate::AppState;
use elasticsearch::SearchParts;
use serde_json::json;
use std::collections::HashMap;
use std::collections::HashSet;
use std::sync::Arc;

pub async fn fetch_most_similar(
    app_state: &Arc<AppState>,
    query: &str,
) -> Result<Vec<ProductResult>, Box<dyn std::error::Error + Send + Sync>> {
    let client = app_state.client.lock().await;
    let response = client
        .search(SearchParts::Index(&["products"]))
        .body(json!({
            "query": {
                "multi_match": {
                    "fields": ["full_name", "name", "description"],
                    "query": query,
                    "type": "phrase" // "phrase_prefix" changed in "phrase"
                }
            },
            "size": 10
        }))
        .send()
        .await?;
    parse_response(response).await
}

pub async fn fetch_lowest_price(
    app_state: &Arc<AppState>,
    query: &str,
    exclude_ids: &HashSet<String>,
) -> Result<Vec<ProductResult>, Box<dyn std::error::Error + Send + Sync>> {
    let client = app_state.client.lock().await;
    let response = client
        .search(SearchParts::Index(&["products"]))
        .body(json!({
            "query": {
                "multi_match": {
                    "fields": ["full_name", "name", "description"],
                    "query": query,
                    "type": "phrase" // "phrase_prefix" changed in "phrase"
                }
            },
            "size": 10,
            "sort": [{ "price": "asc" }]
        }))
        .send()
        .await?;
    let products = parse_response(response).await?;
    let unique_products: Vec<ProductResult> = products
        .into_iter()
        .filter(|product| !exclude_ids.contains(&product._id))
        .collect();
    Ok(unique_products)
}

pub async fn fetch_product_nearby(
    app_state: &Arc<AppState>,
    product: &str,
    latitude: f64,
    longitude: f64,
) -> Result<Vec<ProductResult>, Box<dyn std::error::Error + Send + Sync>> {
    let client = app_state.client.lock().await;
    let response = client
        .search(SearchParts::Index(&["products"]))
        .body(json!({
            "query": {
                "bool": {
                    "must": {
                        "multi_match": {
                            "query": product,
                            "fields": ["full_name", "name", "description"]
                        }
                    },
                    "filter": {
                        "geo_distance": {
                            "distance": "200km",
                            "location": {
                                "lat": latitude,
                                "lon": longitude
                            }
                        }
                    }
                }
            },
            "size": 1
        }))
        .send()
        .await?;
    parse_response(response).await
}

pub async fn fetch_product_in_shop(
    app_state: &Arc<AppState>,
    product: &str,
    shop: &str,
    latitude: f64,
    longitude: f64,
) -> Result<Vec<ProductResult>, Box<dyn std::error::Error + Send + Sync>> {
    let client = app_state.client.lock().await;
    let response = client
        .search(SearchParts::Index(&["products"]))
        .body(json!({
            "query": {
                "bool": {
                    "must": [
                        { "match": { "full_name": product } },
                        { "match": { "localization.grocery": shop } }
                    ],
                    "filter": {
                        "geo_distance": {
                            "distance": "200km",
                            "location": {
                                "lat": latitude,
                                "lon": longitude
                            }
                        }
                    }
                }
            },
            "size": 1
        }))
        .send()
        .await?;
    parse_response(response).await
}

/// Fetch prices for each product at nearby shops
pub async fn fetch_lowest_price_shops(
    app_state: &Arc<AppState>,
    products: &[String],
    latitude: f64,
    longitude: f64,
) -> Result<HashMap<String, Vec<ProductResult>>, Box<dyn std::error::Error + Send + Sync>> {
    let mut product_prices: HashMap<String, Vec<ProductResult>> = HashMap::new();
    let client = app_state.client.lock().await;

    for product in products.iter() {
        let response = client
            .search(SearchParts::Index(&["products"]))
            .body(json!({
                "query": {
                    "bool": {
                        "must": {
                            "multi_match": {
                                "query": product,
                                "fields": ["full_name", "name", "description"]
                            }
                        },
                        "filter": {
                            "geo_distance": {
                                "distance": "100km",
                                "location": {
                                    "lat": latitude,
                                    "lon": longitude
                                }
                            }
                        }
                    }
                },
                "size": 10,
                "sort": [{ "price": "asc" }]
            }))
            .send()
            .await?;

        let shop_products = parse_response(response).await?;
        product_prices.insert(product.clone(), shop_products);
    }
    Ok(product_prices)
}

// Helper function to parse Elasticsearch response into Vec<ProductResult>
async fn parse_response(
    response: elasticsearch::http::response::Response,
) -> Result<Vec<ProductResult>, Box<dyn std::error::Error + Send + Sync>> {
    let json_resp = response.json::<serde_json::Value>().await?;
    tracing::debug!("elasticsearch response: {:#?}", json_resp);
    let empty_vec = vec![];
    let hits = json_resp["hits"]["hits"].as_array().unwrap_or(&empty_vec);
    let products = hits
        .iter()
        .map(|hit| {
            let source = &hit["_source"];
            ProductResult {
                _id: hit["_id"].as_str().unwrap_or("").to_string(),
                full_name: source["full_name"].as_str().unwrap_or("").to_string(),
                // Fallback a `name_id` se `name` non è presente
                name: source
                .get("name")
                .and_then(|v| v.as_str())
                .unwrap_or_else(|| source.get("name_id").and_then(|v| v.as_str()).unwrap_or(""))
                .to_string(),
                description: source["description"].as_str().unwrap_or("").to_string(),
                price: source["price"].as_f64().unwrap_or(0.0),
                discount: source["discount"].as_f64(),
                distance: source["distance"].as_f64(),
                localization: Localization {
                    grocery: source["localization"]["grocery"]
                        .as_str()
                        .unwrap_or("")
                        .to_string(),
                    lat: source["localization"]["lat"].as_f64().unwrap_or(0.0),
                    lon: source["localization"]["lon"].as_f64().unwrap_or(0.0),
                },
            }
        })
        .collect();
    Ok(products)
}
