use crate::models::ProductResult;
use crate::models::{SearchQuery, SearchResponse};
use crate::search::{fetch_lowest_price, fetch_most_similar};
use crate::AppState;
use axum::{
    extract::{Query, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use serde_json::Value;
use std::collections::HashSet;
use std::sync::Arc;

#[axum_macros::debug_handler]
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
