use crate::models::{
    LowestPriceResponse, ProductDB, ProductExistRequest, ProductExistResponse,
    ProductInShopRequest, ProductInShopResponse, ProductResult, ProductsLowestPriceRequest,
    SearchQuery, SearchResponse, ShopProduct, StoreDB,
};
use crate::search::{
    fetch_lowest_price, fetch_lowest_price_shops, fetch_most_similar, fetch_product_in_shop,
    fetch_product_nearby,
};
use crate::utils::haversine_distance;
use crate::AppState;
use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use serde_json::Value;
use std::collections::HashMap;
use std::collections::HashSet;
use std::sync::Arc;

pub async fn search_handler(
    State(app_state): State<Arc<AppState>>,
    Query(params): Query<SearchQuery>,
) -> Result<impl IntoResponse, (StatusCode, Json<Value>)> {
    let most_similar_result = fetch_most_similar(&app_state, &params.query).await;
    let mut most_similar = match most_similar_result {
        Ok(products) => products,
        Err(e) => {
            return {
                tracing::error!("Error fetching most similar products: {:?}", e);
                Err((
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(serde_json::json!({ "error": "Internal server error" })),
                ))
            }
        }
    };

    let exclude_ids: HashSet<String> = most_similar
        .iter()
        .map(|product| product._id.clone())
        .collect();

    let mut lowest_price = match fetch_lowest_price(&app_state, &params.query, &exclude_ids).await {
        Ok(products) => products,
        Err(_) => vec![],
    };

    if lowest_price.is_empty() {
        if most_similar.len() > 1 {
            if let Some((index, min_product)) =
                most_similar.iter().enumerate().min_by(|(_, a), (_, b)| {
                    a.price
                        .partial_cmp(&b.price)
                        .unwrap_or(std::cmp::Ordering::Equal)
                })
            {
                lowest_price.push(min_product.clone());
                most_similar.remove(index);
            }
        }
    }

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
    .await
    {
        Ok(products) => products,
        Err(e) => {
            return {
                tracing::error!("Error fetching product: {:?}", e);
                Err((
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(serde_json::json!({ "error": "Internal server error" })),
                ))
            }
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
    .await
    {
        Ok(products) => products,
        Err(e) => {
            return {
                tracing::error!("Error fetching product: {:?}", e);
                Err((
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(serde_json::json!({ "error": "Internal server error" })),
                ))
            }
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

pub async fn find_lowest_price(
    State(app_state): State<Arc<AppState>>,
    Json(payload): Json<ProductsLowestPriceRequest>,
) -> Result<Json<Vec<LowestPriceResponse>>, (StatusCode, Json<Value>)> {
    // Fetch product prices at nearby shops
    let product_prices = match fetch_lowest_price_shops(
        &app_state,
        &payload.products,
        payload.position.latitude,
        payload.position.longitude,
    )
    .await
    {
        Ok(prices) => prices,
        Err(e) => {
            return {
                tracing::error!("Error fetching products: {:?}", e);
                Err((
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(serde_json::json!({ "error": "Internal server error" })),
                ))
            }
        }
    };

    tracing::info!("Found product prices: {:#?}", product_prices);

    // Calculate the lowest cost shopping combinations
    let mut shop_combinations: HashMap<String, Vec<ShopProduct>> = HashMap::new();
    for (_product_name, shops) in product_prices.iter() {
        for product in shops {
            shop_combinations
                .entry(product.localization.grocery.clone())
                .or_insert_with(Vec::new)
                .push(ShopProduct {
                    shop: product.localization.grocery.clone(),
                    name: product.name.clone(),
                    description: product.description.clone(),
                    discount: product.discount,
                    price: product.price,
                    distance: haversine_distance(
                        payload.position.latitude,
                        payload.position.longitude,
                        product.localization.lat,
                        product.localization.lon,
                    ),
                });
        }
    }

    // Find the combination with the lowest price
    let mut results = Vec::new();
    let mut lowest_total = f64::MAX;
    let mut best_combination = Vec::new();

    // Iterate over each shop to calculate total costs
    for (shop, products) in shop_combinations.iter() {
        let shop_total: f64 = products.iter().map(|p| p.price).sum();
        if shop_total < lowest_total {
            lowest_total = shop_total;
            best_combination = vec![LowestPriceResponse {
                shop: shop.clone(),
                total_price: shop_total,
                products: products.clone(),
            }];
        }
    }

    // Check if combining shops leads to a lower price
    for (shop1, products1) in shop_combinations.iter() {
        for (shop2, products2) in shop_combinations.iter() {
            if shop1 != shop2 {
                let combined_total: f64 = products1.iter().map(|p| p.price).sum::<f64>()
                    + products2.iter().map(|p| p.price).sum::<f64>();
                if combined_total < lowest_total {
                    lowest_total = combined_total;
                    best_combination = vec![
                        LowestPriceResponse {
                            shop: shop1.clone(),
                            total_price: products1.iter().map(|p| p.price).sum(),
                            products: products1.clone(),
                        },
                        LowestPriceResponse {
                            shop: shop2.clone(),
                            total_price: products2.iter().map(|p| p.price).sum(),
                            products: products2.clone(),
                        },
                    ];
                }
            }
        }
    }
    results.extend(best_combination);
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
        FROM Localization
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
        FROM product p
        WHERE p.localization_id = $1
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
