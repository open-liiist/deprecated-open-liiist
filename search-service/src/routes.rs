use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::convert::Infallible;
use warp::http::StatusCode;

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Product {
    id: u32,
    name: String,
    price: f64,
}

pub async fn search(query: HashMap<String, String>) -> Result<impl warp::Reply, Infallible> {
    let products = vec![
        Product {
            id: 1,
            name: "Apple".to_string(),
            price: 1.2,
        },
        Product {
            id: 2,
            name: "Banana".to_string(),
            price: 0.8,
        },
        Product {
            id: 3,
            name: "Orange".to_string(),
            price: 1.5,
        },
    ];

    let filtered: Vec<Product> = products
        .into_iter()
        .filter(|p| {
            query.get("name").map_or(true, |name| {
                p.name.to_lowercase().contains(&name.to_lowercase())
            })
        })
        .collect();

    if filtered.is_empty() {
        return Ok(warp::reply::with_status(
            warp::reply::json(&"No products found"),
            StatusCode::NOT_FOUND,
        ));
    }

    Ok(warp::reply::with_status(warp::reply::json(&filtered), StatusCode::OK))
}
