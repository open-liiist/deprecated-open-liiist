# liiist

A smart grocery list app that helps users find the best prices at nearby markets. Create your list, enter your location, and the app compares prices to recommend the most economical shopping options.

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
   git clone https://github.com/gabref/grocygo.git
   cd grocygo
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

For that, i'm using traefik, just exploring, we can change the tool later.

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

## Endpoints

### Auth Service (nodejs)
- **POST /auth/register**: Register a new user.
- **POST /auth/login**: Login a user.
- **POST /auth/refresh**: Refresh user token.
- **POST /auth/verify**: Verify user token.
- **POST /auth/revoke**: Revoke user token.
- **POST /auth/logout**: Logout user.
- **POST /users/:id**: Get user by ID.
- **POST /status**: Get service status.

### Notification Alert Service (golang)
- **POST /ricevi_code**: Gets errors from the other services.

### Product Receiver Service (nodejs)
- **POST /product**: Receives products from the scraper service.
- **POST /store**: Receives stores from the scraper service.
- **GET /store**: Get all stores.
- **GET /store/:grocery/:city**: Get all stores by grocery and city.

### Search Service (Rust)

#### **POST /search**
**Description:** Search for products by a query string.
- **Request Body (Query Parameters):**
  ```json
  {
    "query": "string"  // The product name or keyword to search for
  }
  ```
- **Response Body:**
  ```json
  {
    "most_similar": [
      {
        "_id": "string",
        "name": "string",
        "full_name": "string",
        "description": "string",
        "price": "float",
        "discount": "float|null",
        "localization": {
          "grocery": "string",
          "lat": "float",
          "lon": "float"
        },
        "distance": "float|null"
      }
    ],
    "lowest_price": [
      {
        "_id": "string",
        "name": "string",
        "full_name": "string",
        "description": "string",
        "price": "float",
        "discount": "float|null",
        "localization": {
          "grocery": "string",
          "lat": "float",
          "lon": "float"
        },
        "distance": "float|null"
      }
    ]
  }
  ```
---

#### **POST /product/exists**
**Description:** Check if a product exists near a location.
- **Request Body:**
  ```json
  {
    "product": "string", // The name of the product
    "position": {
      "latitude": "float",
      "longitude": "float"
    }
  }
  ```
- **Response Body:**
  ```json
  {
    "product": "string",
    "exists": "boolean",  // true if product exists, false otherwise
    "details": {
      "_id": "string",
      "name": "string",
      "full_name": "string",
      "description": "string",
      "price": "float",
      "discount": "float|null",
      "localization": {
        "grocery": "string",
        "lat": "float",
        "lon": "float"
      },
      "distance": "float|null"
    } | null
  }
  ```

---

#### **POST /product/in-shop**
**Description:** Search for a specific product in a specific store.
- **Request Body:**
  ```json
  {
    "product": "string", // The name of the product
    "shop": "string", // The name or identifier of the shop
    "position": {
      "latitude": "float",
      "longitude": "float"
    }
  }
  ```
- **Response Body:**
  ```json
  {
    "product": "string",
    "shop": "string",
    "exists": "boolean", // true if product is in the shop, false otherwise
    "details": {
      "_id": "string",
      "name": "string",
      "full_name": "string",
      "description": "string",
      "price": "float",
      "discount": "float|null",
      "localization": {
        "grocery": "string",
        "lat": "float",
        "lon": "float"
      },
      "distance": "float|null"
    } | null
  }
  ```
---

#### **POST /product/lowest-price**
**Description:** Find the lowest price for a list of products.
- **Request Body:**
  ```json
  {
    "products": ["string", "string"], // List of product names to search for
    "position": {
      "latitude": "float",
      "longitude": "float"
    }
  }
  ```

- **Response Body:**
  ```json
  [
    {
      "shop": "string",
      "total_price": "float", // Total price for all products at this shop
      "products": [
        {
          "shop": "string",
          "name": "string",
          "description": "string",
          "price": "float",
          "discount": "float|null",
          "distance": "float"
        }
      ]
    }
  ]
  ```
---

#### **GET /stores**
**Description:** Get a list of all available stores.
- **Response Body:**
  ```json
  [
    {
      "id": "integer",
      "grocery": "string", // Name of the store
      "lat": "float",
      "lng": "float",
      "street": "string|null",
      "city": "string|null",
      "zip_code": "string|null",
      "working_hours": "string|null",
      "picks_up_in_store": "boolean|null"
    }
  ]
  ```

---

#### **GET /store/:id/products**
**Description:** Get a list of products available at a specific store.
- **Path Parameters:**
  - **id**: The ID of the store.
- **Response Body:**
  ```json
  [
    {
      "id": "integer",
      "name": "string", // Name of the product
      "description": "string",
      "current_price": "float",
      "discount": "float",
      "price_for_kg": "float|null",
      "image_url": "string|null"
    }
  ]
  ```
