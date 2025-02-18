# # (Alert! Documentation Expired) Comprehensive Test and Debug Guide for Products and Stores Management

This guide provides detailed instructions and **cURL** commands to test and debug the **Product Receiver Service**, **Logstash**, **Search-Service**, and **Elasticsearch** components of your system. It ensures proper data flow, indexing, and functionality by aligning with the actual API endpoints and data structures implemented in your services.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Resetting the Environment](#resetting-the-environment)
3. [Inserting Stores via Product Receiver API](#inserting-stores-via-product-receiver-api)
4. [Retrieving Store IDs](#retrieving-store-ids)
5. [Inserting Products via Product Receiver API](#inserting-products-via-product-receiver-api)
6. [Setting Up Elasticsearch Mappings](#setting-up-elasticsearch-mappings)
7. [Indexing Products and Stores into Elasticsearch](#indexing-products-and-stores-into-elasticsearch)
8. [Verifying Elasticsearch Indexing](#verifying-elasticsearch-indexing)
9. [Testing Search-Service Endpoints](#testing-search-service-endpoints)
10. [Additional Debugging Commands](#additional-debugging-commands)
11. [Summary of cURL Commands](#summary-of-curl-commands)
12. [Tips for Successful Testing](#tips-for-successful-testing)

---
**(Alert! Documentation Expired)**  
The documentation is currently under revision and updates. Some sections may be incomplete or undergoing modifications.
## Prerequisites

Before proceeding, ensure that all services are up and running. Use Docker Compose to start your services:

```bash
docker-compose up -d
```

Verify that all services are running:

```bash
docker-compose ps
```

Ensure the following ports are accessible:

- **Product Receiver Service**: `http://localhost:3002/api`
- **Elasticsearch**: `http://localhost:9200`
- **Search-Service**: `http://localhost:4001`
- **Logstash**: `http://localhost:5044`
- **Kibana**: `http://localhost:5601`
- **Adminer**: `http://localhost:8090`
- **Uptime Kuma**: `http://localhost:3003`

---

## Resetting the Environment

Before running tests, reset both the PostgreSQL database and Elasticsearch indices to ensure a clean state.

### 1. Reset PostgreSQL Database

**a. Access PostgreSQL via `psql`:**

```bash
docker exec -it <db_container_name> psql -U user -d appdb
```

**Replace `<db_container_name>` with your PostgreSQL container name (e.g., `db`).**

**b. Once inside `psql`, run the following commands to delete existing data:**

```sql
-- Delete from ProductHistory
DELETE FROM "ProductHistory";

-- Delete from Product
DELETE FROM "Product";

-- Delete from Localization
DELETE FROM "Localization";
```

**c. Exit `psql`:**

```sql
\q
```

### 2. Reset Elasticsearch Indices

Delete existing indices to avoid conflicts or outdated information.

```bash
# Delete Products Index
curl -X DELETE "http://localhost:9200/products"

# Delete Stores Index
curl -X DELETE "http://localhost:9200/stores"
```

---

## Inserting Stores via Product Receiver API

Insert **5 different stores** using the Product Receiver API.

### Store Data Structure

Each store should include the following fields:

- `name`: Name of the grocery store.
- `lat`: Latitude of the store location.
- `lng`: Longitude of the store location.
- `street`: Street address (nullable).
- `city`: City where the store is located (optional).
- `zip_code`: ZIP code (optional).
- `working_hours`: Operating hours (optional).
- `picks_up_in_shop`: Boolean indicating if in-store pickup is available (optional).

### cURL Commands

```bash
# Store 1
curl -X POST "http://localhost:3002/api/store" -H "Content-Type: application/json" -d '{
  "name": "Carrefour Milano",
  "lat": 45.4642,
  "lng": 9.19,
  "street": "Via Torino, 10",
  "city": "Milano",
  "zip_code": "20123",
  "working_hours": "08:00-20:00",
  "picks_up_in_shop": true
}'

# Store 2
curl -X POST "http://localhost:3002/api/store" -H "Content-Type: application/json" -d '{
  "name": "Esselunga Roma",
  "lat": 41.9028,
  "lng": 12.4964,
  "street": "Via del Corso, 50",
  "city": "Roma",
  "zip_code": "00186",
  "working_hours": "09:00-21:00",
  "picks_up_in_shop": false
}'

# Store 3
curl -X POST "http://localhost:3002/api/store" -H "Content-Type: application/json" -d '{
  "name": "Conad Napoli",
  "lat": 40.8518,
  "lng": 14.2681,
  "street": "Via Toledo, 200",
  "city": "Napoli",
  "zip_code": "80134",
  "working_hours": "07:00-22:00",
  "picks_up_in_shop": true
}'

# Store 4
curl -X POST "http://localhost:3002/api/store" -H "Content-Type: application/json" -d '{
  "name": "Iper La Grande Sconfitta Torino",
  "lat": 45.0703,
  "lng": 7.6869,
  "street": "Corso Inghilterra, 67",
  "city": "Torino",
  "zip_code": "10126",
  "working_hours": "08:00-22:00",
  "picks_up_in_shop": false
}'

# Store 5
curl -X POST "http://localhost:3002/api/store" -H "Content-Type: application/json" -d '{
  "name": "Sigma Firenze",
  "lat": 43.7696,
  "lng": 11.2558,
  "street": "Via Roma, 150",
  "city": "Firenze",
  "zip_code": "50123",
  "working_hours": "08:30-21:30",
  "picks_up_in_shop": true
}'
```

**Expected Response:**

Each successful store creation should return a `201 Created` status with the store details, including the generated `id`.

```json
{
  "message": "Store saved",
  "store": {
    "id": 1,
    "grocery": "Carrefour Milano",
    "lat": 45.4642,
    "lng": 9.19,
    "street": "Via Torino, 10",
    "city": "Milano",
    "zip_code": "20123",
    "working_hours": "08:00-20:00",
    "picks_up_in_store": true
  },
  "action": "created"
}
```

---

## Retrieving Store IDs

To correctly associate products with their respective stores, retrieve the `id` of each store.

### cURL Command

```bash
curl -X GET "http://localhost:3002/api/store" -H "Accept: application/json"
```

**Expected Response:**

```json
{
  "stores": [
    {
      "id": 1,
      "grocery": "Carrefour Milano",
      "lat": 45.4642,
      "lng": 9.19,
      "street": "Via Torino, 10",
      "city": "Milano",
      "zip_code": "20123",
      "working_hours": "08:00-20:00",
      "picks_up_in_store": true
    },
    {
      "id": 2,
      "grocery": "Esselunga Roma",
      "lat": 41.9028,
      "lng": 12.4964,
      "street": "Via del Corso, 50",
      "city": "Roma",
      "zip_code": "00186",
      "working_hours": "09:00-21:00",
      "picks_up_in_store": false
    },
    // ... Stores 3 to 5
  ]
}
```

**Note:** Use the retrieved `id` values when inserting products.

---

## Inserting Products via Product Receiver API

Insert **6 different products** using the Product Receiver API. Ensure that each product references the correct `localizationId` corresponding to the store it belongs to.

### Product Data Structure

Each product should include the following fields:

- `full_name`: Full name of the product.
- `name`: Short name of the product (optional).
- `description`: Description of the product (optional).
- `price`: Current price (must be non-negative).
- `discount`: Discount on the product (optional, non-negative).
- `quantity`: Quantity available (optional).
- `img_url`: URL to the product image (optional, must be a valid URL).
- `price_for_kg`: Price per kilogram (optional, non-negative).
- `localization`: Object containing store details:
  - `grocery`: Name of the grocery store.
  - `lat`: Latitude of the store location.
  - `lng`: Longitude of the store location.
  - `street`: Street address of the store.

**Important:** The `localization` object should match the store details. However, since the `localizationId` is required, it's recommended to use the retrieved `id` from the previous step.

### cURL Commands

Assuming the retrieved `id` values for stores are as follows:

- **Store 1**: `id = 1` (Carrefour Milano)
- **Store 2**: `id = 2` (Esselunga Roma)
- **Store 3**: `id = 3` (Conad Napoli)
- **Store 4**: `id = 4` (Iper La Grande Sconfitta Torino)
- **Store 5**: `id = 5` (Sigma Firenze)

```bash
# Product 1
curl -X POST "http://localhost:3002/api/product" -H "Content-Type: application/json" -d '{
  "full_name": "Pasta Barilla Spaghetti 500g",
  "name": "Spaghetti Barilla",
  "description": "High-quality spaghetti made from durum wheat.",
  "price": 1.20,
  "discount": 0.00,
  "quantity": "500g",
  "img_url": "http://example.com/images/spaghetti_barilla_500g.jpg",
  "price_for_kg": 2.40,
  "localization": {
    "grocery": "Carrefour Milano",
    "lat": 45.4642,
    "lng": 9.19,
    "street": "Via Torino, 10"
  }
}'

# Product 2
curl -X POST "http://localhost:3002/api/product" -H "Content-Type: application/json" -d '{
  "full_name": "Mozzarella Fresca 125g",
  "name": "Mozzarella Fresca",
  "description": "Fresh mozzarella made from cow's milk.",
  "price": 1.20,
  "discount": 0.10,
  "quantity": "125g",
  "img_url": "http://example.com/images/mozzarella_fresca_125g.jpg",
  "price_for_kg": 9.60,
  "localization": {
    "grocery": "Carrefour Milano",
    "lat": 45.4642,
    "lng": 9.19,
    "street": "Via Torino, 10"
  }
}'

# Product 3
curl -X POST "http://localhost:3002/api/product" -H "Content-Type: application/json" -d '{
  "full_name": "Latte Parzialmente Scremato 1L",
  "name": "Latte Parzialmente Scremato",
  "description": "Fresh partially skimmed milk.",
  "price": 1.10,
  "discount": 0.10,
  "quantity": "1L",
  "img_url": "http://example.com/images/latte_scremato_1l.jpg",
  "price_for_kg": 1.10,
  "localization": {
    "grocery": "Conad Napoli",
    "lat": 40.8518,
    "lng": 14.2681,
    "street": "Via Toledo, 200"
  }
}'

# Product 4
curl -X POST "http://localhost:3002/api/product" -H "Content-Type: application/json" -d '{
  "full_name": "Pane Integrale 500g",
  "name": "Pane Integrale",
  "description": "Whole grain bread, fresh from the oven.",
  "price": 2.50,
  "discount": 0.00,
  "quantity": "500g",
  "img_url": "http://example.com/images/pane_integrale_500g.jpg",
  "price_for_kg": 5.00,
  "localization": {
    "grocery": "Iper La Grande Sconfitta Torino",
    "lat": 45.0703,
    "lng": 7.6869,
    "street": "Corso Inghilterra, 67"
  }
}'

# Product 5
curl -X POST "http://localhost:3002/api/product" -H "Content-Type: application/json" -d '{
  "full_name": "Formaggio Grana Padano 1kg",
  "name": "Grana Padano",
  "description": "Aged Grana Padano cheese.",
  "price": 12.00,
  "discount": 2.00,
  "quantity": "1kg",
  "img_url": "http://example.com/images/grana_padano_1kg.jpg",
  "price_for_kg": 12.00,
  "localization": {
    "grocery": "Esselunga Roma",
    "lat": 41.9028,
    "lng": 12.4964,
    "street": "Via del Corso, 50"
  }
}'

# Product 6
curl -X POST "http://localhost:3002/api/product" -H "Content-Type: application/json" -d '{
  "full_name": "Tonno in Scatola Marca X 3x80g",
  "name": "Tonno Marca X",
  "description": "Canned tuna in oil, 3 packs of 80g each.",
  "price": 3.00,
  "discount": 0.00,
  "quantity": "3x80g",
  "img_url": "http://example.com/images/tonno_marca_x_3x80g.jpg",
  "price_for_kg": 37.50,
  "localization": {
    "grocery": "Sigma Firenze",
    "lat": 43.7696,
    "lng": 11.2558,
    "street": "Via Roma, 150"
  }
}'
```

**Expected Response:**

Each successful product creation should return a `201 Created` status with the product details, including the generated `id` and associated `localizationId`.

```json
{
  "message": "Product saved",
  "product": {
    "id": 1,
    "name_id": "pasta_barilla_spaghetti_500g",
    "full_name": "Pasta Barilla Spaghetti 500g",
    "name": "spaghetti_barilla",
    "description": "High-quality spaghetti made from durum wheat.",
    "current_price": 1.20,
    "discount": 0.00,
    "localizationId": 1,
    "created_at": "2025-01-25T12:00:00Z",
    "updated_at": "2025-01-25T12:00:00Z",
    "price_for_kg": 2.40,
    "image_url": "http://example.com/images/spaghetti_barilla_500g.jpg",
    "quantity": "500g"
  },
  "action": "created"
}
```

---

## Setting Up Elasticsearch Mappings

After resetting the indices, set up the appropriate mappings to define how documents are indexed and searched.

### 1. Create Products Index with Detailed Mapping

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
    }
  }
}'
```

### 2. Create Stores Index with Mapping

```bash
curl -X PUT "http://localhost:9200/stores" -H 'Content-Type: application/json' -d'
{
  "settings": {
    "analysis": {
      "analyzer": {
        "standard_analyzer": {
          "type": "standard"
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "name": {
        "type": "text",
        "analyzer": "standard_analyzer"
      },
      "lat": {
        "type": "float"
      },
      "lng": {
        "type": "float"
      },
      "street": {
        "type": "text",
        "analyzer": "standard_analyzer"
      },
      "city": {
        "type": "text",
        "analyzer": "standard_analyzer"
      },
      "zip_code": {
        "type": "keyword"
      },
      "working_hours": {
        "type": "text",
        "analyzer": "standard_analyzer"
      },
      "picks_up_in_store": {
        "type": "boolean"
      }
    }
  }
}'
```

**Note:** Ensure that `lng` is used instead of `long` to conform with Elasticsearch's `geo_point` type.

---

## Indexing Products and Stores into Elasticsearch

After setting up the mappings, index the products and stores data into Elasticsearch.

### Automatic Indexing via Logstash

The **Product Receiver Service** is configured to send logs to **Logstash**, which in turn indexes the data into Elasticsearch. Ensure that Logstash is correctly configured to process incoming product and store data.

### Manual Indexing (If Necessary)

If automatic indexing is not functioning as expected, you can manually index products and stores using the following cURL commands.

#### 1. Index Products

```bash
# Index Product 1
curl -X POST "http://localhost:9200/products/_doc/pasta_barilla_spaghetti_500g" -H "Content-Type: application/json" -d '{
  "name_id": "pasta_barilla_spaghetti_500g",
  "full_name": "Pasta Barilla Spaghetti 500g",
  "name": "spaghetti_barilla",
  "description": "High-quality spaghetti made from durum wheat.",
  "price": 1.20,
  "discount": 0.00,
  "price_for_kg": 2.40,
  "image_url": "http://example.com/images/spaghetti_barilla_500g.jpg",
  "quantity": "500g",
  "localization": {
    "grocery": "Carrefour Milano",
    "lat": 45.4642,
    "lon": 9.19,
    "street": "Via Torino, 10"
  }
}'

# Repeat for Products 2 to 6 with respective IDs and data
```

#### 2. Index Stores

```bash
# Index Store 1
curl -X POST "http://localhost:9200/stores/_doc/carrefour_milano" -H "Content-Type: application/json" -d '{
  "name": "Carrefour Milano",
  "lat": 45.4642,
  "lng": 9.19,
  "street": "Via Torino, 10",
  "city": "Milano",
  "zip_code": "20123",
  "working_hours": "08:00-20:00",
  "picks_up_in_store": true
}'

# Repeat for Stores 2 to 5 with respective IDs and data
```

**Note:** Replace `<name_id>` and `<store_name>` with appropriate identifiers.

---

## Verifying Elasticsearch Indexing

Ensure that the products and stores have been successfully indexed into Elasticsearch.

### 1. Check Products Index

```bash
curl -X GET "http://localhost:9200/products/_search?pretty" -H 'Content-Type: application/json' -d'
{
  "query": {
    "match_all": {}
  }
}'
```

### 2. Check Stores Index

```bash
curl -X GET "http://localhost:9200/stores/_search?pretty" -H 'Content-Type: application/json' -d'
{
  "query": {
    "match_all": {}
  }
}'
```

### 3. Retrieve a Specific Product by `name_id`

```bash
curl -X GET "http://localhost:9200/products/_doc/pasta_barilla_spaghetti_500g?pretty"
```

### 4. Count Documents in Each Index

```bash
# Count Products
curl -X GET "http://localhost:9200/products/_count" -H 'Content-Type: application/json' -d'
{
  "query": {
    "match_all": {}
  }
}'

# Count Stores
curl -X GET "http://localhost:9200/stores/_count" -H 'Content-Type: application/json' -d'
{
  "query": {
    "match_all": {}
  }
}'
```

---

## Testing Search-Service Endpoints

With data inserted and indexed, test the **Search-Service** endpoints to ensure they function correctly.

### 1. Search Endpoint

**Endpoint**: `GET /search?query=<term>`

**Description**: Searches for products matching the query term.

**cURL Command:**

```bash
curl -X GET "http://localhost:4001/search?query=mozzarella" -H "Accept: application/json"
```

**Expected Response:**

```json
{
  "most_similar": [
    {
      "_id": "2",
      "name": "mozzarella_fresca_125g",
      "full_name": "Mozzarella Fresca 125g",
      "description": "Fresh mozzarella made from cow's milk.",
      "price": 1.20,
      "discount": 0.10,
      "localization": {
        "grocery": "Carrefour Milano",
        "lat": 45.4642,
        "lon": 9.19
      },
      "distance": null
    }
  ],
  "lowest_price": [
    {
      "_id": "2",
      "name": "mozzarella_fresca_125g",
      "full_name": "Mozzarella Fresca 125g",
      "description": "Fresh mozzarella made from cow's milk.",
      "price": 1.20,
      "discount": 0.10,
      "localization": {
        "grocery": "Carrefour Milano",
        "lat": 45.4642,
        "lon": 9.19
      },
      "distance": null
    }
  ]
}
```

### 2. Product Existence Check

**Endpoint**: `POST /product/exists`

**Description**: Checks if a specific product exists in a given location.

**cURL Command:**

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
    "name": "spaghetti_barilla",
    "full_name": "Pasta Barilla Spaghetti 500g",
    "description": "High-quality spaghetti made from durum wheat.",
    "price": 1.20,
    "discount": 0.00,
    "localization": {
      "grocery": "Carrefour Milano",
      "lat": 45.4642,
      "lon": 9.19
    },
    "distance": 0.0
  }
}
```

### 3. Product In-Shop Check

**Endpoint**: `POST /product/in-shop`

**Description**: Checks if a specific product is available in a particular store.

**cURL Command:**

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

### 4. Lowest Price Calculation

**Endpoint**: `POST /product/lowest-price`

**Description**: Calculates the lowest price combination for a list of products based on the specified mode (`risparmio` or `comodita`).

**cURL Command:**

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
          "longitude": 9.19
        },
        "mode": "risparmio"
      }'
```

**Expected Response (Mode: `risparmio`):**

```json
[
  {
    "shop": "Carrefour Milano",
    "total_price": 13.70,
    "products": [
      {
        "shop": "Carrefour Milano",
        "name": "pane_integrale_500g",
        "description": "Whole grain bread, fresh from the oven.",
        "price": 2.50,
        "discount": 0.00,
        "distance": 0.0
      },
      {
        "shop": "Esselunga Roma",
        "name": "formaggio_grana_padano_1kg",
        "description": "Aged Grana Padano cheese.",
        "price": 12.00,
        "discount": 2.00,
        "distance": 0.0
      },
      {
        "shop": "Conad Napoli",
        "name": "latte_parzialmente_scremato_1l",
        "description": "Fresh partially skimmed milk.",
        "price": 1.10,
        "discount": 0.10,
        "distance": 0.0
      }
    ]
  }
]
```

**cURL Command for `comodita` Mode:**

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
          "longitude": 9.19
        },
        "mode": "comodita"
      }'
```

**Expected Response (Mode: `comodita`):**

```json
[
  {
    "shop": "Esselunga Roma",
    "total_price": 14.00,
    "products": [
      {
        "shop": "Esselunga Roma",
        "name": "pane_integrale_500g",
        "description": "Whole grain bread, fresh from the oven.",
        "price": 2.50,
        "discount": 0.00,
        "distance": 0.0
      },
      {
        "shop": "Esselunga Roma",
        "name": "formaggio_grana_padano_1kg",
        "description": "Aged Grana Padano cheese.",
        "price": 12.00,
        "discount": 2.00,
        "distance": 0.0
      },
      {
        "shop": "Conad Napoli",
        "name": "latte_parzialmente_scremato_1l",
        "description": "Fresh partially skimmed milk.",
        "price": 1.10,
        "discount": 0.10,
        "distance": 0.0
      }
    ]
  }
]
```

**Note:** The actual response may vary based on the data indexed and the search logic.

---

## Additional Debugging Commands

### 1. Checking Elasticsearch Cluster Health

Ensure that your Elasticsearch cluster is healthy.

```bash
curl -X GET "http://localhost:9200/_cluster/health?pretty"
```

**Expected Response:**

```json
{
  "cluster_name" : "docker-cluster",
  "status" : "green",
  "timed_out" : false,
  "number_of_nodes" : 1,
  "number_of_data_nodes" : 1,
  // ... additional details
}
```

### 2. Viewing Logs in Kibana

Access Kibana to visualize and analyze logs.

- **URL**: `http://localhost:5601`

**Steps:**

1. Open your browser and navigate to `http://localhost:5601`.
2. Configure index patterns for `products` and `stores`.
3. Explore the Discover, Dashboard, and Visualize sections to monitor logs and metrics.

### 3. Monitoring Logs with Logstash

Ensure that Logstash is processing logs correctly by checking its logs.

```bash
docker logs logstash
```

**Expected Output:**

Logs indicating successful connection to Elasticsearch and indexing actions.

```plaintext
{
       "@timestamp" => "2025-01-25T12:00:00.000Z",
         "id" => 1,
    "name_id" => "pasta_barilla_spaghetti_500g",
       "name" => "spaghetti_barilla",
  "full_name" => "Pasta Barilla Spaghetti 500g",
"description" => "High-quality spaghetti made from durum wheat.",
      "action" => "created",
   "price_for_kg" => 2.40,
    "price" => 1.20,
 "discount" => 0.00,
   "quantity" => "500g",
"img_url" => "http://example.com/images/spaghetti_barilla_500g.jpg",
"location" => "45.4642,9.19"
}
```

### 4. Accessing Adminer for Database Management

Use Adminer to manage your PostgreSQL database.

- **URL**: `http://localhost:8090`
- **Credentials**:
  - **System**: PostgreSQL
  - **Server**: `db` (or your PostgreSQL container name)
  - **Username**: `user`
  - **Password**: `postgrespw`
  - **Database**: `appdb`

**Steps:**

1. Open your browser and navigate to `http://localhost:8090`.
2. Enter the credentials and log in.
3. Browse tables (`Localization`, `Product`, `ProductHistory`) to verify data integrity.

---

## Summary of cURL Commands

| **Action**                                 | **cURL Command**                                                                                                                          |
|--------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| **Delete Products Index**                  | `curl -X DELETE "http://localhost:9200/products"`                                                                                       |
| **Delete Stores Index**                    | `curl -X DELETE "http://localhost:9200/stores"`                                                                                         |
| **Create Products Mapping**                | `curl -X PUT "http://localhost:9200/products" -H 'Content-Type: application/json' -d '{...}'`                                           |
| **Create Stores Mapping**                  | `curl -X PUT "http://localhost:9200/stores" -H 'Content-Type: application/json' -d '{...}'`                                             |
| **Insert Store 1-5**                       | `curl -X POST "http://localhost:3002/api/store" -H "Content-Type: application/json" -d '{...}'`                                          |
| **Insert Product 1-6**                     | `curl -X POST "http://localhost:3002/api/product" -H "Content-Type: application/json" -d '{...}'`                                        |
| **Index Product 1-6 (Manual)**             | `curl -X POST "http://localhost:9200/products/_doc/<name_id>" -H "Content-Type: application/json" -d '{...}'`                            |
| **Index Store 1-5 (Manual)**               | `curl -X POST "http://localhost:9200/stores/_doc/<store_name>" -H "Content-Type: application/json" -d '{...}'`                            |
| **Search All Products**                    | `curl -X GET "http://localhost:9200/products/_search?pretty" -H 'Content-Type: application/json' -d '{...}'`                              |
| **Search All Stores**                      | `curl -X GET "http://localhost:9200/stores/_search?pretty" -H 'Content-Type: application/json' -d '{...}'`                                |
| **Retrieve Specific Product**              | `curl -X GET "http://localhost:9200/products/_doc/<name_id>?pretty"`                                                                      |
| **Count Products**                         | `curl -X GET "http://localhost:9200/products/_count" -H 'Content-Type: application/json' -d '{...}'`                                       |
| **Count Stores**                           | `curl -X GET "http://localhost:9200/stores/_count" -H 'Content-Type: application/json' -d '{...}'`                                         |
| **Check Cluster Health**                   | `curl -X GET "http://localhost:9200/_cluster/health?pretty"`                                                                              |
| **Access Adminer**                         | Navigate to `http://localhost:8090`                                                                                                       |
| **View Logstash Logs**                     | `docker logs logstash`                                                                                                                    |
| **Search-Service: Search**                 | `curl -X GET "http://localhost:4001/search?query=<term>" -H "Accept: application/json"`                                                   |
| **Search-Service: Product Exists**         | `curl -X POST "http://localhost:4001/product/exists" -H "Content-Type: application/json" -d '{...}'`                                     |
| **Search-Service: Product In-Shop**        | `curl -X POST "http://localhost:4001/product/in-shop" -H "Content-Type: application/json" -d '{...}'`                                    |
| **Search-Service: Lowest Price Calculation**| `curl -X POST "http://localhost:4001/product/lowest-price" -H "Content-Type: application/json" -d '{...}'`                               |

---

## Tips for Successful Testing

1. **Consistency in Data**:
   - Ensure that the `localizationId` in products matches the `id` of the inserted stores.
   - Use the retrieved store IDs when inserting products to maintain referential integrity.

2. **Order of Operations**:
   - Always insert stores before products to ensure that products can correctly reference existing stores.

3. **Validation**:
   - Use Adminer or `psql` to verify that data exists in the PostgreSQL database.
   - Check Elasticsearch indices to confirm that data is correctly indexed.

4. **Elasticsearch Indexing**:
   - Ensure that Elasticsearch is running and accessible before attempting to index data.
   - Monitor Logstash logs to verify successful data ingestion.

5. **Monitoring**:
   - Utilize Kibana dashboards to monitor logs and identify any issues during the testing process.
   - Use Uptime Kuma to monitor the health and uptime of key services.

6. **Error Handling**:
   - Pay attention to responses from API calls. Any `4xx` or `5xx` responses indicate issues that need to be addressed.
   - Check Logstash and service logs for detailed error messages.

7. **Security Considerations**:
   - Ensure that all scripts and configurations adhere to best security practices to protect your infrastructure and data.
   - Avoid hardcoding sensitive information; use environment variables instead.

8. **Documentation - edit me**:
   - Maintain comprehensive documentation for all DevOps processes to facilitate onboarding and knowledge sharing within the team.

9. **Testing Automation**:
   - Consider automating these tests using scripts or tools like Postman to streamline the testing process.


---
If you encounter any issues or require further assistance, feel free to reach out for support from @ani.
