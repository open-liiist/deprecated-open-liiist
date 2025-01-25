---

# liiist

A smart grocery list app that helps users find the best prices at nearby markets.  
**Create your list, enter your location, and the app compares prices to recommend the most economical shopping options.**

# 🥦🥑🍌🍕🥛🍳🥫🍅🍝🍋🌽🍊🍎🍐🥝🍒🍪🍆🥕🧄🥐🥖🍐🍉🥚🫑🥬🥗


```mermaid
flowchart LR
    subgraph Frontend
        WebClient[Web Client]
    end

    subgraph Backend
        AuthService[Auth Service]
        SearchService[Search Service]
        ProductReceiver[Product Receiver Service]
        ScrapingService[Scraping Service]
        NotificationAlert[Notification Alert]
    end

    subgraph Database
        DB[(PostgreSQL)]
    end

    subgraph Monitoring
        UptimeKuma[Uptime Kuma]
    end

    subgraph Logging
        Logstash[Logstash]
        Elasticsearch[Elasticsearch]
        Kibana[Kibana]
    end

    subgraph Proxy
        Traefik[Traefik]
    end

    subgraph Management
        Adminer[Adminer]
    end

    %% Frontend Interactions
    WebClient -->|API Requests| AuthService
    WebClient -->|API Requests| SearchService
    WebClient -->|API Requests| ProductReceiver

    %% Backend Interactions
    AuthService --> DB
    SearchService --> Elasticsearch
    SearchService -->|Fetch Data| DB
    ProductReceiver -->|Fetch Data| DB
    ProductReceiver --> Logstash
    ScrapingService --> ProductReceiver
    ScrapingService --> Logstash
    Logstash --> Elasticsearch
    Elasticsearch --> Kibana
    Logstash -->|Send Logs| Kibana
    Traefik --> WebClient
    Traefik --> AuthService
    Traefik --> SearchService
    Traefik --> ProductReceiver
    Traefik --> NotificationAlert

    %% Monitoring Interactions
    UptimeKuma -->|Monitor| Traefik
    UptimeKuma -->|Monitor| AuthService
    UptimeKuma -->|Monitor| SearchService
    UptimeKuma -->|Monitor| ProductReceiver

    %% Management Interactions
    Adminer --> DB

```
## Table of Contents

1. [Features](#features)
2. [Tech Stack 🏗️](#tech-stack🏗️)
3. [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Setup](#setup)
    - [Environment Variables](#environment-variables)
    - [Running Tests](#running-tests)
4. [HTTPS and TLS](#https-and-tls)
5. [Resources](#resources)
6. [API Documentation](#api-documentation)
    - [Search Service 🔦 (Rust)](#search-service🔦-rust)
    - [Auth Service 👥 (Node.js)](#auth-service👥-nodejs)
    - [Notification Alert Service 🔔 (Golang)](#notification-alert-service🔔-golang)
    - [Product Receiver Service 🚚 (Node.js)](#product-receiver-service🚚-nodejs)
7. [Deployment](#deployment)
8. [Additional Notes](#additional-notes)

---

## Features

- **Create and manage grocery lists** 🛒
- **Search for nearby markets** based on your location 📍🗺️
- **Compare prices** across multiple stores 🏷️
- **Get recommendations** for the most cost-effective markets 📉💸

## Tech Stack 🏗️

- **Frontend**: Next.js, TypeScript
- **Microservices**:
  - **Authentication/Authorization**: Node.js, Express
  - **User Service**: Node.js, Express
  - **Search Service**: Rust
  - **Scraper Service**: Python
- **Database**: PostgreSQL
- **Message Queues**: RabbitMQ, Kafka
- **Containerization**: Docker, Docker Compose
- **API Gateway**: Traefik
- **CI/CD**: Jenkins (or alternative)
- **Deployment**: Kubernetes

## Getting Started

### Prerequisites

- **Docker and Docker Compose**
- **Node.js** (for development)
- **PostgreSQL** (for local database setup)

### Setup

1. **Clone the repository**:

    ```bash
    git clone https://github.com/open-liiist/liiist.git
    cd liiist
    ```

2. **Build and start services** 👷‍♀️👷▶️:

    ```bash
    docker-compose up --build
    ```

3. **Access the frontend** at `http://localhost:3000` and **API Gateway** at `http://localhost:8000`.

### Environment Variables

Create a `.env` file for each service. For example, in `services/auth-service/.env`:

```
DATABASE_URL=postgres://user:password@db:5432/authdb
```

**Common Environment Variables:**

- **`PRODUCT_RECEIVER_SERVICE_PORT`**: Port for Product Receiver Service (default: `3002`).
- **`REMOTE_DATABASE_URL`**: PostgreSQL connection string.
- **`LOGSTASH_HOST`**: Host for Logstash.
- **`LOGSTASH_PORT`**: Port for Logstash.
- **`LOGSTASH_INTERNAL_PASSWORD`**: Password for authenticating with Logstash.
- **`SEARCH_SERVICE_PORT`**: Port for Search Service (default: `4001`).
- **`ELASTICSEARCH_URL`**: URL for Elasticsearch (default: `http://elasticsearch:9200`).
- **`ACCESS_TOKEN_SECRET`**: Secret key for access tokens.
- **`REFRESH_TOKEN_SECRET`**: Secret key for refresh tokens.
- **`ELASTIC_PASSWORD`**: Password for Elasticsearch.
- **`KIBANA_SYSTEM_PASSWORD`**: Password for Kibana.
- **Other service-specific variables as needed.**

### Running Tests

Each microservice has its own tests. To run them:

1. **Navigate to the service directory**.
2. **Run the tests**. For Node.js services:

    ```bash
    npm test
    ```

For other services, follow their specific testing instructions.

## HTTPS and TLS

For HTTPS and TLS, we're using **Traefik** as the reverse proxy. Currently, we're exploring Traefik, and we may switch tools in the future.

**Generating Local Certificates for Development:**

1. **Install [mkcert](https://github.com/FiloSottile/mkcert)**.
2. **Run the following commands**:

    ```bash
    # If it's the first install of mkcert, run
    mkcert -install

    # Generate certificate for domain "docker.localhost", "domain.local" and their sub-domains
    mkcert -cert-file certs/local-cert.pem -key-file certs/local-key.pem "docker.localhost" "*.docker.localhost" "domain.local" "*.domain.local"
    ```

These certificates will be used for local development.

## Resources

- [Traefik Docs](https://traefik.io/)
- [Traefik with Docker configs](https://github.com/ChristianLempa/boilerplates/blob/main/docker-compose/traefik/config/traefik.yaml)
- [Learn Kubernetes](https://learn.udacity.com/courses/ud615/lessons/c986ef51-ffb5-4821-be4b-358289284f90/concepts/ec269da2-1e35-4a29-bdf8-98176f9adaa2)

---

## API Documentation

This section provides a detailed description of the APIs for the **Search Service**, **Auth Service**, **Notification Alert Service**, and **Product Receiver Service**. Each endpoint includes information on method, route, request body, and response, along with examples for testing using **cURL** and **Postman**.

### Index

1. [Search Service (Rust)](#search-service-rust)
2. [Auth Service (Node.js)](#auth-service-nodejs)
3. [Notification Alert Service (Golang)](#notification-alert-service-golang)
4. [Product Receiver Service (Node.js)](#product-receiver-service-nodejs)

---

### Search Service 🔦 (Rust)

#### 1. GET `/search`

**Description**: Searches for products based on a query string and returns the most similar results and those with the lowest price.

##### Request

- **Method**: `GET`
- **URL**: `http://localhost:4001/search`
- **Query Parameters**:
  - `query` (string): The product name or keyword to search for.

##### Response

- **Content-Type**: `application/json`

- **Example**:

    ```json
    {
      "most_similar": [
        {
          "_id": "123",
          "name": "Pasta",
          "full_name": "Pasta Barilla 500g",
          "description": "Pasta di grano duro",
          "price": 1.5,
          "discount": 0.1,
          "localization": {
            "grocery": "Esselunga",
            "lat": 45.4642,
            "lon": 9.1900
          },
          "distance": 2.5
        }
      ],
      "lowest_price": [
        {
          "_id": "124",
          "name": "Pasta",
          "full_name": "Pasta Barilla 500g",
          "description": "Pasta di grano duro",
          "price": 1.3,
          "discount": null,
          "localization": {
            "grocery": "Coop",
            "lat": 45.4700,
            "lon": 9.1800
          },
          "distance": 1.8
        }
      ]
    }
    ```

##### Examples

**cURL**:

```bash
curl -X GET "http://localhost:4001/search?query=Pasta"
```

**Postman**:

1. **Method**: `GET`
2. **URL**: `http://localhost:4001/search?query=Pasta`
3. **Send** the request; expect a JSON response with `most_similar` and `lowest_price` arrays.

---

#### 2. POST `/product/exists`

**Description**: Checks if a product exists near a specific location.

##### Request

- **Method**: `POST`
- **URL**: `http://localhost:4001/product/exists`
- **Body (JSON)**:

    ```json
    {
      "product": "Pasta Barilla 500g",
      "position": {
        "latitude": 45.4642,
        "longitude": 9.1900
      }
    }
    ```

##### Response

- **Content-Type**: `application/json`

- **Example**:

    ```json
    {
      "product": "Pasta Barilla 500g",
      "exists": true,
      "details": {
        "_id": "123",
        "name": "Pasta",
        "full_name": "Pasta Barilla 500g",
        "description": "Pasta di grano duro",
        "price": 1.5,
        "discount": 0.1,
        "localization": {
          "grocery": "Esselunga",
          "lat": 45.4642,
          "lon": 9.1900
        },
        "distance": 2.5
      }
    }
    ```

##### Examples

**cURL**:

```bash
curl -X POST http://localhost:4001/product/exists \
-H "Content-Type: application/json" \
-d '{
  "product": "Pasta Barilla 500g",
  "position": {
    "latitude": 45.4642,
    "longitude": 9.1900
  }
}'
```

**Postman**:

1. **Method**: `POST`
2. **URL**: `http://localhost:4001/product/exists`
3. **Body** → **raw** → **JSON**:

    ```json
    {
      "product": "Pasta Barilla 500g",
      "position": {
        "latitude": 45.4642,
        "longitude": 9.1900
      }
    }
    ```

4. **Send** the request; expect a JSON response indicating whether the product exists and its details.

---

#### 3. POST `/product/in-shop`

**Description**: Checks if a product is available in a specific shop.

##### Request

- **Method**: `POST`
- **URL**: `http://localhost:4001/product/in-shop`
- **Body (JSON)**:

    ```json
    {
      "product": "Pasta Barilla 500g",
      "shop": "Esselunga",
      "position": {
        "latitude": 45.4642,
        "longitude": 9.1900
      }
    }
    ```

##### Response

- **Content-Type**: `application/json`

- **Example**:

    ```json
    {
      "product": "Pasta Barilla 500g",
      "shop": "Esselunga",
      "exists": true,
      "details": {
        "_id": "123",
        "name": "Pasta",
        "full_name": "Pasta Barilla 500g",
        "description": "Pasta di grano duro",
        "price": 1.5,
        "discount": 0.1,
        "localization": {
          "grocery": "Esselunga",
          "lat": 45.4642,
          "lon": 9.1900
        },
        "distance": 2.5
      }
    }
    ```

##### Examples

**cURL**:

```bash
curl -X POST http://localhost:4001/product/in-shop \
-H "Content-Type: application/json" \
-d '{
  "product": "Pasta Barilla 500g",
  "shop": "Esselunga",
  "position": {
    "latitude": 45.4642,
    "longitude": 9.1900
  }
}'
```

**Postman**:

1. **Method**: `POST`
2. **URL**: `http://localhost:4001/product/in-shop`
3. **Body** → **raw** → **JSON**:

    ```json
    {
      "product": "Pasta Barilla 500g",
      "shop": "Esselunga",
      "position": {
        "latitude": 45.4642,
        "longitude": 9.1900
      }
    }
    ```

4. **Send** the request; expect a JSON response indicating whether the product exists in the specified shop and its details.

---

#### 4. POST `/product/lowest-price`

**Description**: Finds the lowest price for a list of products.

##### Request

- **Method**: `POST`
- **URL**: `http://localhost:4001/product/lowest-price`
- **Body (JSON)**:

    ```json
    {
      "products": ["Pasta Barilla 500g", "Latte intero 1L"],
      "position": {
        "latitude": 45.4642,
        "longitude": 9.1900
      }
    }
    ```

##### Response

- **Content-Type**: `application/json`

- **Example**:

    ```json
    [
      {
        "shop": "Esselunga",
        "total_price": 2.8,
        "products": [
          {
            "shop": "Esselunga",
            "name": "Pasta Barilla 500g",
            "description": "Pasta di grano duro",
            "price": 1.5,
            "discount": 0.1,
            "distance": 2.5
          },
          {
            "shop": "Esselunga",
            "name": "Latte intero 1L",
            "description": "Latte fresco",
            "price": 1.3,
            "discount": null,
            "distance": 2.5
          }
        ]
      }
    ]
    ```

##### Examples

**cURL**:

```bash
curl -X POST http://localhost:4001/product/lowest-price \
-H "Content-Type: application/json" \
-d '{
  "products": ["Pasta Barilla 500g", "Latte intero 1L"],
  "position": {
    "latitude": 45.4642,
    "longitude": 9.1900
  }
}'
```

**Postman**:

1. **Method**: `POST`
2. **URL**: `http://localhost:4001/product/lowest-price`
3. **Body** → **raw** → **JSON**:

    ```json
    {
      "products": ["Pasta Barilla 500g", "Latte intero 1L"],
      "position": {
        "latitude": 45.4642,
        "longitude": 9.1900
      }
    }
    ```

4. **Send** the request; expect a JSON array with the shop(s) offering the requested products at the lowest total price.

---

#### 5. GET `/stores`

**Description**: Retrieves a list of all available stores.

##### Request

- **Method**: `GET`
- **URL**: `http://localhost:4001/stores`

##### Response

- **Content-Type**: `application/json`

- **Example**:

    ```json
    [
      {
        "id": 1,
        "grocery": "Esselunga",
        "lat": 45.4642,
        "lng": 9.1900,
        "street": "Via Milano 10",
        "city": "Milano",
        "zip_code": "20100",
        "working_hours": "08:00-20:00",
        "picks_up_in_store": true
      }
    ]
    ```

##### Examples

**cURL**:

```bash
curl -X GET http://localhost:4001/stores
```

**Postman**:

1. **Method**: `GET`
2. **URL**: `http://localhost:4001/stores`
3. **Send** the request; expect a JSON array of all stores.

---

#### 6. GET `/store/:id/products`

**Description**: Retrieves a list of products available at a specific store.

##### Request

- **Method**: `GET`
- **URL**: `http://localhost:4001/store/:id/products`
- **Path Parameters**:
  - `id` (integer): The ID of the store.

##### Response

- **Content-Type**: `application/json`

- **Example**:

    ```json
    [
      {
        "id": 1,
        "name": "Pasta Barilla 500g",
        "description": "Pasta di grano duro",
        "current_price": 1.5,
        "discount": 0.1,
        "price_for_kg": null,
        "image_url": null
      }
    ]
    ```

##### Examples

**cURL**:

```bash
curl -X GET http://localhost:4001/store/1/products
```

**Postman**:

1. **Method**: `GET`
2. **URL**: `http://localhost:4001/store/1/products`
3. **Send** the request; expect a JSON array of products available at the specified store.

---

### Auth Service 👥 (Node.js)

#### 1. POST `/auth/register`

**Description**: Registers a new user.

##### Request

- **Method**: `POST`
- **URL**: `http://localhost:4000/auth/register`
- **Body (JSON)**:

    ```json
    {
      "email": "test@example.com",
      "password": "password123",
      "name": "Test User",
      "dateOfBirth": "1990-01-01",
      "supermarkets": ["tigre"]
    }
    ```

##### Response

- **Content-Type**: `application/json`

- **Example**:

    ```json
    {
      "status": "success",
      "message": "User registered successfully",
      "data": {
        "id": "cm5u679ot0000116otg66qubv",
        "email": "test@example.com",
        "name": "Test User",
        "dateOfBirth": "1990-01-01T00:00:00.000Z",
        "supermarkets": ["tigre"],
        "passwordHash": "$2b$10$hFb2rsPbTZYBj7hq/Z.0nOQs9Adtxzk57wHw9tNVKsxw4sxzZK.Cm",
        "createdAt": "2025-01-12T22:12:03.905Z",
        "updatedAt": "2025-01-12T22:12:03.905Z",
        "deletedAt": null
      }
    }
    ```

##### Examples

**cURL**:

```bash
curl -X POST http://localhost:4000/auth/register \
-H "Content-Type: application/json" \
-d '{
  "email": "test@example.com",
  "password": "password123",
  "name": "Test User",
  "dateOfBirth": "1990-01-01",
  "supermarkets": ["tigre"]
}'
```

**Postman**:

1. **Method**: `POST`
2. **URL**: `http://localhost:4000/auth/register`
3. **Body** → **raw** → **JSON**:

    ```json
    {
      "email": "test@example.com",
      "password": "password123",
      "name": "Test User",
      "dateOfBirth": "1990-01-01",
      "supermarkets": ["tigre"]
    }
    ```

4. **Send** the request; expect a JSON response confirming successful registration.

---

#### 2. POST `/auth/login`

**Description**: Logs in a user.

##### Request

- **Method**: `POST`
- **URL**: `http://localhost:4000/auth/login`
- **Body (JSON)**:

    ```json
    {
      "email": "test@example.com",
      "password": "password123"
    }
    ```

##### Response

- **Content-Type**: `application/json`

- **Example**:

    ```json
    {
      "message": "Login successful",
      "accessToken": "token123",
      "refreshToken": "refreshToken123"
    }
    ```

##### Examples

**cURL**:

```bash
curl -X POST http://localhost:4000/auth/login \
-H "Content-Type: application/json" \
-d '{
  "email": "test@example.com",
  "password": "password123"
}'
```

**Postman**:

1. **Method**: `POST`
2. **URL**: `http://localhost:4000/auth/login`
3. **Body** → **raw** → **JSON**:

    ```json
    {
      "email": "test@example.com",
      "password": "password123"
    }
    ```

4. **Send** the request; expect a JSON response with access and refresh tokens.

---

#### 3. POST `/auth/refresh`

**Description**: Refreshes a user token.

##### Request

- **Method**: `POST`
- **URL**: `http://localhost:4000/auth/refresh`
- **Body (JSON)**:

    ```json
    {
      "refreshToken": "refreshToken123"
    }
    ```

##### Response

- **Content-Type**: `application/json`

- **Example**:

    ```json
    {
      "accessToken": "newAccessToken"
    }
    ```

##### Examples

**cURL**:

```bash
curl -X POST http://localhost:4000/auth/refresh \
-H "Content-Type: application/json" \
-d '{
  "refreshToken": "refreshToken123"
}'
```

**Postman**:

1. **Method**: `POST`
2. **URL**: `http://localhost:4000/auth/refresh`
3. **Body** → **raw** → **JSON**:

    ```json
    {
      "refreshToken": "refreshToken123"
    }
    ```

4. **Send** the request; expect a JSON response with a new access token.

---

#### 4. POST `/auth/verify`

**Description**: Verifies a user token.

##### Request

- **Method**: `POST`
- **URL**: `http://localhost:4000/auth/verify`
- **Body (JSON)**:

    ```json
    {
      "token": "accessToken123"
    }
    ```

##### Response

- **Content-Type**: `application/json`

- **Example**:

    ```json
    {
      "message": "Token is valid",
      "userId": "12345"
    }
    ```

##### Examples

**cURL**:

```bash
curl -X POST http://localhost:4000/auth/verify \
-H "Content-Type: application/json" \
-d '{
  "token": "accessToken123"
}'
```

**Postman**:

1. **Method**: `POST`
2. **URL**: `http://localhost:4000/auth/verify`
3. **Body** → **raw** → **JSON**:

    ```json
    {
      "token": "accessToken123"
    }
    ```

4. **Send** the request; expect a JSON response confirming token validity.

---

#### 5. POST `/auth/revoke`

**Description**: Revokes a user token.

##### Request

- **Method**: `POST`
- **URL**: `http://localhost:4000/auth/revoke`
- **Body (JSON)**:

    ```json
    {
      "token": "accessToken123"
    }
    ```

##### Response

- **Content-Type**: `application/json`

- **Example**:

    ```json
    {
      "message": "Token revoked successfully"
    }
    ```

##### Examples

**cURL**:

```bash
curl -X POST http://localhost:4000/auth/revoke \
-H "Content-Type: application/json" \
-d '{
  "token": "accessToken123"
}'
```

**Postman**:

1. **Method**: `POST`
2. **URL**: `http://localhost:4000/auth/revoke`
3. **Body** → **raw** → **JSON**:

    ```json
    {
      "token": "accessToken123"
    }
    ```

4. **Send** the request; expect a JSON response confirming token revocation.

---

#### 6. POST `/auth/logout`

**Description**: Logs out a user.

##### Request

- **Method**: `POST`
- **URL**: `http://localhost:4000/auth/logout`
- **Body (JSON)**:

    ```json
    {
      "userId": "12345"
    }
    ```

##### Response

- **Content-Type**: `application/json`

- **Example**:

    ```json
    {
      "message": "User logged out successfully"
    }
    ```

##### Examples

**cURL**:

```bash
curl -X POST http://localhost:4000/auth/logout \
-H "Content-Type: application/json" \
-d '{
  "userId": "12345"
}'
```

**Postman**:

1. **Method**: `POST`
2. **URL**: `http://localhost:4000/auth/logout`
3. **Body** → **raw** → **JSON**:

    ```json
    {
      "userId": "12345"
    }
    ```

4. **Send** the request; expect a JSON response confirming successful logout.

---

#### 7. POST `/users/:id`

**Description**: Retrieves user details by ID.

##### Request

- **Method**: `POST`
- **URL**: `http://localhost:4000/users/:id`
- **Path Parameters**:
  - `id`: The user ID.

##### Response

- **Content-Type**: `application/json`

- **Example**:

    ```json
    {
      "id": "12345",
      "username": "exampleUser",
      "email": "user@example.com"
    }
    ```

##### Examples

**cURL**:

```bash
curl -X POST http://localhost:4000/users/12345
```

**Postman**:

1. **Method**: `POST`
2. **URL**: `http://localhost:4000/users/12345`
3. **Send** the request; expect a JSON response with user details.

---

#### 8. POST `/status`

**Description**: Retrieves the service status.

##### Request

- **Method**: `POST`
- **URL**: `http://localhost:4000/status`

##### Response

- **Content-Type**: `application/json`

- **Example**:

    ```json
    {
      "status": "OK",
      "uptime": "24h"
    }
    ```

##### Examples

**cURL**:

```bash
curl -X POST http://localhost:4000/status
```

**Postman**:

1. **Method**: `POST`
2. **URL**: `http://localhost:4000/status`
3. **Send** the request; expect a JSON response indicating service status and uptime.

---

### Notification Alert Service 🔔 (Golang)

#### 1. POST `/ricevi_code`

**Description**: Receives errors from other services.

##### Request

- **Method**: `POST`
- **URL**: `http://localhost:5000/ricevi_code`
- **Body (JSON)**:

    ```json
    {
      "error_code": "500",
      "service": "search-service",
      "details": "Elasticsearch connection failed"
    }
    ```

##### Response

- **Content-Type**: `application/json`

- **Example**:

    ```json
    {
      "message": "Error received",
      "timestamp": "2025-01-12T15:04:05Z"
    }
    ```

##### Examples

**cURL**:

```bash
curl -X POST http://localhost:5000/ricevi_code \
-H "Content-Type: application/json" \
-d '{
  "error_code": "500",
  "service": "search-service",
  "details": "Elasticsearch connection failed"
}'
```

**Postman**:

1. **Method**: `POST`
2. **URL**: `http://localhost:5000/ricevi_code`
3. **Body** → **raw** → **JSON**:

    ```json
    {
      "error_code": "500",
      "service": "search-service",
      "details": "Elasticsearch connection failed"
    }
    ```

4. **Send** the request; expect a JSON response confirming receipt of the error.

---

### Product Receiver Service 🚚 (Node.js)

#### Overview

The **Product Receiver Service** is a **Node.js** application built on **Express.js** that interacts with a **PostgreSQL** database via **Prisma**. It provides endpoints to:

- **Upsert** (create or update) **Product** data, with built-in **retry** on certain Prisma errors.
- **Upsert** **Store** data (`Localization` model), uniquely identified by **(grocery, lat, lng, street)**.
- Retrieve **all Stores** or filter by `grocery` and `city`.
- **Health Check** to verify service status.

Additionally:

- **Validates incoming requests** via **Zod** to ensure data integrity.
- **Sends product data to Logstash** after every successful product creation or update.

#### Base URL

By default, the service listens on **port 3002**, with all routes under the prefix `/api`.  
For example:

```
http://localhost:3002/api
```

*(You can adjust this in `.env` by setting `PRODUCT_RECEIVER_SERVICE_PORT`.)*

#### Environment Variables

A typical `.env` might include:

```bash
PRODUCT_RECEIVER_SERVICE_PORT=3002
REMOTE_DATABASE_URL=postgresql://list-user:MyPassword@my-db-host:5432/my_db
LOGSTASH_HOST=localhost
LOGSTASH_PORT=50000
LOGSTASH_INTERNAL_PASSWORD=your_logstash_password
```

- **`PRODUCT_RECEIVER_SERVICE_PORT`**: Port for the service (default: `3002`).
- **`REMOTE_DATABASE_URL`**: PostgreSQL connection string.
- **`LOGSTASH_HOST`** and **`LOGSTASH_PORT`**: Destination for sending logs to Logstash.
- **`LOGSTASH_INTERNAL_PASSWORD`**: Password for authenticating with Logstash.

#### Endpoints

##### Health Check

- **Endpoint**: `GET /api/health`
- **Description**: Checks service health.

###### Request

- **Method**: `GET`
- **Headers**: *None*
- **Body**: *None*

###### Response

- **Status**: `200 OK`
- **Body**:

    ```json
    { "status": "OK" }
    ```

###### cURL Example

```bash
curl -X GET http://localhost:3002/api/health
```

###### Postman Example

1. **Method**: `GET`
2. **URL**: `http://localhost:3002/api/health`
3. **Send** the request; expect `{"status":"OK"}`.

---

##### Product Endpoint

###### Create/Update Product

- **Endpoint**: `POST /api/product`
- **Description**: Creates or updates a **Product** using a composite approach. Internally uses `(name_id, localizationId)` as the unique reference.
- **Validation**: Zod ensures required fields (`full_name`, `price`, `localization`, `street`) and correct data types.

###### Request

- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/json`
- **Body (JSON)**:
  - **Required**:
    - `full_name` (string)
    - `price` (number)
    - `localization` (object)
      - `grocery` (string)
      - `lat` (number)
      - `lng` (number)
      - `street` (string)
  - **Optional**:
    - `name` (string)
    - `description` (string/null)
    - `discount` (number)
    - `quantity` (string/null)
    - `img_url` (string)
    - `price_for_kg` (number)

###### Sample Request Body

```json
{
  "full_name": "Banana Chiquita",
  "name": "Banana Chiquita",
  "description": "Fresh bananas",
  "price": 2.55,
  "discount": 1.2,
  "quantity": "1 bunch",
  "img_url": "https://example.com/banana.jpg",
  "price_for_kg": 2.50,
  "localization": {
    "grocery": "My Grocery",
    "lat": 12.34,
    "lng": 56.78,
    "street": "123 Main St"
  }
}
```

###### Response

- **Success (`201 Created`)**

    ```json
    {
      "message": "Product saved",
      "product": {
        "id": 1,
        "name_id": "banana_chiquita",
        "full_name": "Banana Chiquita",
        "name": "banana_chiquita",
        "description": "Fresh bananas",
        "current_price": 2.55,
        "discount": 1.2,
        "localizationId": 10,
        "created_at": "2025-01-01T12:00:00.000Z",
        "updated_at": "2025-01-01T12:00:00.000Z",
        "price_for_kg": 2.50,
        "image_url": "https://example.com/banana.jpg",
        "quantity": "1 bunch"
      },
      "action": "created"
    }
    ```

- **Bad Request (`400`)**: Missing or invalid fields.

    ```json
    {
      "error": "Validation error",
      "details": { ... }
    }
    ```

- **Internal Server Error (`500`)**: Database or server error.

    ```json
    { "error": "Failed to save product", "details": "..." }
    ```

###### cURL Example

```bash
curl -X POST http://localhost:3002/api/product \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Banana Chiquita",
    "price": 2.55,
    "localization": {
      "grocery": "My Grocery",
      "lat": 12.34,
      "lng": 56.78,
      "street": "123 Main St"
    }
  }'
```

###### Postman Example

1. **Method**: `POST`
2. **URL**: `http://localhost:3002/api/product`
3. **Body** → **raw** → **JSON**:

    ```json
    {
      "full_name": "Banana Chiquita",
      "price": 2.55,
      "localization": {
        "grocery": "My Grocery",
        "lat": 12.34,
        "lng": 56.78,
        "street": "123 Main St"
      }
    }
    ```

4. **Send** the request; expect a `201 Created` response with the product details.

---

##### Store Endpoint

###### Create/Update Store

- **Endpoint**: `POST /api/store`
- **Description**: Creates or updates a **Store** (`Localization` model) using a new composite key: **`(grocery, lat, lng, street)`**. If `street` is omitted, an empty string `""` is used by default for the key.
- **Validation**: Zod ensures `name`, `lat`, `lng`, and `street` exist and are correct types.

###### Request

- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/json`
- **Body (JSON)**:
  - **Required**:
    - `name` (string) → stored as `grocery` in the DB
    - `lat` (number)
    - `lng` (number)
    - `street` (string)
  - **Optional**:
    - `city` (string)
    - `working_hours` (string)
    - `picks_up_in_shop` (boolean)
    - `zip_code` (string)

###### Sample Request Body

```json
{
  "name": "My Grocery",
  "lat": 12.34,
  "lng": 56.78,
  "street": "123 Main St",
  "city": "Sample City",
  "zip_code": "12345",
  "working_hours": "{\"mon\":\"8-20\"}",
  "picks_up_in_shop": true
}
```

###### Response

- **Success (`201 Created`)**

    ```json
    {
      "message": "Store saved",
      "store": {
        "id": 2,
        "grocery": "My Grocery",
        "lat": 12.34,
        "lng": 56.78,
        "street": "123 Main St",
        "city": "Sample City",
        "zip_code": "12345",
        "working_hours": "{\"mon\":\"8-20\"}",
        "picks_up_in_store": true
      },
      "action": "created"
    }
    ```

- **Bad Request (`400`)**:

    ```json
    { "error": "Validation error", "details": { ... } }
    ```

- **Server Error (`500`)**:

    ```json
    { "error": "Failed to save store", "details": "..." }
    ```

###### cURL Example

```bash
curl -X POST http://localhost:3002/api/store \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Grocery",
    "lat": 12.34,
    "lng": 56.78,
    "street": "123 Main St",
    "city": "Sample City",
    "zip_code": "12345",
    "working_hours": "{\"mon\":\"8-20\"}",
    "picks_up_in_shop": true
  }'
```

###### Postman Example

1. **Method**: `POST`
2. **URL**: `http://localhost:3002/api/store`
3. **Body** → **raw** → **JSON**:

    ```json
    {
      "name": "My Grocery",
      "lat": 12.34,
      "lng": 56.78,
      "street": "123 Main St",
      "city": "Sample City",
      "zip_code": "12345",
      "working_hours": "{\"mon\":\"8-20\"}",
      "picks_up_in_shop": true
    }
    ```

4. **Send** the request; expect a `201 Created` response with the store details.

---

###### Get All Stores

- **Endpoint**: `GET /api/store`
- **Description**: Returns **all** stores.

**Request**: `GET /api/store` (no body)

**Response** (`200 OK`):

```json
{
  "stores": [
    {
      "id": 2,
      "grocery": "My Grocery",
      "lat": 12.34,
      "lng": 56.78,
      "street": "123 Main St",
      "city": "Sample City",
      "zip_code": "12345",
      "working_hours": "{\"mon\":\"8-20\"}",
      "picks_up_in_store": true
    }
  ]
}
```

---

###### Get Stores by Grocery/City

- **Endpoint**: `GET /api/store/:grocery/:city`
- **Description**: Filters stores by `grocery` and `city`.

**Request**:

- `GET /api/store/My%20Grocery/Sample%20City`
- The path parameters `:grocery` and `:city` are required.

**Response** (`200 OK`):

```json
{
  "stores": [
    {
      "id": 2,
      "grocery": "My Grocery",
      "lat": 12.34,
      "lng": 56.78,
      "street": "123 Main St",
      "city": "Sample City",
      "zip_code": "12345",
      "working_hours": "{\"mon\":\"8-20\"}",
      "picks_up_in_store": true
    }
  ]
}
```

##### Examples

**cURL**:

```bash
curl -X GET http://localhost:3002/api/store/My%20Grocery/Sample%20City
```

**Postman**:

1. **Method**: `GET`
2. **URL**: `http://localhost:3002/api/store/My%20Grocery/Sample%20City`
3. **Send** the request; expect a JSON array of stores matching the specified grocery and city.

---

#### Validation

**Zod** performs schema validation on incoming JSON bodies:

- **Product**: Requires `full_name` (string), `price` (number), `localization` (object with `grocery`, `lat`, `lng`, `street`).
- **Store**: Requires `name` (string), `lat` (number), `lng` (number), and `street` (string). Other fields are optional.

On failure, the service returns **400 Bad Request** with error details in JSON.

---

#### Data Models (Prisma)

Below is an **example** of your **Prisma** schema reflecting the **(grocery, lat, lng, street)** uniqueness and the use of `(name_id, localizationId)` in `Product`:

```prisma
generator client {
    provider = "prisma-client-js"
}

datasource db {
    provider = "postgresql"
    url      = env("REMOTE_DATABASE_URL")
}

model Product {
    id             Int              @id @default(autoincrement())
    name_id        String
    full_name      String
    name           String
    description    String
    current_price  Float
    discount       Float
    localizationId Int
    created_at     DateTime         @default(now())
    updated_at     DateTime         @updatedAt
    history        ProductHistory[]
    price_for_kg   Float?
    image_url      String?
    quantity       String?

    localization Localization @relation(fields: [localizationId], references: [id])

    @@unique([name_id, localizationId])
}

model ProductHistory {
    id          Int      @id @default(autoincrement())
    product     Product  @relation(fields: [productId], references: [id])
    productId   Int
    price       Float
    discount    Float
    recorded_at DateTime @default(now())
}

model Localization {
  id                Int       @id @default(autoincrement())
  grocery           String
  lat               Float
  lng               Float
  street            String
  city              String?
  zip_code          String?
  working_hours     String?
  picks_up_in_store Boolean?
  products          Product[]

  @@unique(name: "grocery_lat_lng_street", [grocery, lat, lng, street])
}
```

**Key Points**

- The **`Localization`** model uses **`@@unique([grocery, lat, lng, street])`** so two stores with the same `lat`, `lng`, `grocery` but different `street` are considered **different**.
- **Product** no longer uses `document_id` but relies on `(name_id, localizationId)` as its unique reference to avoid duplicates.
- The service handles **upserting** data within database transactions (`$transaction`).

---

#### Dockerfile Overview

A typical Dockerfile for the **Product Receiver Service** might look like:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

EXPOSE 3002

CMD ["npm", "start"]
```

- **Installs dependencies**.
- **Generates Prisma Client**.
- **Exposes port `3002`**.
- **Starts** via `npm start`.

---

#### Starting the Service

1. **Install** dependencies:

    ```bash
    npm install
    ```

2. **Generate** Prisma client (or run migrations):

    ```bash
    npx prisma migrate dev
    ```

3. **Start** the service:

    ```bash
    npm start
    ```

The service listens on `PRODUCT_RECEIVER_SERVICE_PORT` (default `3002`).

---

#### Error Handling

- **400 Bad Request**: Triggered by **Zod** validation failures. Returns JSON with `error` and `details` fields.

    ```json
    {
      "error": "Validation error",
      "details": { ... }
    }
    ```

- **500 Internal Server Error**: Triggered by database or server-side errors. Returns JSON with `error` and optionally `details` fields.

    ```json
    { "error": "Failed to save product", "details": "..." }
    ```

---

#### Logging with Logstash

Every successful **product** creation or update triggers a **Logstash** call with product data.  
You can configure `LOGSTASH_HOST` and `LOGSTASH_PORT`.  
An updated Logstash pipeline might look like:

```plaintext
input {
  beats {
    port => 5044
  }

  tcp {
    port => 50000
    codec => json_lines
  }
}

filter {
  if [localization] {
    mutate {
      # Rename 'lng' to 'lon' for Elasticsearch compatibility
      rename => { "[localization][lng]" => "[localization][lon]" }
    }
    mutate {
      # Create the 'location' field as a string "lat,lon"
      add_field => { "location" => "%{[localization][lat]},%{[localization][lon]}" }
    }
  }
  if ![name] and [name_id] {
    mutate {
      copy => { "name_id" => "name" }
    }
  }
}

output {
  elasticsearch {
    hosts => "http://elasticsearch:9200"
    index => "products"
    document_id => "%{id}"
    action => "index"
    doc_as_upsert => true
    user => "logstash_internal"
    password => "${LOGSTASH_INTERNAL_PASSWORD}"
  }
  stdout { codec => rubydebug }
}
```

**Input Configuration:**

- **Beats Input** on port `5044` for receiving logs from Beats agents.
- **TCP Input** on port `50000` with `json_lines` codec to receive JSON-formatted logs directly.

**Filter Configuration:**

- **Localization Handling**:
  - Renames `lng` to `lon` to match Elasticsearch's expected field name.
  - Creates a `location` field combining `lat` and `lon` as a string `"lat,lon"`.
- **Name Handling**:
  - If `name` is missing but `name_id` exists, copies `name_id` to `name` to ensure consistency.

**Output Configuration:**

- **Elasticsearch Output** sends the logs to the `products` index on `elasticsearch:9200`.
  - **Document ID** is set to `%{id}` to ensure idempotency.
  - **`doc_as_upsert`** is enabled to perform upserts based on `document_id`.
  - **Authentication** using `logstash_internal` user and `LOGSTASH_INTERNAL_PASSWORD`.
- **Standard Output** (`stdout`) with `rubydebug` codec for debugging purposes.

**Note:** Ensure that Logstash is running and accessible at the specified `LOGSTASH_HOST` and `LOGSTASH_PORT`. Also, verify that the Elasticsearch service is reachable and properly secured.

---

#### Additional Notes

1. **Transaction-Based Upserts**
   - Uses `prisma.$transaction()` to upsert product data (and create `ProductHistory` entries).
   - For stores (`Localization`), uses another upsert approach with the composite key `[grocery, lat, lng, street]`.

2. **Retry Logic** (Product)
   - If an upsert fails due to known Prisma errors (`P2028`, `P2002`), the service tries up to **3 times** with a **1-second delay** in between.

3. **Renaming `long` to `lng`**
   - In both product and store requests, any field named `long` is automatically renamed to `lng`.
   - This ensures compatibility with the Prisma schema which uses `lng` for longitude.

4. **Street Handling**
   - If `street` is not provided, it defaults to an empty string `""`.
   - This allows two stores with the same `(grocery, lat, lng)` but different `street` to be considered distinct.

5. **Sanitization of Strings**
   - Uses a `sanitizeString` function to normalize product names into `name_id` by converting to lowercase, removing non-alphanumeric characters, replacing spaces with underscores, and trimming trailing underscores.

6. **Error Codes Handling**
   - **`P2028`**: Transaction failed due to a deadlock or other transient database issue.
   - **`P2002`**: Unique constraint failed. The retry logic addresses these by attempting the operation again.

7. **Logging Levels**
   - The service logs detailed information at the `debug` level, which can be adjusted via environment variables as needed.

8. **Prisma Migrations**
   - After updating the Prisma schema, ensure to run migrations to apply changes to the database:

    ```bash
    npx prisma migrate dev
    ```

9. **Concurrency Considerations**
   - The retry logic helps manage transient errors but ensure that the service handles high concurrency scenarios gracefully to prevent overwhelming the database.

10. **Security Best Practices**
    - Secure the Logstash endpoint to prevent unauthorized access.
    - Use environment variables or secrets management tools to handle sensitive information like database credentials and Logstash passwords.

---

**Thank you** for using the **liiist** app! If you have questions or encounter any issues, please contact the development team or open an issue in the relevant repository.

---