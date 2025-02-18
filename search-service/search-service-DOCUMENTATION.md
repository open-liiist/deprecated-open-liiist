
# (Alert! Documentation Expired) Technical Documentation: `search-service`

---

## **Table of Contents**

1. [Elasticsearch Configuration](#1-elasticsearch-configuration)
   - [Creating the Index with Mapping and Settings](#creating-the-index-with-mapping-and-settings)
   - [Inserting Products](#inserting-products)
2. [Structure of the Search Service (`search-service`)](#2-structure-of-the-search-service-search-service)
   - [Models (`models.rs`)](#21-models-modelsrs)
   - [Handlers (`handlers.rs`)](#22-handlers-handlersrs)
   - [Search Functions (`search.rs`)](#23-search-functions-searchrs)
   - [Utility (`utils.rs`)](#24-utility-utilsrs)
   - [Main (`main.rs`)](#25-main-mainrs)
3. [Cargo Dependencies](#3-cargo-dependencies)
4. [Docker Compose Configuration](#4-docker-compose-configuration)
   - [`search-service` Service](#41-search-service-service)
   - [Other Services](#42-other-services)
   - [`search-service` Dockerfile](#43-search-service-dockerfile)
5. [API Testing](#5-api-testing)
   - [Indexing Verification](#51-indexing-verification)
   - [Testing `/search` Endpoint](#52-testing-search-endpoint)
   - [Testing `/product/exists` Endpoint](#53-testing-productexists-endpoint)
   - [Testing `/product/in-shop` Endpoint](#54-testing-productin-shop-endpoint)
   - [Testing `/product/lowest-price` Endpoint](#55-testing-productlowest-price-endpoint)
6. [Debugging the "Savings" Mode](#6-debugging-the-savings-mode)
   - [Problem Analysis](#61-problem-analysis)
   - [Debugging Steps](#62-debugging-steps)
   - [Potential Solutions](#63-potential-solutions)
7. [Final Considerations](#7-final-considerations)
   - [Key Points](#71-key-points)
   - [Action List (TODO LIST)](#72-action-list-todo-list)
   - [Example of Additional Logs in the Code](#73-example-of-additional-logs-in-the-code)
   - [Example of Manual Query for Debugging](#74-example-of-manual-query-for-debugging)

---

## **1. Elasticsearch Configuration**

### **1.1 Creating the Index with Mapping and Settings**

An Elasticsearch index named `products` has been created with specific configurations to correctly handle text fields and search queries. A `normalizer` has been defined to ensure case-insensitive searches on `keyword` type fields.

**Command to Create the Index:**

```bash
curl -X PUT "http://localhost:9200/products" -H 'Content-Type: application/json' -d'
{
  "settings": {
    "analysis": {
      "normalizer": {
        "lowercase_normalizer": {
          "type": "custom",
          "filter": ["lowercase"]
        }
      },
      "analyzer": {
        "whitespace_analyzer": {
          "type": "custom",
          "tokenizer": "whitespace",
          "filter": ["lowercase"]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "full_name": {
        "type": "text",
        "analyzer": "whitespace_analyzer"
      },
      "name": {
        "type": "keyword",
        "normalizer": "lowercase_normalizer"
      },
      "description": {
        "type": "text",
        "analyzer": "standard"
      },
      "location": {
        "type": "geo_point"
      },
      "price": {
        "type": "float"
      },
      "discount": {
        "type": "float"
      },
      "quantity": {
        "type": "keyword"
      },
      "image_url": {
        "type": "keyword"
      },
      "price_for_kg": {
        "type": "float"
      },
      "localization": {                   
        "properties": {
          "grocery": {
            "type": "text",
            "analyzer": "standard"
          },
          "lat": {
            "type": "float"
          },
          "lon": {
            "type": "float"
          },
          "street": {
            "type": "text",
            "analyzer": "standard"
          },
          "city": {
            "type": "text",
            "analyzer": "standard"
          },
          "zip_code": {
            "type": "keyword"
          },
          "working_hours": {
            "type": "text",
            "analyzer": "standard"
          },
          "picks_up_in_store": {
            "type": "boolean"
          }
        }
      }
      // Add additional fields if necessary
    }
  }
}
'
```

**Expected Response:**

```json
{
  "acknowledged": true,
  "shards_acknowledged": true,
  "index": "products"
}
```

**Description:**

- **`normalizer`**: Applicable to `keyword` type fields, ensuring case-insensitive searches.
- **`analyzer`**: Configured for `text` type fields. The `whitespace_analyzer` splits text into tokens based on whitespace and applies the `lowercase` filter.
- **Geolocation Fields**: The `location` field is of type `geo_point` to allow geographic queries.

### **1.2 Inserting Products**

Products have been inserted into the `products` index following the structure defined in the mapping.

**Examples of Inserting Products:**

#### **Product 1: Pasta Barilla Spaghetti 500g**

```bash
curl -X POST "http://localhost:9200/products/_doc/1" -H 'Content-Type: application/json' -d'
{
  "name": "pasta_barilla_spaghetti_500g",
  "full_name": "Pasta Barilla Spaghetti 500g",
  "description": "Spaghetti Barilla 500g",
  "price": 1.2,
  "discount": 0.0,
  "quantity": "500g",
  "image_url": "http://example.com/img/pasta.jpg",
  "price_for_kg": 2.4,
  "location": {
    "lat": 45.4642,
    "lon": 9.19
  },
  "localization": {
    "grocery": "Carrefour Milano",
    "lat": 45.4642,
    "lon": 9.19,
    "street": "Via Roma 10",
    "city": "Milano",
    "zip_code": "20100",
    "working_hours": "08:00-21:00",
    "picks_up_in_store": true
  }
}
'
```

#### **Product 2: Fresh Mozzarella 125g**

```bash
curl -X POST "http://localhost:9200/products/_doc/2" -H 'Content-Type: application/json' -d'
{
  "name": "mozzarella_fresca_125g",
  "full_name": "Mozzarella fresca 125g",
  "description": "Mozzarella di latte vaccino",
  "price": 1.2,
  "discount": 0.1,
  "quantity": "125g",
  "image_url": "http://example.com/img/mozzarella.jpg",
  "price_for_kg": 9.6,
  "location": {
    "lat": 45.472,
    "lon": 9.2
  },
  "localization": {
    "grocery": "Esselunga Milano",
    "lat": 45.472,
    "lon": 9.2,
    "street": "Corso Buenos Aires 20",
    "city": "Milano",
    "zip_code": "20124",
    "working_hours": "07:30-22:00",
    "picks_up_in_store": false
  }
}
'
```

#### **Product 3: Whole Milk 1L**

```bash
curl -X POST "http://localhost:9200/products/_doc/3" -H 'Content-Type: application/json' -d'
{
  "name": "latte_intero_1l",
  "full_name": "Latte Intero 1L",
  "description": "Latte fresco intero pastorizzato",
  "price": 1.0,
  "discount": 0.0,
  "quantity": "1L",
  "image_url": "http://example.com/img/latte.jpg",
  "price_for_kg": 1.0,
  "location": {
    "lat": 45.465,
    "lon": 9.22
  },
  "localization": {
    "grocery": "Conad Milano",
    "lat": 45.465,
    "lon": 9.22,
    "street": "Via Torino 15",
    "city": "Milano",
    "zip_code": "20123",
    "working_hours": "09:00-21:00",
    "picks_up_in_store": true
  }
}
'
```

#### **Product 4: Whole Wheat Bread 500g**

```bash
curl -X POST "http://localhost:9200/products/_doc/4" -H 'Content-Type: application/json' -d'
{
  "name": "pane_integrale_500g",
  "full_name": "Pane Integrale 500g",
  "description": "Pane fresco integrale",
  "price": 2.5,
  "discount": 0.0,
  "quantity": "500g",
  "image_url": "http://example.com/img/pane.jpg",
  "price_for_kg": 5.0,
  "location": {
    "lat": 45.47,
    "lon": 9.2
  },
  "localization": {
    "grocery": "Carrefour Milano",
    "lat": 45.47,
    "lon": 9.2,
    "street": "Via Torino 5",
    "city": "Milano",
    "zip_code": "20123",
    "working_hours": "08:00-21:00",
    "picks_up_in_store": true
  }
}
'
```

**Expected Response for Each Insertion:**

```json
{
  "_index": "products",
  "_id": "1", // Or "2", "3", "4" depending on the product
  "_version": 1,
  "result": "created", // Or "updated" if it's an update
  "_shards": {
    "total": 2,
    "successful": 1,
    "failed": 0
  },
  "_seq_no": 0, // Increments with each insertion
  "_primary_term": 1
}
```

---

## **2. Structure of the Search Service (`search-service`)**

The search service is developed in **Rust** using the **Axum** framework for API handling and **Elasticsearch** as the search engine. The project structure is divided into the following main components:

### **2.1 Models (`models.rs`)**

Defines the data structures used within the service, representing data from the database and those processed by the APIs.

```rust
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

/// Structure for each product result
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

/// Structure to organize the final response
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
    pub mode: Option<String>,  // "savings" | "convenience" (or others)
}

#[derive(Debug, Serialize, Clone)]
pub struct LowestPriceResponse {
    pub shop: String,               // Store name
    pub total_price: f64,           // Total price for products from this store
    pub products: Vec<ShopProduct>, // List of products purchased from this store
}

#[derive(Debug, Serialize, Clone)]
pub struct ShopProduct {
    pub shop: String,          // Store name
    pub name: String,          // Product name
    pub description: String,   // Product description
    pub price: f64,            // Product price
    pub discount: Option<f64>, // Product discount, if applicable
    pub distance: f64,         // Distance from user to store
}
```

### **2.2 Handlers (`handlers.rs`)**

Handles HTTP requests, orchestrates interactions with search functions, and returns appropriate responses.

```rust
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
use serde_json::{Value, json};
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
            tracing::error!("Error fetching most similar products: {:?}", e);
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({ "error": "Internal server error" })),
            ))
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
            tracing::error!("Error fetching product: {:?}", e);
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({ "error": "Internal server error" })),
            ))
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
            tracing::error!("Error fetching product: {:?}", e);
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({ "error": "Internal server error" })),
            ))
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
) -> Result<Json<Vec<LowestPriceResponse>>, (StatusCode, Json<serde_json::Value>)> {
    // Step 1: Retrieve product prices from nearby stores via Elasticsearch
    let product_prices = match fetch_lowest_price_shops(
        &app_state,
        &payload.products,
        payload.position.latitude,
        payload.position.longitude
    )
    .await
    {
        Ok(prices) => {
            tracing::info!("Successfully retrieved product prices from Elasticsearch.");
            prices
        },
        Err(e) => {
            tracing::error!("Error retrieving products from Elasticsearch: {:?}", e);
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "error": "Internal server error" })),
            ));
        }
    };

    tracing::debug!("Retrieved product prices: {:?}", product_prices);

    // Step 2: Build the "store_name -> list of ShopProduct" map
    let mut shop_combinations: HashMap<String, Vec<ShopProduct>> = HashMap::new();

    for (product_name, product_list) in &product_prices {
        tracing::debug!("Processing product: {}", product_name);
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

    tracing::info!("Built store combinations: {:?}", shop_combinations);

    // Step 3: Determine the mode ("savings" or "convenience")
    let mode = payload.mode.as_deref().unwrap_or("convenience"); 
    tracing::info!("Selected mode: {}", mode);

    let required_products = &payload.products;
    let required_count = required_products.len();
    tracing::debug!("Required products: {:?} (count: {})", required_products, required_count);

    // Final vector of LowestPriceResponse to return
    let mut results: Vec<LowestPriceResponse> = Vec::new();

    match mode {
        "savings" => {
            tracing::info!("Processing in 'savings' mode.");
            // "Savings" Mode

            // (A) Check if a single store has all required products
            let mut best_single: Option<LowestPriceResponse> = None;

            for (shop_name, products_in_shop) in &shop_combinations {
                tracing::debug!("Checking single store: {}", shop_name);
                let found_names: HashSet<String> = products_in_shop
                    .iter()
                    .map(|sp| sp.name.clone())
                    .collect();
                tracing::debug!("Products found in '{}': {:?}", shop_name, found_names);

                let match_count = required_products.iter()
                    .filter(|needed| found_names.contains(*needed))
                    .count();

                tracing::debug!(
                    "Store '{}': match_count = {} (required: {})",
                    shop_name,
                    match_count,
                    required_count
                );

                if match_count == required_count {
                    let total_price: f64 = products_in_shop.iter().map(|p| p.price).sum();
                    tracing::info!(
                        "Store '{}' has all required products with total price: {}",
                        shop_name,
                        total_price
                    );
                    if let Some(ref mut current_best) = best_single {
                        if total_price < current_best.total_price {
                            tracing::debug!(
                                "Found a better single store option: '{}' (previous: {})",
                                shop_name,
                                current_best.shop
                            );
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

            // (B) Search for combinations of two stores that cover all required products at the lowest price
            let shop_names: Vec<String> = shop_combinations.keys().cloned().collect();
            tracing::debug!("Available stores for combination: {:?}", shop_names);
            let mut best_pair: Option<LowestPriceResponse> = None;

            for i in 0..shop_names.len() {
                for j in (i+1)..shop_names.len() {
                    let shop1 = &shop_names[i];
                    let shop2 = &shop_names[j];
                    tracing::debug!("Checking store combination: '{}' + '{}'", shop1, shop2);

                    let products_in_shop1 = &shop_combinations[shop1];
                    let products_in_shop2 = &shop_combinations[shop2];

                    // Union of products from both stores
                    let mut combined_products = products_in_shop1.clone();
                    combined_products.extend(products_in_shop2.clone());

                    // Building the set of combined product names
                    let found_names: HashSet<String> = combined_products
                        .iter()
                        .map(|sp| sp.name.clone())
                        .collect();
                    tracing::debug!(
                        "Combined products for '{}' + '{}': {:?}",
                        shop1,
                        shop2,
                        found_names
                    );

                    // Check if all required products are covered
                    let match_count = required_products.iter()
                        .filter(|needed| found_names.contains(*needed))
                        .count();
                    
                    tracing::debug!(
                        "Combination '{} + {}': match_count = {} (required: {})",
                        shop1,
                        shop2,
                        match_count,
                        required_count
                    );

                    if match_count == required_count {
                        let total_price: f64 = combined_products.iter().map(|p| p.price).sum();
                        tracing::info!(
                            "Combination '{} + {}' covers all products with total price: {}",
                            shop1,
                            shop2,
                            total_price
                        );
                        if let Some(ref mut current_best) = best_pair {
                            if total_price < current_best.total_price {
                                tracing::debug!(
                                    "Found a better pair of stores: '{}' + '{}' (previous: {})",
                                    shop1,
                                    shop2,
                                    current_best.shop
                                );
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

            // (C) Compare single store vs pair of stores
            match (best_single, best_pair) {
                (Some(s), Some(p)) => {
                    tracing::info!(
                        "Comparing best_single (store: '{}', total price: {}) and best_pair (stores: '{}', total price: {})",
                        s.shop,
                        s.total_price,
                        p.shop,
                        p.total_price
                    );
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
                    tracing::warn!("No single store or store combination covers all required products.");
                }
            }
        }

        "convenience" => {
            tracing::info!("Processing in 'convenience' mode.");
            // "Convenience" Mode

            let mut best_option: Option<LowestPriceResponse> = None;

            for (shop_name, products_in_shop) in &shop_combinations {
                tracing::debug!("Checking store for 'convenience': {}", shop_name);
                let found_names: HashSet<String> = products_in_shop
                    .iter()
                    .map(|sp| sp.name.clone())
                    .collect();
                tracing::debug!("Products found in '{}': {:?}", shop_name, found_names);

                let match_count = required_products.iter()
                    .filter(|needed| found_names.contains(*needed))
                    .count();

                tracing::debug!(
                    "Store '{}': match_count = {} (required: {})",
                    shop_name,
                    match_count,
                    required_count
                );

                if match_count == required_count {
                    let total_price: f64 = products_in_shop.iter().map(|p| p.price).sum();
                    tracing::info!(
                        "Store '{}' has all required products with total price: {}",
                        shop_name,
                        total_price
                    );

                    if let Some(ref mut current_best) = best_option {
                        if total_price < current_best.total_price {
                            tracing::debug!(
                                "Found a better 'convenience' option: '{}' (previous: {})",
                                shop_name,
                                current_best.shop
                            );
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
                tracing::info!("Selected best 'convenience' option: '{}'", best.shop);
                results.push(best);
            } else {
                tracing::warn!("No single store covers all required products in 'convenience' mode.");
            }
        }

        _ => {
            tracing::warn!("Unknown mode '{}' received. Defaulting to 'convenience'.", mode);
            // Implement default logic or return an error
        }
    }

    if results.is_empty() {
        tracing::info!("No valid store combination found to cover all products.");
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
        eprintln!("Database query error: {:?}", e);
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
        eprintln!("Database query error: {:?}", e);
        axum::http::StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok(Json(products))
}
```

### **2.3 Search Functions (`search.rs`)**

Contains functions that interact with Elasticsearch to execute search queries, retrieve similar products, lowest prices, and verify product availability in stores.

```rust
use crate::models::{Localization, ProductResult};
use crate::AppState;
use elasticsearch::SearchParts;
use serde_json::json;
use std::collections::HashMap;
use std::collections::HashSet;
use std::sync::Arc;

/// Retrieves the most similar products to the provided query
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

/// Retrieves products with the lowest price, excluding certain IDs
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
                    "fields": ["full_name", "name", "name.keyword", "description"],
                    "query": query,
                    "type": "best_fields",
                    "fuzziness": "AUTO"
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

/// Retrieves a product near a specific location
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

/// Retrieves a specific product in a specific shop
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
                        { "match": { "name.keyword": product } },
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

/// Retrieves the prices of each product at nearby stores
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
                                "fields": ["full_name", "name", "description"],
                                "type": "best_fields",
                                "fuzziness": "AUTO"
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

/// Helper function to parse Elasticsearch response into a vector of `ProductResult`
pub async fn parse_response(
    response: elasticsearch::http::response::Response,
) -> Result<Vec<ProductResult>, Box<dyn std::error::Error + Send + Sync>> {
    let json_resp = response.json::<serde_json::Value>().await?;
    tracing::debug!("Elasticsearch Response: {:#?}", json_resp);
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
```

### **2.4 Utility (`utils.rs`)**

Contains support functions, including calculating the distance between two geographic points using the Haversine formula.

```rust
/// Calculates the distance between two geographic points using the Haversine formula.
///
/// # Parameters
/// - `lat1`: Latitude of the first point.
/// - `lon1`: Longitude of the first point.
/// - `lat2`: Latitude of the second point.
/// - `lon2`: Longitude of the second point.
///
/// # Returns
/// - Distance in kilometers.
pub fn haversine_distance(lat1: f64, lon1: f64, lat2: f64, lon2: f64) -> f64 {
    let r = 6371.0; // Earth's radius in kilometers
    let dlat = (lat2 - lat1).to_radians();
    let dlon = (lon2 - lon1).to_radians();
    let a = (dlat / 2.0).sin().powi(2)
        + lat1.to_radians().cos()
            * lat2.to_radians().cos()
            * (dlon / 2.0).sin().powi(2);
    let c = 2.0 * a.sqrt().atan2((1.0 - a).sqrt());
    r * c // Distance in kilometers
}
```

### **2.5 Main (`main.rs`)**

Configures the Axum application, defines routes, initializes Elasticsearch and the PostgreSQL connection pool, and starts the server.

```rust
mod handlers;
mod models;
mod search;
mod utils;

use ::elasticsearch::Elasticsearch;
use axum::{
    routing::{get, post},
    Router,
};
use std::sync::Arc;
use tokio::sync::Mutex;

/// Structure of the application's shared state across routes
pub struct AppState {
    client: Mutex<Elasticsearch>,
    db_pool: sqlx::PgPool,
}

#[tokio::main]
async fn main() {
    // Initialize the logger
    tracing_subscriber::fmt()
        .with_target(false)
        .with_level(true)
        .pretty()
        .init();

    // Initialize the Elasticsearch client
    let transport =
        elasticsearch::http::transport::Transport::single_node("http://elasticsearch:9200")
            .expect("Error creating Elasticsearch transport");
    
    // Retrieve the remote database URL from environment variables
    let database_url = std::env::var("REMOTE_DATABASE_URL")
        .expect("REMOTE_DATABASE_URL must be set to connect to the remote database");
        
    println!("Connecting to database at URL: {}", database_url);

    // Connect to the PostgreSQL database
    let db_pool = sqlx::PgPool::connect(&database_url)
        .await
        .expect("Failed to connect to the database");
    
    // Create the application's shared state
    let app_state = Arc::new(AppState {
        client: Mutex::new(Elasticsearch::new(transport)),
        db_pool,
    });

    // Configure the Axum router with routes and shared state
    let app = Router::new()
        .route("/search", get(handlers::search_handler))
        .route("/product/exists", post(handlers::check_product_exist))
        .route("/product/in-shop", post(handlers::search_product_in_shop))
        .route("/product/lowest-price", post(handlers::find_lowest_price))
        .route("/stores", get(handlers::get_all_stores))
        .route("/store/:id/products", get(handlers::get_products_by_store))
        .with_state(app_state);

    // Start the server on the specified port
    let port = std::env::var("SEARCH_SERVICE_PORT").unwrap_or_else(|_| "4001".to_string());
    let url = format!("0.0.0.0:{port}");
    let listener = tokio::net::TcpListener::bind(url).await.expect("Error binding to port");
    println!("Search service started on port {}", port);
    axum::serve(listener, app).await.unwrap();
}
```

---

## **3. Cargo Dependencies**

The `Cargo.toml` file defines the necessary dependencies for the `search-service` project.

```toml
[package]
name = "search-service"
version = "0.1.0"
edition = "2021"

[dependencies]
axum = "0.7.7"
axum-macros = "0.4.2"
elasticsearch = "8.15.0-alpha.1"
reqwest = "0.12.8"
serde = { version = "1.0.210", features = ["derive"] }
serde_json = "1.0.128"
tokio = { version = "1.40.0", features = ["full"] }
tower-http = "0.6.1"
tracing = "0.1.40"
tracing-subscriber = { version = "0.3.18", features = ["json", "env-filter", "fmt"] }
hyper = "0.14"  # Added for compatibility with Axum
sqlx = { version = "0.7", features = ["postgres", "runtime-tokio-native-tls"] }
aide = "0.13.4"
```

**Notes:**

- **`axum` and `axum-macros`**: Framework for building HTTP APIs in Rust.
- **`elasticsearch`**: Client for interacting with Elasticsearch.
- **`reqwest`**: Asynchronous HTTP client.
- **`serde` and `serde_json`**: Serialization and deserialization of data.
- **`tokio`**: Asynchronous runtime for Rust.
- **`tower-http`**: Middleware for Axum.
- **`tracing` and `tracing-subscriber`**: Logging and tracing operations.
- **`hyper`**: Added for ensuring compatibility with Axum.
- **`sqlx`**: Asynchronous interaction with PostgreSQL.
- **`aide`**: Automatic API documentation generation.

---

## **4. Docker Compose Configuration**

The Docker Compose configuration defines the various services required for the application, including `search-service`, Elasticsearch, PostgreSQL, and other auxiliary services.

### **4.1 `search-service` Service**

```yaml
services:

  search-service:
    build: 
      context: ./search-service
      dockerfile: Dockerfile
    ports:
      - "4001:4001"
    environment:
      - SEARCH_SERVICE_PORT=${SEARCH_SERVICE_PORT}
      - ELASTICSEARCH_URL=http://elasticsearch:9200
      - REMOTE_DATABASE_URL=${REMOTE_DATABASE_URL}  # Set to point to the remote DB
      - RUST_LOG=debug  # Set log level to DEBUG
```

### **4.2 Other Services**

The complete configuration includes additional services such as `web-client`, `auth-service`, `product-receiver-service`, `db` (PostgreSQL), `adminer`, `uptime-kuma`, `traefik`, `elasticsearch`, `logstash`, `kibana`, `notification-alert`, and `scraping-service`.

**Complete Docker Compose Configuration:**

```yaml
version: '3.8'

services:

  web-client:
    build: 
      context: ./web-client
      target: dev
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    volumes:
      - ./web-client:/app
      - /app/node_modules
      - /app/.next
    command: npm run dev
    environment:
      - NODE_ENV=${NODE_ENV}
      - LOG_LEVEL=${LOG_LEVEL}
      - API_BASE_URL=${API_BASE_URL}
      - NAME_COOKIE_ACCESS=${NAME_COOKIE_ACCESS}
      - NAME_COOKIE_REFRESH=${NAME_COOKIE_REFRESH}

  auth-service:
    build: 
      context: ./auth-service
      dockerfile: Dockerfile
    ports:
      - "4000:4000"
    depends_on:
      db:
        condition: service_healthy
    environment:
      - AUTH_SERVICE_PORT=${AUTH_SERVICE_PORT}
      - AUTH_DATABASE_URL=${AUTH_DATABASE_URL}
      - ACCESS_TOKEN_SECRET=${ACCESS_TOKEN_SECRET}
      - REFRESH_TOKEN_SECRET=${REFRESH_TOKEN_SECRET}

  search-service:
    build: 
      context: ./search-service
      dockerfile: Dockerfile
    ports:
      - "4001:4001"
    environment:
      - SEARCH_SERVICE_PORT=${SEARCH_SERVICE_PORT}
      - ELASTICSEARCH_URL=http://elasticsearch:9200
      - REMOTE_DATABASE_URL=${REMOTE_DATABASE_URL}
      - RUST_LOG=debug

  product-receiver-service:
    container_name: product-receiver-service
    build: 
      context: ./product-receiver-service
      dockerfile: Dockerfile
    ports:
      - "3002:3002"
    environment:
      - PRODUCT_RECEIVER_SERVICE_PORT=${PRODUCT_RECEIVER_SERVICE_PORT}
      - REMOTE_DATABASE_URL=${REMOTE_DATABASE_URL}
      - LOGSTASH_HOST=logstash
      - LOGSTASH_PORT=50000
    volumes:
      - ./product-receiver-service:/app
      - product_receiver_data:/app/data

  db:
    image: postgres:13
    restart: always
    ports:
      - "5432:5432"
    environment:
      PGUSER: user
      POSTGRES_USER: user
      POSTGRES_PASSWORD: postgrespw
      POSTGRES_DB: appdb
    healthcheck:
      test: ["CMD", "pg_isready", "-h", "db"]
      interval: 10s
      timeout: 10s
      retries: 10
    volumes:
      - pgdata:/var/lib/postgresql/data

  adminer:
    image: adminer
    restart: always
    command: php -S [::]:8090 -t /var/www/html
    ports:
      - 8090:8090

  uptime-kuma:
    image: louislam/uptime-kuma:1
    restart: unless-stopped
    network_mode: host
    ports:
      - 3003:3003
    volumes:
      - ./data:/app/data
    environment:
      - UPTIME_KUMA_PORT=${UPTIME_KUMA_PORT}

  traefik:
    image: docker.io/library/traefik:v3.1.6
    container_name: traefik
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080" # Dashboard (do not use in production)
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./config/traefik.yml:/etc/traefik/traefik.yml:ro
      - ./config/conf.d/:/etc/traefik/conf.d/:ro
      - ./certs/:/var/traefik/certs/:rw

  elasticsearch:
    build:
      context: elasticsearch/
      dockerfile: Dockerfile
      args: 
        ELASTIC_VERSION: ${ELASTIC_VERSION}
    ports:
      - "9200:9200"
      - "9300:9300"
    volumes:
      - ./elasticsearch/config/elasticsearch.yml:/usr/share/elasticsearch/config/elasticsearch.yml:ro,Z
      - ./elasticsearch/setup-elasticsearch.sh:/usr/share/elasticsearch/setup-elasticsearch.sh
      - elasticsearch:/usr/share/elasticsearch/data:Z
    entrypoint: |
      sh -c "
        elasticsearch &
        chmod +x /usr/share/elasticsearch/setup-elasticsearch.sh &&
        sleep 10 &&
        /usr/share/elasticsearch/setup-elasticsearch.sh &&
        wait
      "
    environment:
      node.name: elasticsearch
      ES_JAVA_OPTS: "-Xms1g -Xmx1g"
      discovery.type: single-node
      ELASTIC_PASSWORD: ${ELASTIC_PASSWORD:-}
    restart: unless-stopped

  logstash:
    build:
      context: logstash/
      args:
        ELASTIC_VERSION: ${ELASTIC_VERSION}
    volumes:
      - ./logstash/config/logstash.yml:/usr/share/logstash/config/logstash.yml:rw,Z
      - ./logstash/pipeline:/usr/share/logstash/pipeline:rw,Z
      - logstash_data:/usr/share/logstash/data
    ports:
      - 5044:5044
      - 50000:50000/tcp
      - 50000:50000/udp
      - 9600:9600
    environment:
      LS_JAVA_OPTS: -Xmx256m -Xms256m
      LOGSTASH_INTERNAL_PASSWORD: ${LOGSTASH_INTERNAL_PASSWORD:-}
    depends_on:
      - elasticsearch
    restart: unless-stopped

  kibana:
    build:
      context: kibana/
      args:
        ELASTIC_VERSION: ${ELASTIC_VERSION}
    ports:
      - "5601:5601"
    volumes:
      - ./kibana/config/kibana.yml:/usr/share/kibana/config/kibana.yml:ro,Z
      - kibana_data:/usr/share/kibana/data
    environment:
      KIBANA_SYSTEM_PASSWORD: ${KIBANA_SYSTEM_PASSWORD:-}
    depends_on:
      - elasticsearch
    restart: unless-stopped

  notification-alert:
    build: ./notification-alert
    ports:
      - "5000:5000"

  scraping-service:
    user: root
    build: 
      context: ./scraping-service
      dockerfile: Dockerfile
    container_name: scraping-service
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./scraping-service:/app
    depends_on:
      - product-receiver-service
    stop_grace_period: 30s
    restart: unless-stopped

volumes:
  pgdata: 
  elasticsearch:
  kibana_data:
  logstash_data:
  product_receiver_data:

networks:
  shared-network:
    external: true
```

**Notes:**

- **`search-service` Service:**
  - **`SEARCH_SERVICE_PORT`**: Port on which the service listens (default: `4001`).
  - **`ELASTICSEARCH_URL`**: URL for Elasticsearch (default: `http://elasticsearch:9200`).
  - **`REMOTE_DATABASE_URL`**: URL for the remote PostgreSQL database.
  - **`RUST_LOG`**: Log level (e.g., `debug`).

- **Other Services:**
  - **`web-client`**: Application frontend.
  - **`auth-service`**: Authentication service.
  - **`product-receiver-service`**: Service for receiving products.
  - **`db`**: PostgreSQL database.
  - **`adminer`**: Interface for database management.
  - **`uptime-kuma`**: Uptime monitoring.
  - **`traefik`**: Reverse proxy and load balancer.
  - **`elasticsearch`**: Search engine.
  - **`logstash`**: Log processing pipeline.
  - **`kibana`**: Dashboard for Elasticsearch.
  - **`notification-alert`**: Notification and alert service.
  - **`scraping-service`**: Data scraping service.

- **Volumes:**
  - **Data persistence** for PostgreSQL, Elasticsearch, Kibana, Logstash, and `product-receiver-service`.

- **Networks:**
  - Uses an external shared network (`shared-network`) for communication between services.

### **4.3 `search-service` Dockerfile**

The `Dockerfile` for `search-service` is configured to build the application in release mode, optimizing performance, and setting the necessary environment variables.

```dockerfile
# search-service/Dockerfile

FROM rust:1.81

WORKDIR /app

COPY Cargo.toml .
COPY src ./src

RUN cargo build --release

EXPOSE 4001

CMD ["sh", "-c", "echo REMOTE_DATABASE_URL=$REMOTE_DATABASE_URL && ./target/release/search-service"]
```

**Description:**

- **Build in Release Mode:** Uses `cargo build --release` to optimize application performance.
- **Expose Port:** Exposes port `4001` to allow external access to the service.
- **Set Environment Variables:** Prints the `REMOTE_DATABASE_URL` variable at startup to verify correct configuration.

---

## **5. API Testing**

### **5.1 Indexing Verification**

Verify that all products are correctly indexed in Elasticsearch.

**Command:**

```bash
curl -X GET "http://localhost:9200/products/_search?pretty"
```

**Expected Response:**

```json
{
  "took" : 6,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 4,
      "relation" : "eq"
    },
    "max_score" : 1.0,
    "hits" : [
      {
        "_index" : "products",
        "_id" : "1",
        "_score" : 1.0,
        "_source" : {
          "name" : "pasta_barilla_spaghetti_500g",
          "full_name" : "Pasta Barilla Spaghetti 500g",
          "description" : "Spaghetti Barilla 500g",
          "price" : 1.2,
          "discount" : 0.0,
          "quantity" : "500g",
          "image_url" : "http://example.com/img/pasta.jpg",
          "price_for_kg" : 2.4,
          "location" : {
            "lat" : 45.4642,
            "lon" : 9.19
          },
          "localization" : {
            "grocery" : "Carrefour Milano",
            "lat" : 45.4642,
            "lon" : 9.19,
            "street" : "Via Roma 10",
            "city" : "Milano",
            "zip_code" : "20100",
            "working_hours" : "08:00-21:00",
            "picks_up_in_store" : true
          }
        }
      },
      // Other products...
    ]
  }
}
```

### **5.2 Testing `/search` Endpoint**

**Description:**
Performs a search for the most similar products based on the provided query.

**Request:**

```bash
curl -X GET "http://localhost:4001/search?query=mozzarella"
```

**Expected Response:**

```json
{
  "most_similar": [
    {
      "_id": "2",
      "name": "mozzarella_fresca_125g",
      "full_name": "Mozzarella fresca 125g",
      "description": "Mozzarella di latte vaccino",
      "price": 1.2,
      "discount": 0.1,
      "localization": {
        "grocery": "Esselunga Milano",
        "lat": 45.472,
        "lon": 9.2
      },
      "distance": null
    }
  ],
  "lowest_price": [
    {
      "_id": "2",
      "name": "mozzarella_fresca_125g",
      "full_name": "Mozzarella fresca 125g",
      "description": "Mozzarella di latte vaccino",
      "price": 1.2,
      "discount": 0.1,
      "localization": {
        "grocery": "Esselunga Milano",
        "lat": 45.472,
        "lon": 9.2
      },
      "distance": null
    }
  ]
}
```

### **5.3 Testing `/product/exists` Endpoint**

**Description:**
Checks if a product exists near a specific location.

**Request:**

```bash
curl -X POST "http://localhost:4001/product/exists" \
  -H "Content-Type: application/json" \
  -d '{
    "product": "pasta_barilla_spaghetti_500g",
    "position": {
      "latitude": 45.4642,
      "longitude": 9.19
    }
  }'
```

**Expected Response:**

```json
{
  "product": "pasta_barilla_spaghetti_500g",
  "exists": true,
  "details": {
    "_id": "1",
    "name": "pasta_barilla_spaghetti_500g",
    "full_name": "Pasta Barilla Spaghetti 500g",
    "description": "Spaghetti Barilla 500g",
    "price": 1.2,
    "discount": 0.0,
    "localization": {
      "grocery": "Carrefour Milano",
      "lat": 45.4642,
      "lon": 9.19
    },
    "distance": 0.0
  }
}
```

### **5.4 Testing `/product/in-shop` Endpoint**

**Description:**
Checks if a product is available in a specific shop.

**Request:**

```bash
curl -X POST "http://localhost:4001/product/in-shop" \
  -H "Content-Type: application/json" \
  -d '{
    "product": "tonno_in_scatola_marca_x_3x80g",
    "shop": "Carrefour Milano",
    "position": {
      "latitude": 45.4642,
      "longitude": 9.19
    }
  }'
```

**Expected Response:**

```json
{
  "product": "tonno_in_scatola_marca_x_3x80g",
  "shop": "Carrefour Milano",
  "exists": false,
  "details": null
}
```

### **5.5 Testing `/product/lowest-price` Endpoint**

**Description:**
Identifies the combination of stores offering the requested products at the lowest total price, based on the specified mode (`savings` or `convenience`).

#### **"savings" Mode**

**Request:**

```bash
curl -X POST "http://localhost:4001/product/lowest-price" \
  -H "Content-Type: application/json" \
  -d '{
    "products": [
      "pane_integrale_500g",
      "formaggio_grana_padano_1kg",
      "latte_parzialmente_scremato_1l"
    ],
    "position": {
      "latitude": 45.4642,
      "longitude": 9.1900
    },
    "mode": "savings"
  }'
```

**Expected Response:**

```json
[
  {
    "shop": "Carrefour Milano + Esselunga Milano",
    "total_price": 15.6,
    "products": [
      {
        "shop": "Carrefour Milano",
        "name": "pane_integrale_500g",
        "description": "Pane fresco integrale",
        "price": 2.5,
        "discount": 0.0,
        "distance": 0.0
      },
      {
        "shop": "Esselunga Milano",
        "name": "formaggio_grana_padano_1kg",
        "description": "Formaggio stagionato Grana Padano",
        "price": 12.0,
        "discount": 2.0,
        "distance": 0.0
      },
      {
        "shop": "Conad Milano",
        "name": "latte_parzialmente_scremato_1l",
        "description": "Latte fresco parzialmente scremato",
        "price": 1.1,
        "discount": 0.1,
        "distance": 0.0
      }
    ]
  }
]
```

**Note:** Currently, the "savings" mode returns an empty array (`[]`), indicating that no valid combination of stores covering all requested products was found.

---

## **6. Debugging the "Savings" Mode**

### **6.1 Problem Analysis**

The "savings" mode should return a combination of stores covering all requested products at the lowest total price. However, the empty response indicates that **no valid combination** was found.

### **6.2 Debugging Steps**

#### **A. Verify Logs in the `fetch_lowest_price_shops` Function**

Ensure that the `fetch_lowest_price_shops` function correctly retrieves prices for each product. Add logs to monitor intermediate data.

```rust
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
                                "fields": ["full_name", "name", "description"],
                                "type": "best_fields",
                                "fuzziness": "AUTO"
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
        tracing::info!("Retrieved prices for '{}': {:?}", product, shop_products);
        product_prices.insert(product.clone(), shop_products);
    }
    Ok(product_prices)
}
```

#### **B. Verify Logs in Building Store Combinations**

Add a log to display all created combinations.

```rust
tracing::info!("Store combinations: {:#?}", shop_combinations);
```

#### **C. Verify the Correctness of Elasticsearch Queries**

Manually execute a query for each product to verify the results.

**Example:**

```bash
curl -X POST "http://localhost:9200/products/_search" -H 'Content-Type: application/json' -d'
{
  "query": {
    "term": {
      "name.keyword": "pane_integrale_500g"
    }
  }
}
'
```

**Expected Response:**

The product "pane_integrale_500g" should be present in the index.

#### **D. Verify the Logic of the `find_lowest_price` Function**

Ensure that the store combination is correctly built to cover all requested products. Add logs to monitor combinations and choices made.

```rust
tracing::info!("Best single: {:?}", best_single);
tracing::info!("Best pair: {:?}", best_pair);
```

### **6.3 Potential Solutions**

1. **Verify the Correctness of Product Names in Queries**

   Ensure that the product names in the JSON request exactly match those indexed, including case sensitivity.

2. **Ensure Products Are Available in Specified Geographic Areas**

   The `geo_distance` settings in queries may limit results if products are not available within the specified radius.

3. **Increase Test Coverage**

   Add more products and stores to make tests more realistic. For example, products available in multiple stores.

4. **Verify Store Combination Logic**

   Ensure that the `find_lowest_price` function correctly combines stores to cover all required products.

5. **Inspect Logs of Elasticsearch and the Search Service**

   Check logs for any errors or unexpected data that may indicate where the issue is occurring.

6. **Perform Manual Elasticsearch Query Tests**

   Manually execute Elasticsearch queries to ensure they return expected results.

   **Example:**

   ```bash
   curl -X POST "http://localhost:9200/products/_search" -H 'Content-Type: application/json' -d'
   {
     "query": {
       "bool": {
         "must": [
           { "term": { "name.keyword": "pane_integrale_500g" } },
           { "term": { "name.keyword": "formaggio_grana_padano_1kg" } },
           { "term": { "name.keyword": "latte_parzialmente_scremato_1l" } }
         ]
       }
     }
   }
   '
   ```

   **Expected Response:**

   Probably no results, as no single store offers all three products. This is expected, and the combination logic should handle this situation.

---

## **7. Final Considerations**

### **7.1 Key Points**

- **Correct Mapping:** A detailed mapping with a `normalizer` for `keyword` type fields has been defined.
- **Product Insertion:** Products have been correctly inserted with all required fields.
- **Search Service:** The search service uses Axum and interacts with Elasticsearch to execute queries.
- **"Savings" Mode Not Working:** The empty response indicates an issue in store combination logic or Elasticsearch queries.

### **7.2 Action List (TODO LIST)**

1. **Add Detailed Logs:**
   - Improve logging in search functions to monitor intermediate data.
   - For example, log `product_prices` and `shop_combinations`.

2. **Manually Execute Elasticsearch Queries:**
   - Verify that queries return expected results for each product.
   - Ensure that products are indeed available in the specified geographic areas.

3. **Inspect Store Combination Logic:**
   - Check that the `find_lowest_price` function correctly combines stores to cover all required products.
   - Ensure there are no logical errors in counting products covered by each combination.

4. **Increase Product and Store Variety for Testing "Savings" Mode:**
   - Add products available in multiple stores to make combinations more realistic.

5. **Validate Geographic Coordinates:**
   - Ensure that the stores' geographic coordinates are correct and fall within the specified query radius (`geo_distance`).

6. **Review Rust Code:**
   - Check that all functions are implemented correctly and that filters are appropriate.

### **7.3 Example of Additional Logs in the Code**

To facilitate debugging, it is advisable to add detailed logs in the search functions.

```rust
// After retrieving prices for each product
tracing::info!("Retrieved prices for '{}': {:#?}", product, shop_products);

// After building the store combinations map
tracing::info!("Store combinations: {:#?}", shop_combinations);

// Before comparing combinations
tracing::info!("Best single: {:?}", best_single);
tracing::info!("Best pair: {:?}", best_pair);
```

### **7.4 Example of Manual Query for Debugging**

**Verify Product Availability:**

```bash
curl -X POST "http://localhost:9200/products/_search" -H 'Content-Type: application/json' -d'
{
  "query": {
    "term": {
      "name.keyword": "pane_integrale_500g"
    }
  }
}
'
```

**Expected Response:**

The product "pane_integrale_500g" should be present in the index.

**Verify Availability of All Products in a Single Store:**

```bash
curl -X POST "http://localhost:9200/products/_search" -H 'Content-Type: application/json' -d'
{
  "query": {
    "bool": {
      "must": [
        { "term": { "name.keyword": "pane_integrale_500g" } },
        { "term": { "name.keyword": "formaggio_grana_padano_1kg" } },
        { "term": { "name.keyword": "latte_parzialmente_scremato_1l" } }
      ]
    }
  }
}
'
```

**Expected Response:**

Probably no results, as no single store offers all three products. This is expected, and the combination logic should handle this situation.

---

**Thank you** for using the **search-service**! If you have any questions or encounter issues, please contact the development team or open an issue in the relevant repository.

---