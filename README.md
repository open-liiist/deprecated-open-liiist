# liiist

a smart grocery list app that helps users find the best prices at nearby markets. 
**Create your list, enter your location, and the app compares prices to recommend the most economical shopping options.**
# 🥦🥑🍌🍕🥛🍳🥫🍅🍝🍋🌽🍊🍎🍐🥝🍒🍪🍆🥕🧄🥐🥖🍐🍉🥚🫑🥬🥗


## Features
- Create and manage grocery lists.
- Search for nearby markets based on your location.
- Compare prices across multiple stores.
- Get recommendations for the most cost-effective markets.

## Tech Stack
- **Frontend**: Next.js, TypeScript
- **Microservices**:
  - Authentication/Authorization: Node.js, Express
  - User Service: Node.js, Express
  - Search Service: Rust
  - Scraper Service: Python
- **Database**: PostgreSQL
- **Message Queues**: RabbitMQ, Kafka
- **Containerization**: Docker, Docker Compose
- **API Gateway**: Traefik
- **CI/CD**: Jenkins (or alternative)
- **Deployment**: Kubernetes

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js (for development)
- PostgreSQL (for local database setup)

### Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/open-liiist/liiist.git
   cd liiist
   ```

2. Build and start services:
   ```bash
   docker-compose up --build
   ```

3. Access the frontend at `http://localhost:3000` and API Gateway at `http://localhost:8000`.

### Environment Variables
Create a `.env` file for each service, for example in `services/auth-service/.env`:
```
DATABASE_URL=postgres://user:password@db:5432/authdb
```


### Running Tests
Each microservice has its own tests. To run them:
1. Navigate to the service directory.
2. Run the tests, e.g., for Node.js services:
   ```bash
   npm test
   ```

## HTTPS and TLS

For that, we're using traefik, just exploring, we can change the tool later.

Anyhow, you will need for local development some local certificates, for that use [mkcert](https://github.com/FiloSottile/mkcert),
once you installed it, run:

```bash
# If it's the firt install of mkcert, run
mkcert -install

# Generate certificate for domain "docker.localhost", "domain.local" and their sub-domains
mkcert -cert-file certs/local-cert.pem -key-file certs/local-key.pem "docker.localhost" "*.docker.localhost" "domain.local" "*.domain.local"
```
## Resources
- [Traefik Docs](https://traefik.io/)
- [Traefik with Docker configs](https://github.com/ChristianLempa/boilerplates/blob/main/docker-compose/traefik/config/traefik.yaml)
- [Learn Kubernetes](https://learn.udacity.com/courses/ud615/lessons/c986ef51-ffb5-4821-be4b-358289284f90/concepts/ec269da2-1e35-4a29-bdf8-98176f9adaa2)

---

## API Documentation:
This section provides a detailed description of the APIs for the Notification Alert Service and Product Receiver Service. Each endpoint includes information on method, route, request body, and response, along with examples for testing using cURL and Postman. 

----------
[index]
 1. Search Service (Rust)
 2. Auth Service (Node.js)
 3. Notification Alert Service (Golang)
 4. Product Receiver Service (Node.js)
---
## **Search Service 🔦 (Rust)**

### **1. GET /search**

**Description**: Searches for products based on a query string and returns the most similar results and those with the lowest price.

#### Request

-   **Method**: `GET`
-   **URL**: `http://localhost:4001/search`
-   **Query Parameters**:
    -   `query` (string): The product name or keyword to search for.

#### Response

-   **Content-Type**: `application/json`
    
-   **Example**:
    
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
    

#### Examples

**cURL**:

```bash
curl -X GET "http://localhost:4001/search?query=Pasta"


```

**Postman**:

1.  Method: `GET`
2.  URL: `http://localhost:4001/search?query=Pasta`

----------

### **2. POST /product/exists**

**Description**: Checks if a product exists near a specific location.

#### Request

-   **Method**: `POST`
    
-   **URL**: `http://localhost:4001/product/exists`
    
-   **Body (JSON)**:
    
    ```json
    {
      "product": "Pasta Barilla 500g",
      "position": {
        "latitude": 45.4642,
        "longitude": 9.1900
      }
    }
    
    ```
    

#### Response

-   **Content-Type**: `application/json`
    
-   **Example**:
    
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
    

#### Examples

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

1.  Method: `POST`
    
2.  URL: `http://localhost:4001/product/exists`
    
3.  Body (raw JSON):
    
    ```json
    {
      "product": "Pasta Barilla 500g",
      "position": {
        "latitude": 45.4642,
        "longitude": 9.1900
      }
    }
    
    ```
    

----------

### **3. POST /product/in-shop**

**Description**: Checks if a product is available in a specific shop.

#### Request

-   **Method**: `POST`
    
-   **URL**: `http://localhost:4001/product/in-shop`
    
-   **Body (JSON)**:
    
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
    

#### Response

-   **Content-Type**: `application/json`
    
-   **Example**:
    
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
    

#### Examples

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

1.  Method: `POST`
    
2.  URL: `http://localhost:4001/product/in-shop`
    
3.  Body (raw JSON):
    
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
    

----------

### **4. POST /product/lowest-price**

**Description**: Finds the lowest price for a list of products.

#### Request

-   **Method**: `POST`
    
-   **URL**: `http://localhost:4001/product/lowest-price`
    
-   **Body (JSON)**:
    
    ```json
    {
      "products": ["Pasta Barilla 500g", "Latte intero 1L"],
      "position": {
        "latitude": 45.4642,
        "longitude": 9.1900
      }
    }
    
    ```
    

#### Response

-   **Content-Type**: `application/json`
    
-   **Example**:
    
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
    

#### Examples

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

1.  Method: `POST`
    
2.  URL: `http://localhost:4001/product/lowest-price`
    
3.  Body (raw JSON):
    
    ```json
    {
      "products": ["Pasta Barilla 500g", "Latte intero 1L"],
      "position": {
        "latitude": 45.4642,
        "longitude": 9.1900
      }
    }
    
    ```
    

----------

### **5. GET /stores**

**Description**: Retrieves a list of all available stores.

#### Request

-   **Method**: `GET`
-   **URL**: `http://localhost:4001/stores`

#### Response

-   **Content-Type**: `application/json`
    
-   **Example**:
    
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
    

#### Examples

**cURL**:

```bash
curl -X GET http://localhost:4001/stores


```

**Postman**:

1.  Method: `GET`
2.  URL: `http://localhost:4001/stores`.

----------

### **6. GET /store/:id/products**

**Description**: Retrieves a list of products available at a specific store.

#### Request

-   **Method**: `GET`
-   **URL**: `http://localhost:4001/store/:id/products`
-   **Path Parameters**:
    -   `id` (integer): The ID of the store.

#### Response

-   **Content-Type**: `application/json`
    
-   **Example**:
    
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
    

#### Examples

**cURL**:

```bash
curl -X GET http://localhost:4001/store/1/products


```

**Postman**:

1.  Method: `GET`
2.  URL: `http://localhost:4001/store/1/products`.
----------

## **Auth Service 👥 (Node.js)**

### **1. POST /auth/register**

**Description**: Registers a new user.

#### Request

-   **Method**: `POST`
-   **URL**: `http://localhost:4000/auth/register`
-   **Body (JSON)**:
    
    ```json
    {
      "email": "test@example.com",
      "password": "password123",
      "name": "Test User",
      "dateOfBirth": "1990-01-01",
      "supermarkets": ["tigre"]
    }
    
    ```
    

#### Response

-   **Content-Type**: `application/json`
-   **Example**:
    
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
    

#### Examples

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

1.  Method: `POST`
2.  URL: `http://localhost:4000/auth/register`
3.  Body (raw JSON):
    
    ```json
    {
      "email": "test@example.com",
      "password": "password123",
      "name": "Test User",
      "dateOfBirth": "1990-01-01",
      "supermarkets": ["tigre"]
    }
    
    ```
    

----------

### **2. POST /auth/login**

**Description**: Logs in a user.

#### Request

-   **Method**: `POST`
-   **URL**: `http://localhost:4000/auth/login`
-   **Body (JSON)**:
    
    ```json
    {
      "email": "test@example.com",
      "password": "password123"
    }
    
    ```
    

#### Response

-   **Content-Type**: `application/json`
-   **Example**:
    
    ```json
    {
      "message": "Login successful",
      "accessToken": "token123",
      "refreshToken": "refreshToken123"
    }
    
    ```
    

#### Examples

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

1.  Method: `POST`
2.  URL: `http://localhost:4000/auth/login`
3.  Body (raw JSON):
    
    ```json
    {
      "email": "test@example.com",
      "password": "password123"
    }
    
    ```
    

----------

### **3. POST /auth/refresh**

**Description**: Refreshes a user token.

#### Request

-   **Method**: `POST`
-   **URL**: `http://localhost:4000/auth/refresh`
-   **Body (JSON)**:
    
    ```json
    {
      "refreshToken": "refreshToken123"
    }
    
    ```
    

#### Response

-   **Content-Type**: `application/json`
-   **Example**:
    
    ```json
    {
      "accessToken": "newAccessToken"
    }
    
    ```
    

#### Examples

**cURL**:

```bash
curl -X POST http://localhost:4000/auth/refresh \
-H "Content-Type: application/json" \
-d '{
  "refreshToken": "refreshToken123"
}'

```

**Postman**:

1.  Method: `POST`
2.  URL: `http://localhost:4000/auth/refresh`
3.  Body (raw JSON):
    
    ```json
    {
      "refreshToken": "refreshToken123"
    }
    
    ```
    

----------

### **4. POST /auth/verify**

**Description**: Verifies a user token.

#### Request

-   **Method**: `POST`
-   **URL**: `http://localhost:4000/auth/verify`
-   **Body (JSON)**:
    
    ```json
    {
      "token": "accessToken123"
    }
    
    ```
    

#### Response

-   **Content-Type**: `application/json`
-   **Example**:
    
    ```json
    {
      "message": "Token is valid",
      "userId": "12345"
    }
    
    ```
    

#### Examples

**cURL**:

```bash
curl -X POST http://localhost:4000/auth/verify \
-H "Content-Type: application/json" \
-d '{
  "token": "accessToken123"
}'

```

**Postman**:

1.  Method: `POST`
2.  URL: `http://localhost:4000/auth/verify`
3.  Body (raw JSON):
    
    ```json
    {
      "token": "accessToken123"
    }
    
    ```
    

----------

### **5. POST /auth/revoke**

**Description**: Revokes a user token.

#### Request

-   **Method**: `POST`
-   **URL**: `http://localhost:4000/auth/revoke`
-   **Body (JSON)**:
    
    ```json
    {
      "token": "accessToken123"
    }
    
    ```
    

#### Response

-   **Content-Type**: `application/json`
-   **Example**:
    
    ```json
    {
      "message": "Token revoked successfully"
    }
    
    ```
    

#### Examples

**cURL**:

```bash
curl -X POST http://localhost:4000/auth/revoke \
-H "Content-Type: application/json" \
-d '{
  "token": "accessToken123"
}'

```

**Postman**:

1.  Method: `POST`
2.  URL: `http://localhost:4000/auth/revoke`
3.  Body (raw JSON):
    
    ```json
    {
      "token": "accessToken123"
    }
    
    ```
    

----------

### **6. POST /auth/logout**

**Description**: Logs out a user.

#### Request

-   **Method**: `POST`
-   **URL**: `http://localhost:4000/auth/logout`
-   **Body (JSON)**:
    
    ```json
    {
      "userId": "12345"
    }
    
    ```
    

#### Response

-   **Content-Type**: `application/json`
-   **Example**:
    
    ```json
    {
      "message": "User logged out successfully"
    }
    
    ```
    

#### Examples

**cURL**:

```bash
curl -X POST http://localhost:4000/auth/logout \
-H "Content-Type: application/json" \
-d '{
  "userId": "12345"
}'

```

**Postman**:

1.  Method: `POST`
2.  URL: `http://localhost:4000/auth/logout`
3.  Body (raw JSON):
    
    ```json
    {
      "userId": "12345"
    }
    
    ```
    

----------

### **7. POST /users/:id**

**Description**: Retrieves user details by ID.

#### Request

-   **Method**: `POST`
-   **URL**: `http://localhost:4000/users/:id`
-   **Path Parameters**:
    -   `id`: The user ID.

#### Response

-   **Content-Type**: `application/json`
-   **Example**:
    
    ```json
    {
      "id": "12345",
      "username": "exampleUser",
      "email": "user@example.com"
    }
    
    ```
    

#### Examples

**cURL**:

```bash
curl -X POST http://localhost:4000/users/12345

```

**Postman**:

1.  Method: `POST`
2.  URL: `http://localhost:4000/users/12345`

----------

### **8. POST /status**

**Description**: Retrieves the service status.

#### Request

-   **Method**: `POST`
-   **URL**: `http://localhost:4000/status`

#### Response

-   **Content-Type**: `application/json`
-   **Example**:
    
    ```json
    {
      "status": "OK",
      "uptime": "24h"
    }
    
    ```
    

#### Examples

**cURL**:

```bash
curl -X POST http://localhost:4000/status

```

**Postman**:

1.  Method: `POST`
2.  URL: `http://localhost:4000/status`

----------

# **Notification Alert Service🔔 (Golang)**

### **1. POST /ricevi_code**

**Description**: Receives errors from other services.

#### Request

-   **Method**: `POST`
-   **URL**: `http://localhost:5000/ricevi_code`
-   **Body (JSON)**:
    
    ```json
    {
      "error_code": "500",
      "service": "search-service",
      "details": "Elasticsearch connection failed"
    }
    
    ```
    

#### Response

-   **Content-Type**: `application/json`
-   **Example**:
    
    ```json
    {
      "message": "Error received",
      "timestamp": "2025-01-12T15:04:05Z"
    }
    
    ```
    

#### Examples

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

1.  Method: `POST`
2.  URL: `http://localhost:5000/ricevi_code`
3.  Body (raw JSON):
    
    ```json
    {
      "error_code": "500",
      "service": "search-service",
      "details": "Elasticsearch connection failed"
    }
    
    ```
    

----------

# **Product Receiver Service 🚚 (Node.js)**

### **1. POST /product**

**Description**: Receives products from the scraper service.

#### Request

-   **Method**: `POST`
-   **URL**: `http://localhost:3002/product`
-   **Body (JSON)**:
    
    ```json
    {
      "product_name": "Pasta Barilla 500g",
      "price": 1.5,
      "discount": 0.1,
      "localization": {
        "grocery": "Esselunga",
        "lat": 45.4642,
        "lon": 9.1900
      }
    }
    
    ```
    

#### Response

-   **Content-Type**: `application/json`
-   **Example**:
    
    ```json
    {
      "message": "Product received",
      "productId": "67890"
    }
    
    ```
    

#### Examples

**cURL**:

```bash
curl -X POST http://localhost:3002/product \
-H "Content-Type: application/json" \
-d '{
  "product_name": "Pasta Barilla 500g",
  "price": 1.5,
  "discount": 0.1,
  "localization": {
    "grocery": "Esselunga",
    "lat": 45.4642,
    "lon": 9.1900
  }
}'

```

**Postman**:

1.  Method: `POST`
2.  URL: `http://localhost:3002/product`
3.  Body (raw JSON):
    
    ```json
    {
      "product_name": "Pasta Barilla 500g",
      "price": 1.5,
      "discount": 0.1,
      "localization": {
        "grocery": "Esselunga",
        "lat": 45.4642,
        "lon": 9.1900
      }
    }
    
    ```
    

----------

### **2. POST /store**

**Description**: Receives stores from the scraper service.

#### Request

-   **Method**: `POST`
-   **URL**: `http://localhost:3002/store`
-   **Body (JSON)**:
    
    ```json
    {
      "store_name": "Esselunga",
      "lat": 45.4642,
      "lon": 9.1900,
      "city": "Milano",
      "zip_code": "20100",
      "working_hours": "08:00-20:00"
    }
    
    ```
    

#### Response

-   **Content-Type**: `application/json`
-   **Example**:
    
    ```json
    {
      "message": "Store received",
      "storeId": "12345"
    }
    
    ```
    

#### Examples

**cURL**:

```bash
curl -X POST http://localhost:3002/store \
-H "Content-Type: application/json" \
-d '{
  "store_name": "Esselunga",
  "lat": 45.4642,
  "lon": 9.1900,
  "city": "Milano",
  "zip_code": "20100",
  "working_hours": "08:00-20:00"
}'

```

**Postman**:

1.  Method: `POST`
2.  URL: `http://localhost:3002/store`
3.  Body (raw JSON):
    
    ```json
    {
      "store_name": "Esselunga",
      "lat": 45.4642,
      "lon": 9.1900,
      "city": "Milano",
      "zip_code": "20100",
      "working_hours": "08:00-20:00"
    }
    
    ```
    

----------

### **3. GET /store**

**Description**: Retrieves all stores.

#### Request

-   **Method**: `GET`
-   **URL**: `http://localhost:3002/store`

#### Response

-   **Content-Type**: `application/json`
-   **Example**:
    
    ```json
    [
      {
        "id": 1,
        "store_name": "Esselunga",
        "lat": 45.4642,
        "lon": 9.1900,
        "city": "Milano",
        "zip_code": "20100",
        "working_hours": "08:00-20:00"
      }
    ]
    
    ```
    

#### Examples

**cURL**:

```bash
curl -X GET http://localhost:3002/store

```

**Postman**:

1.  Method: `GET`
2.  URL: `http://localhost:3002/store`

----------

### **4. GET /store/:grocery/:city**

**Description**: Retrieves all stores by grocery and city.

#### Request

-   **Method**: `GET`
-   **URL**: `http://localhost:3002/store/:grocery/:city`
-   **Path Parameters**:
    -   `grocery` (string): The grocery chain name.
    -   `city` (string): The city name.

#### Response

-   **Content-Type**: `application/json`
-   **Example**:
    
    ```json
    [
      {
        "id": 1,
        "store_name": "Esselunga",
        "lat": 45.4642,
        "lon": 9.1900,
        "city": "Milano",
        "zip_code": "20100",
        "working_hours": "08:00-20:00"
      }
    ]
    
    ```
    

#### Examples

**cURL**:

```bash
curl -X GET http://localhost:3002/store/Esselunga/Milano

```

**Postman**:

1.  Method: `GET`
2.  URL: `http://localhost:3002/store/Esselunga/Milano`.

----------
