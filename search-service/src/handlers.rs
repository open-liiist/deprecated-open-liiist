// search-service/src/handlers.rs

use crate::models::{
    LowestPriceResponse, ProductDB, ProductExistRequest, ProductExistResponse,
    ProductInShopRequest, ProductInShopResponse, ProductResult, ProductsLowestPriceRequest,
    SearchQuery, SearchResponse, ShopProduct, StoreDB, Position,
};
use crate::search::{
    fetch_lowest_price, fetch_lowest_price_shops, fetch_most_similar, fetch_product_in_shop,
    fetch_product_nearby,
};
use crate::utils::{haversine_distance, sanitize};
use crate::AppState;
use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use serde_json::{Value, json};
use std::collections::{HashMap, HashSet};
use std::sync::Arc;

/// Handler per la ricerca dei prodotti: Modalità Standard
pub async fn search_handler(
    State(app_state): State<Arc<AppState>>,
    Query(params): Query<SearchQuery>,
) -> Result<impl IntoResponse, (StatusCode, Json<Value>)> {
    tracing::info!("Received search query: {:?}", params);
    let position = Position {
        latitude: params.position_latitude,
        longitude: params.position_longitude,
    };
    tracing::info!("Constructed position: {:?}", position);
    
    // 1. Fetch most similar products
    let most_similar_result = fetch_most_similar(&app_state, &params.query).await;
    let mut most_similar = match most_similar_result {
        Ok(products) => products,
        Err(e) => {
            tracing::error!("Error fetching most similar products: {:?}", e);
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "error": "Internal server error" })),
            ));
        }
    };

    // 2. Exclude IDs from lowest price search
    let exclude_ids: HashSet<String> = most_similar
        .iter()
        .map(|product| product._id.clone())
        .collect();

    // 3. Fetch lowest price products
    let mut lowest_price = match fetch_lowest_price(&app_state, &params.query, &exclude_ids, &position).await {
        Ok(products) => products,
        Err(e) => {
            tracing::error!("Error fetching lowest price products: {:?}", e);
            vec![] // Continua anche in caso di errore
        }
    };

    // 4. If no lowest price, take the cheapest from most_similar
    if lowest_price.is_empty() && most_similar.len() > 1 {
        if let Some((index, min_product)) = most_similar
            .iter()
            .enumerate()
            .min_by(|(_, a), (_, b)| a.price.partial_cmp(&b.price).unwrap_or(std::cmp::Ordering::Equal))
        {
            lowest_price.push(min_product.clone());
            most_similar.remove(index);
        }
    }

    // 5. Calcola la distanza per i prodotti in most_similar
    for product in &mut most_similar {
        product.distance = Some(haversine_distance(
            position.latitude,
            position.longitude,
            product.localization.lat,
            product.localization.lon,
        ));
    }

    // 6. Calcola la distanza per i prodotti in lowest_price
    for product in &mut lowest_price {
        product.distance = Some(haversine_distance(
            position.latitude,
            position.longitude,
            product.localization.lat,
            product.localization.lon,
        ));
    }

    // 7. Costruisci la risposta
    Ok((
        StatusCode::OK,
        Json(SearchResponse {
            most_similar,
            lowest_price,
        }),
    ))
}

pub async fn check_product_exist(
    State(app_state): State<Arc<AppState>>,
    Json(payload): Json<ProductExistRequest>,
) -> Result<Json<ProductExistResponse>, (StatusCode, Json<Value>)> {
    let products = match fetch_product_nearby(
        &app_state,
        &payload.product,
        payload.position.latitude,
        payload.position.longitude,
    )
    .await {
        Ok(products) => products,
        Err(e) => {
            tracing::error!("Error fetching product: {:?}", e);
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "error": "Internal server error" })),
            ));
        }
    };

    tracing::info!("Found products: {:#?}", products);
    if let Some(product) = products.first() {
        let distance = haversine_distance(
            payload.position.latitude,
            payload.position.longitude,
            product.localization.lat,
            product.localization.lon,
        );
        Ok(Json(ProductExistResponse {
            product: payload.product.clone(),
            exists: true,
            details: Some(ProductResult {
                distance: Some(distance),
                ..product.clone()
            }),
        }))
    } else {
        Ok(Json(ProductExistResponse {
            product: payload.product.clone(),
            exists: false,
            details: None,
        }))
    }
}

pub async fn search_product_in_shop(
    State(app_state): State<Arc<AppState>>,
    Json(payload): Json<ProductInShopRequest>,
) -> Result<Json<ProductInShopResponse>, (StatusCode, Json<Value>)> {
    let products = match fetch_product_in_shop(
        &app_state,
        &payload.product,
        &payload.shop,
        payload.position.latitude,
        payload.position.longitude,
    )
    .await {
        Ok(products) => products,
        Err(e) => {
            tracing::error!("Error fetching product: {:?}", e);
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "error": "Internal server error" })),
            ));
        }
    };

    tracing::info!("Found products: {:#?}", products);
    if let Some(product) = products.first() {
        let distance = haversine_distance(
            payload.position.latitude,
            payload.position.longitude,
            product.localization.lat,
            product.localization.lon,
        );
        Ok(Json(ProductInShopResponse {
            product: payload.product.clone(),
            shop: payload.shop.clone(),
            exists: true,
            details: Some(ProductResult {
                distance: Some(distance),
                ..product.clone()
            }),
        }))
    } else {
        Ok(Json(ProductInShopResponse {
            product: payload.product.clone(),
            shop: payload.shop.clone(),
            exists: false,
            details: None,
        }))
    }
}

/// Handler per trovare il negozio con i prezzi più bassi (Modalità Comodità e Risparmio)
pub async fn find_lowest_price(
    State(app_state): State<Arc<AppState>>,
    Json(payload): Json<ProductsLowestPriceRequest>,
) -> Result<Json<Vec<LowestPriceResponse>>, (StatusCode, Json<serde_json::Value>)> {
    tracing::info!("find_lowest_price called with payload: {:?}", payload);

    // 1) Interroga Elasticsearch per recuperare i negozi che offrono (almeno alcuni) dei prodotti richiesti
    let product_prices = match fetch_lowest_price_shops(
        &app_state,
        &payload.products,
        &payload.position, // Passa il riferimento a Position
    )
    .await {
        Ok(prices) => {
            tracing::info!("Fetched product prices from Elasticsearch successfully.");
            prices
        },
        Err(e) => {
            tracing::error!("Error fetching products from Elasticsearch: {:?}", e);
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "error": "Internal server error" })),
            ));
        }
    };

    tracing::debug!("Product prices fetched: {:?}", product_prices);

    // 2) Costruiamo una mappa "nome_negozio -> elenco di ShopProduct"
    let mut shop_combinations: HashMap<String, Vec<ShopProduct>> = HashMap::new();

    for (_product_name, product_list) in &product_prices {
        for product_result in product_list {
            let distance = haversine_distance(
                payload.position.latitude,
                payload.position.longitude,
                product_result.localization.lat,
                product_result.localization.lon,
            );
            shop_combinations
                .entry(product_result.localization.grocery.clone())
                .or_insert_with(Vec::new)
                .push(ShopProduct {
                    shop: product_result.localization.grocery.clone(),
                    name: product_result.name.clone(),
                    description: product_result.description.clone(),
                    discount: product_result.discount,
                    price: product_result.price,
                    distance,
                });
            tracing::debug!(
                "Added ShopProduct to '{}': {:?}",
                product_result.localization.grocery,
                shop_combinations[&product_result.localization.grocery].last()
            );
        }
    }

    tracing::info!("Shop combinations built: {:?}", shop_combinations);

    // 3) Decidiamo la modalità: "risparmio" o "comodita" (default?)
    let mode = payload.mode.as_deref().unwrap_or("comodita");
    tracing::info!("Mode selected: {}", mode);

    // Normalizziamo i nomi dei prodotti richiesti dall'utente
    let required_names: HashSet<String> = payload
        .products
        .iter()
        .map(|p| sanitize(p))
        .collect();
    let required_count = required_names.len();
    tracing::debug!("Required products (sanitized): {:?} (count: {})", required_names, required_count);

    let mut results: Vec<LowestPriceResponse> = Vec::new();

    match mode {
        "risparmio" => {
            tracing::info!("Processing in 'risparmio' mode.");
            // (A) Verifichiamo se esiste un singolo shop che copre tutti i prodotti
            let mut best_single: Option<LowestPriceResponse> = None;
            for (shop_name, products_in_shop) in &shop_combinations {
                let found_names: HashSet<String> = products_in_shop
                    .iter()
                    .map(|sp| sanitize(&sp.name))
                    .collect();
                let match_count = required_names.iter()
                    .filter(|needed| found_names.contains(*needed))
                    .count();
                tracing::debug!(
                    "Shop '{}': match_count = {} (required: {})",
                    shop_name,
                    match_count,
                    required_count
                );
                if match_count == required_count {
                    let total_price: f64 = products_in_shop.iter().map(|p| p.price).sum();
                    tracing::info!("Shop '{}' has all required products with total price: {}", shop_name, total_price);
                    if let Some(ref mut current_best) = best_single {
                        if total_price < current_best.total_price {
                            tracing::debug!("Found a better single shop: '{}' (previous best: {})", shop_name, current_best.shop);
                            current_best.total_price = total_price;
                            current_best.products = products_in_shop.clone();
                            current_best.shop = shop_name.clone();
                        }
                    } else {
                        best_single = Some(LowestPriceResponse {
                            shop: shop_name.clone(),
                            total_price,
                            products: products_in_shop.clone(),
                        });
                        tracing::debug!("Set initial best_single to '{}'", shop_name);
                    }
                }
            }

            // (B) Verifichiamo combinazioni di due negozi
            let shop_names: Vec<String> = shop_combinations.keys().cloned().collect();
            let mut best_pair: Option<LowestPriceResponse> = None;
            for i in 0..shop_names.len() {
                for j in (i+1)..shop_names.len() {
                    let shop1 = &shop_names[i];
                    let shop2 = &shop_names[j];
                    tracing::debug!("Checking shop pair: '{}' + '{}'", shop1, shop2);
                    let mut combined_products = shop_combinations[shop1].clone();
                    combined_products.extend(shop_combinations[shop2].clone());
                    let found_names: HashSet<String> = combined_products
                        .iter()
                        .map(|sp| sanitize(&sp.name))
                        .collect();
                    let match_count = required_names.iter()
                        .filter(|needed| found_names.contains(*needed))
                        .count();
                    tracing::debug!("Shop pair '{} + {}': match_count = {} (required: {})", shop1, shop2, match_count, required_count);
                    if match_count == required_count {
                        let total_price: f64 = combined_products.iter().map(|p| p.price).sum();
                        tracing::info!("Shop pair '{} + {}' covers all products with total price: {}", shop1, shop2, total_price);
                        if let Some(ref mut current_best) = best_pair {
                            if total_price < current_best.total_price {
                                tracing::debug!("Found a better shop pair: '{}' + '{}' (previous best: {})", shop1, shop2, current_best.shop);
                                current_best.total_price = total_price;
                                current_best.products = combined_products.clone();
                                current_best.shop = format!("{} + {}", shop1, shop2);
                            }
                        } else {
                            best_pair = Some(LowestPriceResponse {
                                shop: format!("{} + {}", shop1, shop2),
                                total_price,
                                products: combined_products,
                            });
                            tracing::debug!("Set initial best_pair to '{} + {}'", shop1, shop2);
                        }
                    }
                }
            }

            // (C) Confronta singolo shop vs. combinazione di due negozi
            match (best_single, best_pair) {
                (Some(s), Some(p)) => {
                    tracing::info!("Comparing best_single (shop: '{}', total_price: {}) vs best_pair (shops: '{}', total_price: {})", s.shop, s.total_price, p.shop, p.total_price);
                    if s.total_price <= p.total_price {
                        tracing::info!("Selected best_single: '{}'", s.shop);
                        results.push(s);
                    } else {
                        tracing::info!("Selected best_pair: '{}'", p.shop);
                        results.push(p);
                    }
                }
                (Some(s), None) => {
                    tracing::info!("Only best_single available: '{}'", s.shop);
                    results.push(s);
                }
                (None, Some(p)) => {
                    tracing::info!("Only best_pair available: '{}'", p.shop);
                    results.push(p);
                }
                (None, None) => {
                    tracing::warn!("No single shop or shop pair covers all required products.");
                }
            }
        }

        "comodita" => {
            tracing::info!("Processing in 'comodita' mode.");
            let mut best_option: Option<LowestPriceResponse> = None;
            for (shop_name, products_in_shop) in &shop_combinations {
                let found_names: HashSet<String> = products_in_shop
                    .iter()
                    .map(|sp| sanitize(&sp.name))
                    .collect();
                let match_count = required_names.iter()
                    .filter(|needed| found_names.contains(*needed))
                    .count();
                tracing::debug!("Shop '{}': match_count = {} (required: {})", shop_name, match_count, required_count);
                if match_count == required_count {
                    let total_price: f64 = products_in_shop.iter().map(|p| p.price).sum();
                    tracing::info!("Shop '{}' has all required products with total price: {}", shop_name, total_price);
                    if let Some(ref mut current_best) = best_option {
                        if total_price < current_best.total_price {
                            tracing::debug!("Found a better 'comodita' option: '{}' (previous best: {})", shop_name, current_best.shop);
                            current_best.total_price = total_price;
                            current_best.products = products_in_shop.clone();
                            current_best.shop = shop_name.clone();
                        }
                    } else {
                        best_option = Some(LowestPriceResponse {
                            shop: shop_name.clone(),
                            total_price,
                            products: products_in_shop.clone(),
                        });
                        tracing::debug!("Set initial best_option to '{}'", shop_name);
                    }
                }
            }
            if let Some(best) = best_option {
                tracing::info!("Selected best 'comodita' option: '{}'", best.shop);
                results.push(best);
            } else {
                tracing::warn!("No single shop covers all required products in 'comodita' mode.");
            }
        }

        _ => {
            tracing::warn!("Unknown mode '{}' received. Defaulting to 'comodita'.", mode);
        }
    }

    if results.is_empty() {
        tracing::info!("No valid shop combinations found to cover all products.");
    } else {
        tracing::info!("Returning results: {:?}", results);
    }

    Ok(Json(results))
}

pub async fn get_all_stores(
    State(app_state): State<Arc<AppState>>,
) -> Result<Json<Vec<StoreDB>>, axum::http::StatusCode> {
    let db_pool = &app_state.db_pool;
    let stores = sqlx::query_as::<_, StoreDB>(
        r#"
        SELECT
            id, grocery, lat, lng, street, city, zip_code,
            working_hours, picks_up_in_store
        FROM "Localization"
        "#
    )
    .fetch_all(db_pool)
    .await
    .map_err(|e| {
        eprintln!("Database query failed: {:?}", e);
        axum::http::StatusCode::INTERNAL_SERVER_ERROR
    })?;
    Ok(Json(stores))
}

pub async fn get_products_by_store(
    Path(store_id): Path<i32>,
    State(app_state): State<Arc<AppState>>,
) -> Result<Json<Vec<ProductDB>>, axum::http::StatusCode> {
    let db_pool = &app_state.db_pool;
    let products = sqlx::query_as::<_, ProductDB>(
        r#"
        SELECT
            p.id, p.name, p.description, p.current_price,
            p.discount, p.price_for_kg, p.image_url
        FROM "Product" p
        WHERE p."localizationId" = $1
        "#
    )
    .bind(store_id)
    .fetch_all(db_pool)
    .await
    .map_err(|e| {
        eprintln!("Database query failed: {:?}", e);
        axum::http::StatusCode::INTERNAL_SERVER_ERROR
    })?;
    Ok(Json(products))
}

// // search-service/src/handlers.rs

// use crate::models::{
//     LowestPriceResponse, ProductDB, ProductExistRequest, ProductExistResponse,
//     ProductInShopRequest, ProductInShopResponse, ProductResult, ProductsLowestPriceRequest,
//     SearchQuery, SearchResponse, ShopProduct, StoreDB, Position,
// };
// use crate::search::{
//     fetch_lowest_price, fetch_lowest_price_shops, fetch_most_similar, fetch_product_in_shop,
//     fetch_product_nearby,
// };
// use crate::utils::haversine_distance;
// use crate::AppState;
// use axum::{
//     extract::{Path, Query, State},
//     http::StatusCode,
//     response::IntoResponse,
//     Json,
// };
// use serde_json::{Value, json};
// use std::collections::HashMap;
// use std::collections::HashSet;
// use std::sync::Arc;


// /// Handler per la ricerca dei prodotti: Modalità Standard
// pub async fn search_handler(
//     State(app_state): State<Arc<AppState>>,
//     Query(params): Query<SearchQuery>,
// ) -> Result<impl IntoResponse, (StatusCode, Json<Value>)> {
//     tracing::info!("Received search query: {:?}", params);
//     let position = Position {
//         latitude: params.position_latitude,
//         longitude: params.position_longitude,
//     };
//     tracing::info!("Constructed position: {:?}", position);
    
//     // 1. Fetch most similar products
//     let most_similar_result = fetch_most_similar(&app_state, &params.query).await;
//     let mut most_similar = match most_similar_result {
//         Ok(products) => products,
//         Err(e) => {
//             tracing::error!("Error fetching most similar products: {:?}", e);
//             return Err((
//                 StatusCode::INTERNAL_SERVER_ERROR,
//                 Json(json!({ "error": "Internal server error" })),
//             ));
//         }
//     };

//     // 2. Exclude IDs from lowest price search
//     let exclude_ids: HashSet<String> = most_similar
//         .iter()
//         .map(|product| product._id.clone())
//         .collect();

//     // 3. Fetch lowest price products
//     let mut lowest_price = match fetch_lowest_price(&app_state, &params.query, &exclude_ids, &position).await {
//         Ok(products) => products,
//         Err(e) => {
//             tracing::error!("Error fetching lowest price products: {:?}", e);
//             vec![] // Continua anche in caso di errore
//         }
//     };

//     // 4. If no lowest price, take the cheapest from most_similar
//     if lowest_price.is_empty() {
//         if most_similar.len() > 1 {
//             if let Some((index, min_product)) =
//                 most_similar.iter().enumerate().min_by(|(_, a), (_, b)| {
//                     a.price
//                         .partial_cmp(&b.price)
//                         .unwrap_or(std::cmp::Ordering::Equal)
//                 })
//             {
//                 lowest_price.push(min_product.clone());
//                 most_similar.remove(index);
//             }
//         }
//     }

//     // 5. Calcola la distanza per i prodotti in most_similar
//     //let most_similar_position = &params.position;
//     for product in &mut most_similar {
//         product.distance = Some(haversine_distance(
//             position.latitude,
//             position.longitude,
//             product.localization.lat,
//             product.localization.lon,
//         ));
//     }

//     // 6. Calcola la distanza per i prodotti in lowest_price
//     //let lowest_price_position = &params.position;
//     for product in &mut lowest_price {
//         product.distance = Some(haversine_distance(
//             position.latitude,
//             position.longitude,
//             product.localization.lat,
//             product.localization.lon,
//         ));
//     }

//     // 7. Costruisci la risposta
//     Ok((
//         StatusCode::OK,
//         Json(SearchResponse {
//             most_similar,
//             lowest_price,
//         }),
//     ))
// }

// pub async fn check_product_exist(
//     State(app_state): State<Arc<AppState>>,
//     Json(payload): Json<ProductExistRequest>,
// ) -> Result<Json<ProductExistResponse>, (StatusCode, Json<Value>)> {
//     let products = match fetch_product_nearby(
//         &app_state,
//         &payload.product,
//         payload.position.latitude,
//         payload.position.longitude,
//     )
//     .await
//     {
//         Ok(products) => products,
//         Err(e) => {
//             tracing::error!("Error fetching product: {:?}", e);
//             return Err((
//                 StatusCode::INTERNAL_SERVER_ERROR,
//                 Json(json!({ "error": "Internal server error" })),
//             ));
//         }
//     };

//     tracing::info!("Found products: {:#?}", products);
//     if let Some(product) = products.first() {
//         let distance = haversine_distance(
//             payload.position.latitude,
//             payload.position.longitude,
//             product.localization.lat,
//             product.localization.lon,
//         );
//         Ok(Json(ProductExistResponse {
//             product: payload.product.clone(),
//             exists: true,
//             details: Some(ProductResult {
//                 distance: Some(distance),
//                 ..product.clone()
//             }),
//         }))
//     } else {
//         Ok(Json(ProductExistResponse {
//             product: payload.product.clone(),
//             exists: false,
//             details: None,
//         }))
//     }
// }

// pub async fn search_product_in_shop(
//     State(app_state): State<Arc<AppState>>,
//     Json(payload): Json<ProductInShopRequest>,
// ) -> Result<Json<ProductInShopResponse>, (StatusCode, Json<Value>)> {
//     let products = match fetch_product_in_shop(
//         &app_state,
//         &payload.product,
//         &payload.shop,
//         payload.position.latitude,
//         payload.position.longitude,
//     )
//     .await
//     {
//         Ok(products) => products,
//         Err(e) => {
//             tracing::error!("Error fetching product: {:?}", e);
//             return Err((
//                 StatusCode::INTERNAL_SERVER_ERROR,
//                 Json(json!({ "error": "Internal server error" })),
//             ));
//         }
//     };

//     tracing::info!("Found products: {:#?}", products);
//     if let Some(product) = products.first() {
//         let distance = haversine_distance(
//             payload.position.latitude,
//             payload.position.longitude,
//             product.localization.lat,
//             product.localization.lon,
//         );
//         Ok(Json(ProductInShopResponse {
//             product: payload.product.clone(),
//             shop: payload.shop.clone(),
//             exists: true,
//             details: Some(ProductResult {
//                 distance: Some(distance),
//                 ..product.clone()
//             }),
//         }))
//     } else {
//         Ok(Json(ProductInShopResponse {
//             product: payload.product.clone(),
//             shop: payload.shop.clone(),
//             exists: false,
//             details: None,
//         }))
//     }
// }

// /// Handler per trovare il negozio con i prezzi più bassi (Modalità Comodità e Risparmio)
// pub async fn find_lowest_price(
//     State(app_state): State<Arc<AppState>>,
//     Json(payload): Json<ProductsLowestPriceRequest>,
// ) -> Result<Json<Vec<LowestPriceResponse>>, (StatusCode, Json<serde_json::Value>)> {
//     tracing::info!("find_lowest_price called with payload: {:?}", payload);

//     // 1) Interroga Elasticsearch per recuperare i negozi che offrono (almeno alcuni) dei prodotti richiesti
//     let product_prices = match fetch_lowest_price_shops(
//         &app_state,
//         &payload.products,
//         // payload.position.latitude,
//         // payload.position.longitude
//         &payload.position, // Passa il riferimento a Position
//     )
//     .await
//     {
//         Ok(prices) => {
//             tracing::info!("Fetched product prices from Elasticsearch successfully.");
//             prices
//         },
//         Err(e) => {
//             tracing::error!("Error fetching products from Elasticsearch: {:?}", e);
//             return Err((
//                 StatusCode::INTERNAL_SERVER_ERROR,
//                 Json(json!({ "error": "Internal server error" })),
//             ));
//         }
//     };

//     tracing::debug!("Product prices fetched: {:?}", product_prices);

//     // 2) Costruiamo una mappa "nome_negozio -> elenco di ShopProduct"
//     let mut shop_combinations: HashMap<String, Vec<ShopProduct>> = HashMap::new();

//     // product_prices: HashMap<String, Vec<ProductResult>>
//     // Dove la chiave è il nome del prodotto e il valore è un vettore di ProductResult contenenti info su shop e prezzo
//     for (product_name, product_list) in &product_prices {
//         tracing::debug!("Processing product: {}", product_name);
//         for product_result in product_list {
//             let distance = haversine_distance(
//                 payload.position.latitude,
//                 payload.position.longitude,
//                 product_result.localization.lat,
//                 product_result.localization.lon,
//             );
//             shop_combinations
//                 .entry(product_result.localization.grocery.clone())
//                 .or_insert_with(Vec::new)
//                 .push(ShopProduct {
//                     shop: product_result.localization.grocery.clone(),
//                     name: product_result.name.clone(),
//                     description: product_result.description.clone(),
//                     discount: product_result.discount,
//                     price: product_result.price,
//                     distance,
//                 });
//             tracing::debug!(
//                 "Added ShopProduct to '{}': {:?}",
//                 product_result.localization.grocery,
//                 shop_combinations[&product_result.localization.grocery].last()
//             );
//         }
//     }

//     tracing::info!("Shop combinations built: {:?}", shop_combinations);

//     // 3) Decidiamo la modalità: "risparmio" o "comodita" (default?)
//     let mode = payload.mode.as_deref().unwrap_or("comodita"); 
//     tracing::info!("Mode selected: {}", mode);

//     let required_products = &payload.products;
//     let required_count = required_products.len();
//     tracing::debug!("Required products: {:?} (count: {})", required_products, required_count);

//     // Il vettore finale di LowestPriceResponse da restituire
//     let mut results: Vec<LowestPriceResponse> = Vec::new();

//     match mode {
//         "risparmio" => {
//             tracing::info!("Processing in 'risparmio' mode.");
//             // ------------------------------------------------
//             //          MODALITÀ RISPARMIO
//             // ------------------------------------------------

//             // (A) Troviamo se esiste un singolo shop che ha TUTTI i prodotti
//             let mut best_single: Option<LowestPriceResponse> = None;

//             for (shop_name, products_in_shop) in &shop_combinations {
//                 tracing::debug!("Checking single shop: {}", shop_name);
//                 // Costruiamo un set con i nomi dei prodotti effettivamente presenti in questo shop
//                 let found_names: HashSet<String> = products_in_shop
//                     .iter()
//                     .map(|sp| sp.name.clone())
//                     .collect();
//                 tracing::debug!("Products found in '{}': {:?}", shop_name, found_names);

//                 // Verifichiamo se tutti i prodotti richiesti sono presenti
//                 let match_count = required_products.iter()
//                     .filter(|needed| found_names.contains(*needed))
//                     .count();

//                 tracing::debug!(
//                     "Shop '{}': match_count = {} (required: {})",
//                     shop_name,
//                     match_count,
//                     required_count
//                 );

//                 if match_count == required_count {
//                     // Questo shop ha TUTTI i prodotti
//                     let total_price: f64 = products_in_shop.iter().map(|p| p.price).sum();
//                     tracing::info!(
//                         "Shop '{}' has all required products with total price: {}",
//                         shop_name,
//                         total_price
//                     );
//                     if let Some(ref mut current_best) = best_single {
//                         // Se ne avevamo già uno migliore, confrontiamo
//                         if total_price < current_best.total_price {
//                             tracing::debug!(
//                                 "Found a better single shop: '{}' (previous best: {})",
//                                 shop_name,
//                                 current_best.shop
//                             );
//                             current_best.total_price = total_price;
//                             current_best.products = products_in_shop.clone();
//                             current_best.shop = shop_name.clone();
//                         }
//                     } else {
//                         best_single = Some(LowestPriceResponse {
//                             shop: shop_name.clone(),
//                             total_price,
//                             products: products_in_shop.clone(),
//                         });
//                         tracing::debug!("Set initial best_single to '{}'", shop_name);
//                     }
//                 }
//             }

//             // (B) Cerchiamo la combinazione di DUE shop che copra TUTTI i prodotti al costo minore
//             let shop_names: Vec<String> = shop_combinations.keys().cloned().collect();
//             tracing::debug!("Available shops for pairing: {:?}", shop_names);
//             let mut best_pair: Option<LowestPriceResponse> = None;

//             for i in 0..shop_names.len() {
//                 for j in (i+1)..shop_names.len() {
//                     let shop1 = &shop_names[i];
//                     let shop2 = &shop_names[j];
//                     tracing::debug!("Checking shop pair: '{}' + '{}'", shop1, shop2);

//                     let products_in_shop1 = &shop_combinations[shop1];
//                     let products_in_shop2 = &shop_combinations[shop2];

//                     // uniamo i prodotti di entrambi i negozi
//                     let mut combined_products = products_in_shop1.clone();
//                     combined_products.extend(products_in_shop2.clone());

//                     // Costruiamo un set dei nomi-prodotto combinati
//                     let found_names: HashSet<String> = combined_products
//                         .iter()
//                         .map(|sp| sp.name.clone())
//                         .collect();
//                     tracing::debug!(
//                         "Combined products for '{}' + '{}': {:?}",
//                         shop1,
//                         shop2,
//                         found_names
//                     );

//                     // Verifichiamo la copertura
//                     let match_count = required_products.iter()
//                         .filter(|needed| found_names.contains(*needed))
//                         .count();
                    
//                     tracing::debug!(
//                         "Shop pair '{}' + '{}': match_count = {} (required: {})",
//                         shop1,
//                         shop2,
//                         match_count,
//                         required_count
//                     );

//                     // Se contengono TUTTI i prodotti
//                     if match_count == required_count {
//                         let total_price: f64 = combined_products.iter().map(|p| p.price).sum();
//                         tracing::info!(
//                             "Shop pair '{}' + '{}' covers all products with total price: {}",
//                             shop1,
//                             shop2,
//                             total_price
//                         );
//                         if let Some(ref mut current_best) = best_pair {
//                             if total_price < current_best.total_price {
//                                 tracing::debug!(
//                                     "Found a better shop pair: '{}' + '{}' (previous best: {})",
//                                     shop1,
//                                     shop2,
//                                     current_best.shop
//                                 );
//                                 current_best.total_price = total_price;
//                                 current_best.products = combined_products.clone();
//                                 current_best.shop = format!("{} + {}", shop1, shop2);
//                             }
//                         } else {
//                             best_pair = Some(LowestPriceResponse {
//                                 shop: format!("{} + {}", shop1, shop2),
//                                 total_price,
//                                 products: combined_products,
//                             });
//                             tracing::debug!(
//                                 "Set initial best_pair to '{} + {}'",
//                                 shop1,
//                                 shop2
//                             );
//                         }
//                     }
//                 }
//             }

//             // (C) Confrontiamo single shop vs two-shop combo
//             match (best_single, best_pair) {
//                 (Some(s), Some(p)) => {
//                     tracing::info!(
//                         "Comparing best_single (shop: '{}', total_price: {}) vs best_pair (shops: '{}', total_price: {})",
//                         s.shop,
//                         s.total_price,
//                         p.shop,
//                         p.total_price
//                     );
//                     // Scegliamo quello col prezzo minore
//                     if s.total_price <= p.total_price {
//                         tracing::info!("Selected best_single: '{}'", s.shop);
//                         results.push(s);
//                     } else {
//                         tracing::info!("Selected best_pair: '{}'", p.shop);
//                         results.push(p);
//                     }
//                 }
//                 (Some(s), None) => {
//                     tracing::info!("Only best_single available: '{}'", s.shop);
//                     // Disponibile solo single
//                     results.push(s);
//                 }
//                 (None, Some(p)) => {
//                     tracing::info!("Only best_pair available: '{}'", p.shop);
//                     // Disponibile solo la combo
//                     results.push(p);
//                 }
//                 (None, None) => {
//                     tracing::warn!("No single shop or shop pair covers all required products.");
//                     // Nessun negozio (singolo o doppio) copre tutti i prodotti
//                     // results rimane vuoto (significa nessuna soluzione)
//                 }
//             }
//         }

//         "comodita" => {
//             tracing::info!("Processing in 'comodita' mode.");
//             // ------------------------------------------------
//             //          MODALITÀ COMODITÀ
//             // ------------------------------------------------
//             // Logica: cerchiamo un negozio singolo che copre TUTTI i prodotti
//             // e che abbia il prezzo (o la distanza) minore.

//             let mut best_option: Option<LowestPriceResponse> = None;

//             for (shop_name, products_in_shop) in &shop_combinations {
//                 tracing::debug!("Checking shop for 'comodita': {}", shop_name);
//                 let found_names: HashSet<String> = products_in_shop
//                     .iter()
//                     .map(|sp| sp.name.clone())
//                     .collect();
//                 tracing::debug!("Products found in '{}': {:?}", shop_name, found_names);

//                 let match_count = required_products.iter()
//                     .filter(|needed| found_names.contains(*needed))
//                     .count();

//                 tracing::debug!(
//                     "Shop '{}': match_count = {} (required: {})",
//                     shop_name,
//                     match_count,
//                     required_count
//                 );

//                 if match_count == required_count {
//                     // Questo shop ha TUTTI i prodotti
//                     let total_price: f64 = products_in_shop.iter().map(|p| p.price).sum();
//                     tracing::info!(
//                         "Shop '{}' has all required products with total price: {}",
//                         shop_name,
//                         total_price
//                     );

//                     // Esempio: "comodità" = minimizzare prezzo in un singolo negozio
//                     if let Some(ref mut current_best) = best_option {
//                         if total_price < current_best.total_price {
//                             tracing::debug!(
//                                 "Found a better 'comodita' option: '{}' (previous best: {})",
//                                 shop_name,
//                                 current_best.shop
//                             );
//                             current_best.total_price = total_price;
//                             current_best.products = products_in_shop.clone();
//                             current_best.shop = shop_name.clone();
//                         }
//                     } else {
//                         best_option = Some(LowestPriceResponse {
//                             shop: shop_name.clone(),
//                             total_price,
//                             products: products_in_shop.clone(),
//                         });
//                         tracing::debug!("Set initial best_option to '{}'", shop_name);
//                     }
//                 }
//             }

//             if let Some(best) = best_option {
//                 tracing::info!("Selected best 'comodita' option: '{}'", best.shop);
//                 results.push(best);
//             } else {
//                 tracing::warn!("No single shop covers all required products in 'comodita' mode.");
//                 // Se rimane None => nessun singolo negozio copre tutti i prodotti
//             }
//         }

//         _ => {
//             // Se `mode` non corrisponde a "risparmio" o "comodita",
//             // potresti decidere di defaultare a una delle due. Qui, ad esempio, fallback a comodita:
//             tracing::warn!("Unknown mode '{}' received. Defaulting to 'comodita'.", mode);
//             // Potresti richiamare la stessa logica di comodità o restituire un errore
//         }
//     }

//     // Se `results` è vuoto, significa che non è stata trovata alcuna combinazione / alcun negozio
//     if results.is_empty() {
//         tracing::info!("No valid shop combinations found to cover all products.");
//     } else {
//         tracing::info!("Returning results: {:?}", results);
//     }

//     Ok(Json(results))
// }

// pub async fn get_all_stores(
//     State(app_state): State<Arc<AppState>>,
// ) -> Result<Json<Vec<StoreDB>>, axum::http::StatusCode> {
//     let db_pool = &app_state.db_pool;

//     let stores = sqlx::query_as::<_, StoreDB>(
//         r#"
//         SELECT
//             id, grocery, lat, lng, street, city, zip_code,
//             working_hours, picks_up_in_store
//         FROM "Localization"
//         "#
//     )
//     .fetch_all(db_pool)
//     .await
//     .map_err(|e| {
//         eprintln!("Database query failed: {:?}", e);
//         axum::http::StatusCode::INTERNAL_SERVER_ERROR
//     })?;

//     Ok(Json(stores))
// }

// pub async fn get_products_by_store(
//     Path(store_id): Path<i32>,
//     State(app_state): State<Arc<AppState>>,
// ) -> Result<Json<Vec<ProductDB>>, axum::http::StatusCode> {
//     let db_pool = &app_state.db_pool;

//     let products = sqlx::query_as::<_, ProductDB>(
//         r#"
//         SELECT
//             p.id, p.name, p.description, p.current_price,
//             p.discount, p.price_for_kg, p.image_url
//         FROM "Product" p
//         WHERE p."localizationId" = $1
//         "#
//     )
//     .bind(store_id)
//     .fetch_all(db_pool)
//     .await
//     .map_err(|e| {
//         eprintln!("Database query failed: {:?}", e);
//         axum::http::StatusCode::INTERNAL_SERVER_ERROR
//     })?;

//     Ok(Json(products))
// }
