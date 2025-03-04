// search-service/src/search.rs
use crate::models::{ProductResult, Position};
use crate::AppState;
use elasticsearch::SearchParts;
use serde_json::json;
use std::collections::HashMap;
use std::collections::HashSet;
use std::sync::Arc;
use crate::utils::sanitize;


// Fuzzy search (hybrid): "most similar"
pub async fn fetch_most_similar(
    app_state: &Arc<AppState>,
    query: &str,
) -> Result<Vec<ProductResult>, Box<dyn std::error::Error + Send + Sync>> {
    let client = app_state.client.lock().await;
    let response = client
        .search(SearchParts::Index(&["products"]))
        .body(json!({
            "_source": ["full_name", "name", "description", "current_price", "discount", "grocery", "lat", "lon"],
            "query": {
                "multi_match": {
                    "fields": ["full_name", "name", "name.keyword", "description"],
                    "query": query,
                    "type": "best_fields",
                    "fuzziness": "AUTO"
                }
            },
            "size": 10
        }))
        .send()
        .await?;
    parse_response(response).await
}

/// Executes a combined fuzzy search to obtain products with the lowest price,
/// excluding any already found IDs and applying a geo filter.
pub async fn fetch_lowest_price(
    app_state: &Arc<AppState>,
    query: &str,
    exclude_ids: &HashSet<String>,
    position: &Position,
) -> Result<Vec<ProductResult>, Box<dyn std::error::Error + Send + Sync>> {
    let client = app_state.client.lock().await;
    let response = client
        .search(SearchParts::Index(&["products"]))
        .body(json!({
            "_source": ["full_name", "name", "description", "current_price", "discount", "grocery", "lat", "lon"],
            "query": {
                "bool": {
                    "must": {
                        "multi_match": {
                            "fields": ["full_name", "name", "name.keyword", "description"],
                            "query": query,
                            "type": "best_fields",
                            "fuzziness": "AUTO"
                        }
                    },
                    "filter": {
                        "geo_distance": {
                            "distance": "200km",
                            "location": {
                                "lat": position.latitude,
                                "lon": position.longitude
                            }
                        }
                    }
                }
            },
            "size": 10,
            "sort": [{ "current_price": "asc" }]
        }))
        .send()
        .await?;
    let products = parse_response(response).await?;
    let unique_products: Vec<ProductResult> = products
        .into_iter()
        .filter(|p| !exclude_ids.contains(&p._id))
        .collect();
    Ok(unique_products)
}

/// Fetch a single product nearby based on location.
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
            "_source": ["full_name", "name", "description", "current_price", "discount", "grocery", "lat", "lon"],
            "query": {
                "bool": {
                    "must": {
                        "multi_match": {
                            "query": product,
                            "fields": ["full_name", "name", "description"],
                            "type": "best_fields",
                            "fuzziness": "AUTO"
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

/// Fetch a single product in a specific shop based on location.
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
            "_source": ["full_name", "name", "description", "current_price", "discount", "grocery", "lat", "lon"],
            "query": {
                "bool": {
                    "must": [
                        { 
                            "term": { 
                                "name.keyword": { 
                                    "value": product 
                                } 
                            } 
                        },
                        { 
                            "term": { 
                                "grocery.keyword": { 
                                    "value": shop 
                                } 
                            } 
                        }
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

/// Executes a query to obtain products using the hybrid query built by `build_product_query`
pub async fn fetch_lowest_price_shops(
    app_state: &Arc<AppState>,
    products: &[String],
    position: &Position,
) -> Result<HashMap<String, Vec<ProductResult>>, Box<dyn std::error::Error + Send + Sync>> {
    let mut product_prices: HashMap<String, Vec<ProductResult>> = HashMap::new();
    let client = app_state.client.lock().await;

    for product in products.iter() {
        let es_query = build_product_query(product, position);
        let response = client
            .search(SearchParts::Index(&["products"]))
            .body(es_query)
            .send()
            .await?;
        // let shop_products = parse_response(response).await?;
        // product_prices.insert(product.clone(), shop_products);

        // Filters results to include only those that, after sanitization, exactly match the input
        let shop_products: Vec<ProductResult> = parse_response(response).await?
            .into_iter()
            //.filter(|pr| sanitize(&pr.name) == sanitize(product))
            .filter(|pr| sanitize(&pr.name).contains(&sanitize(product))) // Accept as match if the sanitized product name contains the sanitized input term
            .collect();
        product_prices.insert(product.clone(), shop_products);
    }
    Ok(product_prices)
}


/// Converts the Elasticsearch response into a vector of `ProductResult`
pub async fn parse_response(
    response: elasticsearch::http::response::Response,
) -> Result<Vec<ProductResult>, Box<dyn std::error::Error + Send + Sync>> {
    let json_resp = response.json::<serde_json::Value>().await?;
    tracing::debug!("Elasticsearch response: {:#?}", json_resp);
    let empty_vec = vec![];
    let hits = json_resp["hits"]["hits"].as_array().unwrap_or(&empty_vec);
    let products = hits.iter().map(|hit| {
        let source = &hit["_source"];
        ProductResult {
            _id: hit["_id"].as_str().unwrap_or("").to_string(),
            full_name: source["full_name"].as_str().unwrap_or("").to_string(),
            name: source["name"].as_str().unwrap_or("").to_string(),
            description: source["description"].as_str().unwrap_or("").to_string(),
            price: source["current_price"].as_f64().unwrap_or(0.0),
            discount: source.get("discount").and_then(|d| d.as_f64()),
            distance: None,
            localization: crate::models::Localization {
                grocery: source["grocery"].as_str().unwrap_or("").to_string(),
                lat: source["lat"].as_f64().unwrap_or(0.0),
                lon: source["lon"].as_f64().unwrap_or(0.0),
            },
        }
    }).collect();
    Ok(products)
}

pub fn build_product_query(product_input: &str, position: &Position) -> serde_json::Value {
    json!({
        "query": {
            "bool": {
                "should": [
                    {
                        "term": {
                            "name.keyword": {
                                "value": sanitize(product_input),
                                "boost": 5.0
                            }
                        }
                    },
                    {
                        "multi_match": {
                            "query": product_input,
                            "type": "phrase_prefix",
                            "fields": ["full_name^3", "name", "description"]
                        }
                    },
                    {
                        "multi_match": {
                            "query": product_input,
                            "fields": ["full_name^3", "name", "description"],
                            "fuzziness": "AUTO"
                        }
                    }
                ],
                "minimum_should_match": 1,
                "filter": {
                    "geo_distance": {
                        "distance": "100km",
                        "location": {
                            "lat": position.latitude,
                            "lon": position.longitude
                        }
                    }
                }
            }
        }
    })
}
