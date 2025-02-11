// search-service/src/search.rs

use crate::models::{Localization, ProductResult, Position};
use crate::AppState;
use crate::utils::sanitize;
use elasticsearch::SearchParts;
use serde_json::json;
use std::collections::HashMap;
use std::collections::HashSet;
use std::sync::Arc;

/// Fetch the most similar products based on the query.
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

/// Fetch the lowest priced products excluding certain IDs.
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
                        "geo_distance": { // Aggiungi un filtro di distanza se necessario
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
            "sort": [{ "current_price": "asc" }] // Assicurati che "current_price" sia il campo corretto
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

/// Fetch prices for each product at nearby shops.
// pub async fn fetch_lowest_price_shops(
//     app_state: &Arc<AppState>,
//     products: &[String],
//     // latitude: f64,
//     // longitude: f64,
//     position: &Position, // Usa la posizione invece di latitudine e longitudine
// ) -> Result<HashMap<String, Vec<ProductResult>>, Box<dyn std::error::Error + Send + Sync>> {
//     let mut product_prices: HashMap<String, Vec<ProductResult>> = HashMap::new();
//     let client = app_state.client.lock().await;

//     for product in products.iter() {
//         let response = client
//             .search(SearchParts::Index(&["products"]))
//             .body(json!({
//                 "_source": ["full_name", "name", "description", "current_price", "discount", "grocery", "lat", "lon"],
//                 "query": {
//                     "bool": {
//                         "must": {
//                             "term": { "name.keyword": product }
//                         },
//                         "filter": {
//                             "geo_distance": {
//                                 "distance": "100km",
//                                 "location": {
//                                     "lat": position.latitude,
//                                     "lon": position.longitude
//                                 }
//                             }
//                         }
//                     }
//                 },
//                 "size": 10,
//                 "sort": [{ "current_price": "asc" }] // Assicurati che "current_price" sia il campo corretto
//             }))
//             .send()
//             .await?;

//         let shop_products = parse_response(response).await?;
//         product_prices.insert(product.clone(), shop_products);
//     }
//     Ok(product_prices)
// }

pub async fn fetch_lowest_price_shops(
    app_state: &Arc<AppState>,
    products: &[String],
    position: &Position,
) -> Result<HashMap<String, Vec<ProductResult>>, Box<dyn std::error::Error + Send + Sync>> {
    let mut product_prices: HashMap<String, Vec<ProductResult>> = HashMap::new();
    let client = app_state.client.lock().await;

    for product in products.iter() {
        // Costruiamo la query ibrida per il prodotto corrente
        let es_query = build_product_query(product, position);

        let response = client
            .search(SearchParts::Index(&["products"]))
            .body(es_query)
            .send()
            .await?;
        
        let shop_products = parse_response(response).await?;
        product_prices.insert(product.clone(), shop_products);
    }
    Ok(product_prices)
}



/// Parse the Elasticsearch response into a vector of `ProductResult`.
pub async fn parse_response(
    response: elasticsearch::http::response::Response,
) -> Result<Vec<ProductResult>, Box<dyn std::error::Error + Send + Sync>> {
    let json_resp = response.json::<serde_json::Value>().await?;
    tracing::debug!("Elasticsearch response: {:#?}", json_resp);
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
                price: source["current_price"].as_f64().unwrap_or(0.0),
                discount: source.get("discount").and_then(|d| d.as_f64()),
                distance: None,  // Lascia vuoto, calcola nel handler
                localization: Localization {
                    grocery: source["grocery"].as_str().unwrap_or("").to_string(),
                    lat: source["lat"].as_f64().unwrap_or(0.0),
                    lon: source["lon"].as_f64().unwrap_or(0.0),
                },
            }
        })
        .collect();
    Ok(products)
}

/// Costruisce una query ibrida per cercare un prodotto.
/// Combina una term query esatta (sul campo non analizzato) con una multi_match fuzzy sui campi testuali.
/// Integra inoltre un filtro geo per limitare i risultati alla posizione dell'utente.
pub fn build_product_query(product_input: &str, position: &Position) -> serde_json::Value {
    // Sanitizziamo l'input per ottenere la forma canonicizzata (per il match esatto)
    let sanitized = crate::utils::sanitize(product_input);
    
    json!({
        "query": {
            "bool": {
                "should": [
                    { "term": { "name.keyword": sanitized } },
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
