use crate::models::{Localization, ProductResult};
use crate::AppState;
use elasticsearch::SearchParts;
use serde_json::json;
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
                    "type": "phrase_prefix"
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
                    "type": "phrase_prefix"
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

// Helper function to parse Elasticsearch response into Vec<ProductResult>
async fn parse_response(
    response: elasticsearch::http::response::Response,
) -> Result<Vec<ProductResult>, Box<dyn std::error::Error + Send + Sync>> {
    let json_resp = response.json::<serde_json::Value>().await?;
    let empty_vec = vec![];
    let hits = json_resp["hits"]["hits"].as_array().unwrap_or(&empty_vec);
    let products = hits
        .iter()
        .map(|hit| {
            let source = &hit["_source"];
            ProductResult {
                _id: hit["_id"].as_str().unwrap_or("").to_string(),
                full_name: source["full_name"].as_str().unwrap_or("").to_string(),
                name: source["name"].as_str().unwrap_or("").to_string(),
                description: source["description"].as_str().unwrap_or("").to_string(),
                price: source["price"].as_f64().unwrap_or(0.0),
                discount: source["discount"].as_i64().map(|d| d as i32),
                localization: Localization {
                    grocery: source["localization"]["grocery"]
                        .as_str()
                        .unwrap_or("")
                        .to_string(),
                    lat: source["localization"]["lat"].as_f64().unwrap_or(0.0),
                    lng: source["localization"]["lng"].as_f64().unwrap_or(0.0),
                },
            }
        })
        .collect();
    Ok(products)
}
