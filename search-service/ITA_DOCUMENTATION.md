---

# Documentazione Tecnica: `search-service`

---

## **Indice della Documentazione**

1. [Configurazione di Elasticsearch](#1-configurazione-di-elasticsearch)
   - [Creazione dell'Indice con Mapping e Settings](#creazione-dellindice-con-mapping-e-settings)
   - [Inserimento dei Prodotti](#inserimento-dei-prodotti)
2. [Struttura del Servizio di Ricerca (`search-service`)](#2-struttura-del-servizio-di-ricerca-search-service)
   - [Modelli (`models.rs`)](#modelli-modelsrs)
   - [Handler (`handlers.rs`)](#handler-handlersrs)
   - [Funzioni di Ricerca (`search.rs`)](#funzioni-di-ricerca-searchrs)
   - [Utility (`utils.rs`)](#utility-utilsrs)
   - [Main (`main.rs`)](#main-mainrs)
3. [Dipendenze di Cargo](#3-dipendenze-di-cargo)
4. [Configurazione di Docker Compose](#4-configurazione-di-docker-compose)
   - [Servizio `search-service`](#servizio-search-service)
   - [Altri Servizi](#altri-servizi)
   - [Dockerfile del `search-service`](#dockerfile-del-search-service)
5. [Test delle API](#5-test-delle-api)
   - [Verifica Indicizzazione](#verifica-indicizzazione)
   - [Test Endpoint `/search`](#test-endpoint-search)
   - [Test Endpoint `/product/exists`](#test-endpoint-productexists)
   - [Test Endpoint `/product/in-shop`](#test-endpoint-productin-shop)
   - [Test Endpoint `/product/lowest-price`](#test-endpoint-productlowest-price)
6. [Debug della Modalità "Risparmio"](#6-debug-della-modalità-risparmio)
   - [Analisi del Problema](#analisi-del-problema)
   - [Passaggi di Debug](#passaggi-di-debug)
   - [Soluzioni Potenziali](#soluzioni-potenziali)
7. [Considerazioni Finali](#7-considerazioni-finali)

---

## **1. Configurazione di Elasticsearch**

### **1.1 Creazione dell'Indice con Mapping e Settings**

È stata creata un'indice Elasticsearch denominata `products` con configurazioni specifiche per gestire correttamente i campi di testo e le query di ricerca. È stato definito un `normalizer` per garantire ricerche case-insensitive sui campi di tipo `keyword`.

**Comando per la Creazione dell'Indice:**

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
      // Aggiungere ulteriori campi se necessario
    }
  }
}
'
```

**Risposta Attesa:**

```json
{
  "acknowledged": true,
  "shards_acknowledged": true,
  "index": "products"
}
```

**Descrizione:**

- **`normalizer`**: Applicabile ai campi di tipo `keyword`, garantisce ricerche case-insensitive.
- **`analyzer`**: Configurato per i campi di tipo `text`. L'analizzatore `whitespace_analyzer` suddivide il testo in token basandosi sugli spazi e applica il filtro `lowercase`.
- **Campi Geolocalizzazione**: Il campo `location` è di tipo `geo_point` per permettere query geografiche.

### **1.2 Inserimento dei Prodotti**

I prodotti sono stati inseriti nell'indice `products` seguendo la struttura definita nel mapping.

**Esempi di Inserimento di Prodotti:**

#### **Prodotto 1: Pasta Barilla Spaghetti 500g**

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

#### **Prodotto 2: Mozzarella Fresca 125g**

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

#### **Prodotto 3: Latte Intero 1L**

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

#### **Prodotto 4: Pane Integrale 500g**

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

**Risposta Attesa per Ogni Inserimento:**

```json
{
  "_index": "products",
  "_id": "1", // O "2", "3", "4" a seconda del prodotto
  "_version": 1,
  "result": "created", // O "updated" se si tratta di un aggiornamento
  "_shards": {
    "total": 2,
    "successful": 1,
    "failed": 0
  },
  "_seq_no": 0, // Incrementa con ogni inserimento
  "_primary_term": 1
}
```

---

## **2. Struttura del Servizio di Ricerca (`search-service`)**

Il servizio di ricerca è sviluppato in **Rust** utilizzando il framework **Axum** per la gestione delle API e **Elasticsearch** come motore di ricerca. La struttura del progetto è suddivisa nei seguenti componenti principali:

### **2.1 Modelli (`models.rs`)**

Definiscono le strutture dati utilizzate all'interno del servizio, rappresentando i dati provenienti dal database e quelli elaborati dalle API.

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

/// Parametri della query di ricerca
#[derive(Deserialize)]
pub struct SearchQuery {
    pub query: String,
}

/// Struttura per ogni risultato di prodotto
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

/// Informazioni di localizzazione per ogni prodotto
#[derive(Debug, Serialize, Clone)]
pub struct Localization {
    pub grocery: String,
    pub lat: f64,
    pub lon: f64,
}

/// Struttura per organizzare la risposta finale
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
    pub mode: Option<String>,  // "risparmio" | "comodita" (o altro)
}

#[derive(Debug, Serialize, Clone)]
pub struct LowestPriceResponse {
    pub shop: String,               // Nome del negozio
    pub total_price: f64,           // Prezzo totale per i prodotti da questo negozio
    pub products: Vec<ShopProduct>, // Lista dei prodotti acquistati da questo negozio
}

#[derive(Debug, Serialize, Clone)]
pub struct ShopProduct {
    pub shop: String,          // Nome del negozio
    pub name: String,          // Nome del prodotto
    pub description: String,   // Descrizione del prodotto
    pub price: f64,            // Prezzo del prodotto
    pub discount: Option<f64>, // Sconto sul prodotto, se applicabile
    pub distance: f64,         // Distanza dall'utente al negozio
}
```

### **2.2 Handler (`handlers.rs`)**

Gestiscono le richieste HTTP, orchestrano le interazioni con le funzioni di ricerca e restituiscono le risposte appropriate.

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
            tracing::error!("Errore nel recupero dei prodotti più simili: {:?}", e);
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({ "error": "Errore interno del server" })),
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
            tracing::error!("Errore nel recupero del prodotto: {:?}", e);
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({ "error": "Errore interno del server" })),
            ))
        }
    };

    tracing::info!("Prodotti trovati: {:#?}", products);
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
            tracing::error!("Errore nel recupero del prodotto: {:?}", e);
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({ "error": "Errore interno del server" })),
            ))
        }
    };

    tracing::info!("Prodotti trovati: {:#?}", products);
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
    // Step 1: Recupera i prezzi dei prodotti dai negozi vicini tramite Elasticsearch
    let product_prices = match fetch_lowest_price_shops(
        &app_state,
        &payload.products,
        payload.position.latitude,
        payload.position.longitude
    )
    .await
    {
        Ok(prices) => {
            tracing::info!("Recuperati i prezzi dei prodotti da Elasticsearch con successo.");
            prices
        },
        Err(e) => {
            tracing::error!("Errore nel recupero dei prodotti da Elasticsearch: {:?}", e);
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "error": "Errore interno del server" })),
            ));
        }
    };

    tracing::debug!("Prezzi dei prodotti recuperati: {:?}", product_prices);

    // Step 2: Costruzione della mappa "nome_negozio -> elenco di ShopProduct"
    let mut shop_combinations: HashMap<String, Vec<ShopProduct>> = HashMap::new();

    for (product_name, product_list) in &product_prices {
        tracing::debug!("Elaborazione del prodotto: {}", product_name);
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
                "Aggiunto ShopProduct a '{}': {:?}",
                product_result.localization.grocery,
                shop_combinations[&product_result.localization.grocery].last()
            );
        }
    }

    tracing::info!("Combinazioni dei negozi costruite: {:?}", shop_combinations);

    // Step 3: Determinazione della modalità ("risparmio" o "comodita")
    let mode = payload.mode.as_deref().unwrap_or("comodita"); 
    tracing::info!("Modalità selezionata: {}", mode);

    let required_products = &payload.products;
    let required_count = required_products.len();
    tracing::debug!("Prodotti richiesti: {:?} (numero: {})", required_products, required_count);

    // Vettore finale di LowestPriceResponse da restituire
    let mut results: Vec<LowestPriceResponse> = Vec::new();

    match mode {
        "risparmio" => {
            tracing::info!("Elaborazione in modalità 'risparmio'.");
            // Modalità "Risparmio"

            // (A) Verifica esistenza di un singolo negozio che possiede tutti i prodotti
            let mut best_single: Option<LowestPriceResponse> = None;

            for (shop_name, products_in_shop) in &shop_combinations {
                tracing::debug!("Verifica negozio singolo: {}", shop_name);
                let found_names: HashSet<String> = products_in_shop
                    .iter()
                    .map(|sp| sp.name.clone())
                    .collect();
                tracing::debug!("Prodotti trovati in '{}': {:?}", shop_name, found_names);

                let match_count = required_products.iter()
                    .filter(|needed| found_names.contains(*needed))
                    .count();

                tracing::debug!(
                    "Negozi '{}': match_count = {} (richiesto: {})",
                    shop_name,
                    match_count,
                    required_count
                );

                if match_count == required_count {
                    let total_price: f64 = products_in_shop.iter().map(|p| p.price).sum();
                    tracing::info!(
                        "Negozi '{}' possiede tutti i prodotti richiesti con prezzo totale: {}",
                        shop_name,
                        total_price
                    );
                    if let Some(ref mut current_best) = best_single {
                        if total_price < current_best.total_price {
                            tracing::debug!(
                                "Trovato un negozio singolo migliore: '{}' (precedente: {})",
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
                        tracing::debug!("Impostato best_single iniziale a '{}'", shop_name);
                    }
                }
            }

            // (B) Ricerca di combinazioni di due negozi che coprono tutti i prodotti al prezzo minore
            let shop_names: Vec<String> = shop_combinations.keys().cloned().collect();
            tracing::debug!("Negozi disponibili per la combinazione: {:?}", shop_names);
            let mut best_pair: Option<LowestPriceResponse> = None;

            for i in 0..shop_names.len() {
                for j in (i+1)..shop_names.len() {
                    let shop1 = &shop_names[i];
                    let shop2 = &shop_names[j];
                    tracing::debug!("Verifica combinazione negozi: '{}' + '{}'", shop1, shop2);

                    let products_in_shop1 = &shop_combinations[shop1];
                    let products_in_shop2 = &shop_combinations[shop2];

                    // Unione dei prodotti dei due negozi
                    let mut combined_products = products_in_shop1.clone();
                    combined_products.extend(products_in_shop2.clone());

                    // Costruzione del set di nomi prodotti combinati
                    let found_names: HashSet<String> = combined_products
                        .iter()
                        .map(|sp| sp.name.clone())
                        .collect();
                    tracing::debug!(
                        "Prodotti combinati per '{}' + '{}': {:?}",
                        shop1,
                        shop2,
                        found_names
                    );

                    // Verifica copertura dei prodotti richiesti
                    let match_count = required_products.iter()
                        .filter(|needed| found_names.contains(*needed))
                        .count();
                    
                    tracing::debug!(
                        "Combinazione '{} + {}': match_count = {} (richiesto: {})",
                        shop1,
                        shop2,
                        match_count,
                        required_count
                    );

                    if match_count == required_count {
                        let total_price: f64 = combined_products.iter().map(|p| p.price).sum();
                        tracing::info!(
                            "Combinazione '{} + {}' copre tutti i prodotti con prezzo totale: {}",
                            shop1,
                            shop2,
                            total_price
                        );
                        if let Some(ref mut current_best) = best_pair {
                            if total_price < current_best.total_price {
                                tracing::debug!(
                                    "Trovata combinazione di negozi migliore: '{}' + '{}' (precedente: {})",
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
                            tracing::debug!(
                                "Impostata best_pair iniziale a '{} + {}'",
                                shop1,
                                shop2
                            );
                        }
                    }
                }
            }

            // (C) Confronto tra singolo negozio e combinazione di due negozi
            match (best_single, best_pair) {
                (Some(s), Some(p)) => {
                    tracing::info!(
                        "Confronto tra best_single (negozio: '{}', prezzo totale: {}) e best_pair (negozi: '{}', prezzo totale: {})",
                        s.shop,
                        s.total_price,
                        p.shop,
                        p.total_price
                    );
                    if s.total_price <= p.total_price {
                        tracing::info!("Selezionato best_single: '{}'", s.shop);
                        results.push(s);
                    } else {
                        tracing::info!("Selezionata best_pair: '{}'", p.shop);
                        results.push(p);
                    }
                }
                (Some(s), None) => {
                    tracing::info!("Disponibile solo best_single: '{}'", s.shop);
                    results.push(s);
                }
                (None, Some(p)) => {
                    tracing::info!("Disponibile solo best_pair: '{}'", p.shop);
                    results.push(p);
                }
                (None, None) => {
                    tracing::warn!("Nessun negozio singolo o combinazione di negozi copre tutti i prodotti richiesti.");
                }
            }
        }

        "comodita" => {
            tracing::info!("Elaborazione in modalità 'comodita'.");
            // Modalità "Comodità"

            let mut best_option: Option<LowestPriceResponse> = None;

            for (shop_name, products_in_shop) in &shop_combinations {
                tracing::debug!("Verifica negozio per 'comodita': {}", shop_name);
                let found_names: HashSet<String> = products_in_shop
                    .iter()
                    .map(|sp| sp.name.clone())
                    .collect();
                tracing::debug!("Prodotti trovati in '{}': {:?}", shop_name, found_names);

                let match_count = required_products.iter()
                    .filter(|needed| found_names.contains(*needed))
                    .count();

                tracing::debug!(
                    "Negozi '{}': match_count = {} (richiesto: {})",
                    shop_name,
                    match_count,
                    required_count
                );

                if match_count == required_count {
                    let total_price: f64 = products_in_shop.iter().map(|p| p.price).sum();
                    tracing::info!(
                        "Negozi '{}' possiede tutti i prodotti richiesti con prezzo totale: {}",
                        shop_name,
                        total_price
                    );

                    if let Some(ref mut current_best) = best_option {
                        if total_price < current_best.total_price {
                            tracing::debug!(
                                "Trovata opzione 'comodita' migliore: '{}' (precedente: {})",
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
                        tracing::debug!("Impostata best_option iniziale a '{}'", shop_name);
                    }
                }
            }

            if let Some(best) = best_option {
                tracing::info!("Selezionata migliore opzione 'comodita': '{}'", best.shop);
                results.push(best);
            } else {
                tracing::warn!("Nessun negozio singolo copre tutti i prodotti richiesti in modalità 'comodita'.");
            }
        }

        _ => {
            tracing::warn!("Modalità '{}' sconosciuta ricevuta. Defaulting a 'comodita'.", mode);
            // Implementare la logica di default o restituire un errore
        }
    }

    if results.is_empty() {
        tracing::info!("Nessuna combinazione valida di negozi trovata per coprire tutti i prodotti.");
    } else {
        tracing::info!("Restituzione dei risultati: {:?}", results);
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
        eprintln!("Errore nella query del database: {:?}", e);
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
        eprintln!("Errore nella query del database: {:?}", e);
        axum::http::StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok(Json(products))
}
```

### **2.3 Funzioni di Ricerca (`search.rs`)**

Contengono le funzioni che interagiscono con Elasticsearch per eseguire le query di ricerca, recuperare prodotti simili, prezzi più bassi e verificare la disponibilità dei prodotti nei negozi.

```rust
use crate::models::{Localization, ProductResult};
use crate::AppState;
use elasticsearch::SearchParts;
use serde_json::json;
use std::collections::HashMap;
use std::collections::HashSet;
use std::sync::Arc;

/// Recupera i prodotti più simili alla query fornita
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

/// Recupera i prodotti con il prezzo più basso, escludendo determinati ID
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

/// Recupera un prodotto vicino a una posizione specifica
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

/// Recupera un prodotto specifico in uno shop specifico
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

/// Recupera i prezzi di ogni prodotto presso negozi vicini
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

/// Funzione di supporto per il parsing della risposta di Elasticsearch in un vettore di `ProductResult`
pub async fn parse_response(
    response: elasticsearch::http::response::Response,
) -> Result<Vec<ProductResult>, Box<dyn std::error::Error + Send + Sync>> {
    let json_resp = response.json::<serde_json::Value>().await?;
    tracing::debug!("Risposta Elasticsearch: {:#?}", json_resp);
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

Contiene funzioni di supporto, tra cui il calcolo della distanza tra due punti geografici utilizzando la formula dell'Haversine.

```rust
/// Calcola la distanza tra due punti geografici utilizzando la formula di Haversine.
/// 
/// # Parametri
/// - `lat1`: Latitudine del primo punto.
/// - `lon1`: Longitudine del primo punto.
/// - `lat2`: Latitudine del secondo punto.
/// - `lon2`: Longitudine del secondo punto.
/// 
/// # Ritorna
/// - Distanza in chilometri.
pub fn haversine_distance(lat1: f64, lon1: f64, lat2: f64, lon2: f64) -> f64 {
    let r = 6371.0; // Raggio della Terra in chilometri
    let dlat = (lat2 - lat1).to_radians();
    let dlon = (lon2 - lon1).to_radians();
    let a = (dlat / 2.0).sin().powi(2)
        + lat1.to_radians().cos()
            * lat2.to_radians().cos()
            * (dlon / 2.0).sin().powi(2);
    let c = 2.0 * a.sqrt().atan2((1.0 - a).sqrt());
    r * c // Distanza in chilometri
}
```

### **2.5 Main (`main.rs`)**

Configura l'applicazione Axum, definisce le rotte, inizializza Elasticsearch e il pool di connessione al database PostgreSQL, e avvia il server.

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

/// Struttura dello stato dell'applicazione condiviso tra le rotte
pub struct AppState {
    client: Mutex<Elasticsearch>,
    db_pool: sqlx::PgPool,
}

#[tokio::main]
async fn main() {
    // Inizializzazione del logger
    tracing_subscriber::fmt()
        .with_target(false)
        .with_level(true)
        .pretty()
        .init();

    // Inizializzazione del client Elasticsearch
    let transport =
        elasticsearch::http::transport::Transport::single_node("http://elasticsearch:9200")
            .expect("Errore nella creazione del trasporto Elasticsearch");
    
    // Recupero dell'URL del database remoto dalle variabili d'ambiente
    let database_url = std::env::var("REMOTE_DATABASE_URL")
        .expect("REMOTE_DATABASE_URL deve essere impostato per connettersi al database remoto");
        
    println!("Connessione al database all'URL: {}", database_url);

    // Connessione al database PostgreSQL
    let db_pool = sqlx::PgPool::connect(&database_url)
        .await
        .expect("Connessione al database fallita");
    
    // Creazione dello stato dell'applicazione
    let app_state = Arc::new(AppState {
        client: Mutex::new(Elasticsearch::new(transport)),
        db_pool,
    });

    // Configurazione del router Axum con le rotte e lo stato condiviso
    let app = Router::new()
        .route("/search", get(handlers::search_handler))
        .route("/product/exists", post(handlers::check_product_exist))
        .route("/product/in-shop", post(handlers::search_product_in_shop))
        .route("/product/lowest-price", post(handlers::find_lowest_price))
        .route("/stores", get(handlers::get_all_stores))
        .route("/store/:id/products", get(handlers::get_products_by_store))
        .with_state(app_state);

    // Avvio del server sulla porta specificata
    let port = std::env::var("SEARCH_SERVICE_PORT").unwrap_or_else(|_| "4001".to_string());
    let url = format!("0.0.0.0:{port}");
    let listener = tokio::net::TcpListener::bind(url).await.expect("Errore nel binding della porta");
    println!("Servizio di ricerca avviato sulla porta {}", port);
    axum::serve(listener, app).await.unwrap();
}
```

---

## **3. Dipendenze di Cargo**

Il file `Cargo.toml` definisce le dipendenze necessarie per il progetto `search-service`.

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
hyper = "0.14"  # Aggiunto per compatibilità con Axum
sqlx = { version = "0.7", features = ["postgres", "runtime-tokio-native-tls"] }
aide = "0.13.4"
```

**Note:**

- **`axum` e `axum-macros`**: Framework per la costruzione di API HTTP in Rust.
- **`elasticsearch`**: Client per interagire con Elasticsearch.
- **`reqwest`**: Client HTTP asincrono.
- **`serde` e `serde_json`**: Serializzazione e deserializzazione dei dati.
- **`tokio`**: Runtime asincrono per Rust.
- **`tower-http`**: Middleware per Axum.
- **`tracing` e `tracing-subscriber`**: Logging e tracciamento delle operazioni.
- **`hyper`**: Aggiunto per garantire la compatibilità con Axum.
- **`sqlx`**: Interazione asincrona con PostgreSQL.
- **`aide`**: Generazione automatica della documentazione delle API.

---

## **4. Configurazione di Docker Compose**

La configurazione di Docker Compose definisce i vari servizi necessari per l'applicazione, inclusi `search-service`, Elasticsearch, PostgreSQL e altri servizi ausiliari.

### **4.1 Servizio `search-service`**

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
      - REMOTE_DATABASE_URL=${REMOTE_DATABASE_URL}  # Impostato per puntare al DB remoto
      - RUST_LOG=debug  # Imposta il livello di log a DEBUG
```

### **4.2 Altri Servizi**

La configurazione completa include servizi aggiuntivi come `web-client`, `auth-service`, `product-receiver-service`, `db` (PostgreSQL), `adminer`, `uptime-kuma`, `traefik`, `elasticsearch`, `logstash`, `kibana`, `notification-alert`, e `scraping-service`.

**Configurazione Completa di Docker Compose:**

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
      - "8080:8080" # Dashboard (non utilizzare in produzione)
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

**Note:**

- **Servizio `search-service`:**
  - **`SEARCH_SERVICE_PORT`**: Porta su cui il servizio ascolta (default: `4001`).
  - **`ELASTICSEARCH_URL`**: URL di Elasticsearch (default: `http://elasticsearch:9200`).
  - **`REMOTE_DATABASE_URL`**: URL del database remoto PostgreSQL.
  - **`RUST_LOG`**: Livello di log (es. `debug`).

- **Altri Servizi:**
  - **`web-client`**: Frontend dell'applicazione.
  - **`auth-service`**: Servizio di autenticazione.
  - **`product-receiver-service`**: Servizio per la ricezione dei prodotti.
  - **`db`**: Database PostgreSQL.
  - **`adminer`**: Interfaccia per la gestione del database.
  - **`uptime-kuma`**: Monitoraggio dell'uptime.
  - **`traefik`**: Reverse proxy e load balancer.
  - **`elasticsearch`**: Motore di ricerca.
  - **`logstash`**: Pipeline di elaborazione dei log.
  - **`kibana`**: Dashboard per Elasticsearch.
  - **`notification-alert`**: Servizio per notifiche e alert.
  - **`scraping-service`**: Servizio per lo scraping dei dati.

- **Volumes:**
  - **Persistenza dei dati** per PostgreSQL, Elasticsearch, Kibana, Logstash e `product-receiver-service`.

- **Networks:**
  - Utilizzo di una rete condivisa esterna (`shared-network`) per la comunicazione tra i servizi.

### **4.3 Dockerfile del `search-service`**

Il `Dockerfile` per il `search-service` è configurato per costruire l'applicazione in modalità release, ottimizzando le prestazioni, e impostare le variabili d'ambiente necessarie.

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

**Descrizione:**

- **Compilazione in Modalità Release:** Utilizzo di `cargo build --release` per ottimizzare le prestazioni dell'applicazione.
- **Esposizione della Porta:** Porta `4001` esposta per consentire l'accesso esterno al servizio.
- **Impostazione delle Variabili d'Ambiente:** Stampa della variabile `REMOTE_DATABASE_URL` all'avvio per verificare la corretta configurazione.

---

## **5. Test delle API**

### **5.1 Verifica Indicizzazione**

Verificare che tutti i prodotti siano correttamente indicizzati in Elasticsearch.

**Comando:**

```bash
curl -X GET "http://localhost:9200/products/_search?pretty"
```

**Risposta Attesa:**

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
      // Altri prodotti...
    ]
  }
}
```

### **5.2 Test Endpoint `/search`**

**Descrizione:**
Esegue una ricerca dei prodotti più simili alla query fornita.

**Richiesta:**

```bash
curl -X GET "http://localhost:4001/search?query=mozzarella"
```

**Risposta Attesa:**

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

### **5.3 Test Endpoint `/product/exists`**

**Descrizione:**
Verifica l'esistenza di un prodotto vicino a una posizione specifica.

**Richiesta:**

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

**Risposta Attesa:**

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

### **5.4 Test Endpoint `/product/in-shop`**

**Descrizione:**
Verifica l'esistenza di un prodotto in uno specifico negozio.

**Richiesta:**

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

**Risposta Attesa:**

```json
{
  "product": "tonno_in_scatola_marca_x_3x80g",
  "shop": "Carrefour Milano",
  "exists": false,
  "details": null
}
```

### **5.5 Test Endpoint `/product/lowest-price`**

**Descrizione:**
Identifica la combinazione di negozi che offre i prodotti richiesti al prezzo più basso, in base alla modalità specificata (`risparmio` o `comodita`).

#### **Modalità "risparmio"**

**Richiesta:**

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
    "mode": "risparmio"
  }'
```

**Risposta Attesa:**

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

**Nota:** Attualmente, la modalità "risparmio" restituisce un array vuoto (`[]`), indicando che non viene trovata alcuna combinazione valida di negozi che copre tutti i prodotti richiesti.

---

## **6. Debug della Modalità "Risparmio"**

### **6.1 Analisi del Problema**

La modalità "risparmio" dovrebbe restituire una combinazione di negozi che copre tutti i prodotti richiesti al prezzo totale più basso. Tuttavia, la risposta vuota indica che **non viene trovata alcuna combinazione valida**.

### **6.2 Passaggi di Debug**

#### **A. Verifica Log nella Funzione `fetch_lowest_price_shops`**

Assicurarsi che la funzione `fetch_lowest_price_shops` recuperi correttamente i prezzi per ogni prodotto. Aggiungere log per monitorare i dati intermedi.

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
        tracing::info!("Recuperati prezzi per '{}': {:?}", product, shop_products);
        product_prices.insert(product.clone(), shop_products);
    }
    Ok(product_prices)
}
```

#### **B. Verifica Log nella Costruzione delle Combinazioni**

Aggiungere un log per visualizzare tutte le combinazioni create.

```rust
tracing::info!("Combinazioni dei negozi: {:#?}", shop_combinations);
```

#### **C. Verifica la Correttezza delle Query di Elasticsearch**

Eseguire manualmente una query per ciascun prodotto per verificarne i risultati.

**Esempio:**

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

**Risposta Attesa:**

Il prodotto "pane_integrale_500g" dovrebbe essere presente nell'indice.

#### **D. Verifica la Logica della Funzione `find_lowest_price`**

Assicurarsi che la combinazione di negozi venga costruita correttamente per coprire tutti i prodotti richiesti. Aggiungere log per monitorare le combinazioni e le scelte effettuate.

```rust
tracing::info!("Best single: {:?}", best_single);
tracing::info!("Best pair: {:?}", best_pair);
```

### **6.3 Soluzioni Potenziali**

1. **Verifica la Correttezza dei Nomi dei Prodotti nelle Query**

   Assicurarsi che i nomi dei prodotti nella richiesta JSON corrispondano esattamente a quelli indicizzati, inclusa la case sensitivity.

2. **Assicurarsi che i Prodotti Siano Disponibili nelle Zone Geografiche Specificate**

   La configurazione delle `geo_distance` nelle query potrebbe limitare i risultati se i prodotti non sono presenti entro il raggio specificato.

3. **Aumentare la Copertura dei Test**

   Aggiungere più prodotti e negozi per rendere i test più realistici. Ad esempio, prodotti disponibili in più negozi.

4. **Verificare la Logica di Combinazione dei Negozi**

   Assicurarsi che la funzione `find_lowest_price` combini correttamente i negozi per coprire tutti i prodotti richiesti.

5. **Ispezionare i Log di Elasticsearch e del Servizio di Ricerca**

   Controllare i log per eventuali errori o dati inattesi che possano indicare dove si verifica il problema.

6. **Eseguire Test Manuali delle Query**

   Eseguire manualmente le query di Elasticsearch per assicurarsi che restituiscano i risultati attesi.

   **Esempio:**

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

   **Risposta Attesa:**

   Probabilmente nessun risultato, poiché nessun singolo negozio offre tutti e tre i prodotti. Questo è atteso e la logica di combinazione dovrebbe gestire questa situazione.

---

## **7. Considerazioni Finali**

### **7.1 Punti Chiave**

- **Mapping Corretto:** È stato definito un mapping dettagliato con un `normalizer` per i campi di tipo `keyword`.
- **Inserimento Prodotti:** I prodotti sono stati inseriti correttamente con tutti i campi richiesti.
- **Servizio di Ricerca:** Il servizio di ricerca utilizza Axum e interagisce con Elasticsearch per eseguire le query.
- **Modalità "Risparmio" Non Funziona:** La risposta vuota indica un problema nella logica di combinazione dei negozi o nelle query Elasticsearch.

### **7.2 Lista delle Azioni da Svolgere (TODO LIST)**

1. **Aggiungere Log Dettagliati:**
   - Migliorare il logging nelle funzioni di ricerca per monitorare i dati intermedi.
   - Ad esempio, loggare `product_prices` e `shop_combinations`.

2. **Eseguire Manualmente le Query di Elasticsearch:**
   - Verificare che le query restituiscano i risultati attesi per ciascun prodotto.
   - Assicurarsi che i prodotti siano effettivamente disponibili nelle zone geografiche specificate.

3. **Ispezionare la Logica di Combinazione dei Negozi:**
   - Controllare che la funzione `find_lowest_price` combini correttamente i negozi per coprire tutti i prodotti richiesti.
   - Verificare che non vi siano errori logici nel conteggio dei prodotti coperti da ciascuna combinazione.

4. **Aumentare la Varietà dei Prodotti e dei Negozi per Testare la Modalità "Risparmio":**
   - Aggiungere prodotti disponibili in più negozi per rendere le combinazioni più realistiche.

5. **Validazione delle Coordinate Geografiche:**
   - Assicurarsi che le coordinate geografiche dei negozi siano corrette e che rientrino nel raggio specificato nelle query (`geo_distance`).

6. **Revisione del Codice Rust:**
   - Controllare che tutte le funzioni siano implementate correttamente e che i filtri siano appropriati.

### **7.3 Esempio di Log Aggiuntivi nel Codice**

Per facilitare il debug, è consigliabile aggiungere log dettagliati nelle funzioni di ricerca.

```rust
// Dopo aver recuperato i prezzi per ciascun prodotto
tracing::info!("Recuperati prezzi per '{}': {:#?}", product, shop_products);

// Dopo aver costruito la mappa delle combinazioni di negozi
tracing::info!("Combinazioni dei negozi: {:#?}", shop_combinations);

// Prima di confrontare le combinazioni
tracing::info!("Best single: {:?}", best_single);
tracing::info!("Best pair: {:?}", best_pair);
```

### **7.4 Esempio di Query Manuale per Debug**

**Verifica la Disponibilità dei Prodotti:**

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

**Risposta Attesa:**

Il prodotto "pane_integrale_500g" dovrebbe essere presente nell'indice.

**Verifica la Disponibilità di Tutti i Prodotti in un Singolo Negozio:**

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

**Risposta Attesa:**

Probabilmente: -> nessun risultato, poiché nessun singolo negozio offre tutti e tre i prodotti. Questo è atteso e la logica di combinazione dovrebbe gestire questa situazione.
---