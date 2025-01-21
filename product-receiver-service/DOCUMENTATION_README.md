Below is the **updated** and **expanded** documentation (@ 21 Jen 2021) for the **Product Receiver Service**.

- Use of **Zod** for validation.  
- Automatic renaming of `long` to `lng`. (*)
- **Composite Key** in `Localization` now includes **`street`** for uniquely identifying a store.  
- **Product** upserts using `(name_id, localizationId)` as the internal unique reference.
- **Retry logic** for product upserts on known Prisma errors.  
- Automatic logging to **Logstash** on successful product upserts.  

You’ll also find **cURL** and **Postman** usage examples for each endpoint.

---

# Product Receiver Service Documentation

## Table of Contents

1. [Introduction](#introduction)  
2. [Base URL](#base-url)  
3. [Environment Variables](#environment-variables)  
4. [Endpoints](#endpoints)  
   - [Health Check](#health-check)  
   - [Product Endpoint](#product-endpoint)  
   - [Store Endpoint](#store-endpoint)  
5. [Validation](#validation)  
6. [Data Models (Prisma)](#data-models-prisma)  
7. [Dockerfile Overview](#dockerfile-overview)  
8. [Starting the Service](#starting-the-service)  
9. [Error Handling](#error-handling)  
10. [Logging with Logstash](#logging-with-logstash)  
11. [Additional Notes](#additional-notes)

---

## Introduction

The **Product Receiver Service** is a Node.js application built on **Express.js** that interacts with a **PostgreSQL** database via **Prisma**. It provides endpoints to:

- **Upsert** (create or update) **Product** data, with built-in **retry** on certain Prisma errors.  
- **Upsert** Store data (known as `Localization` in the database), now identified by **(grocery, lat, lng, street)**.  
- Retrieve **all Stores** or filter by `grocery` and `city`.  
- Check **service health** with a simple endpoint.  

Additionally:

- Validates **incoming requests** via **Zod** to ensure data integrity.  
- **Sends product data to Logstash** after every successful product creation or update.  

---

## Base URL

By default, the service listens on **port 3002**, with all routes under the prefix `/api`.  
For example:

```
http://localhost:3002/api
```

*(You can adjust this in `.env` by setting `PRODUCT_RECEIVER_SERVICE_PORT`.)*

---

## Environment Variables

A typical `.env` might include:

```bash
PRODUCT_RECEIVER_SERVICE_PORT=3002
REMOTE_DATABASE_URL=postgresql://list-user:MyPassword@my-db-host:5432/my_db
LOGSTASH_HOST=localhost
LOGSTASH_PORT=50000
```

- **`PRODUCT_RECEIVER_SERVICE_PORT`**: Port for the service (default: `3002`).  
- **`REMOTE_DATABASE_URL`**: PostgreSQL connection string.  
- **`LOGSTASH_HOST`** and **`LOGSTASH_PORT`**: Destination for sending logs to Logstash.

---

## Endpoints

### Health Check

- **Endpoint**: `GET /api/health`  
- **Description**: Checks service health.  

#### Request

- **Method**: `GET`  
- **Headers**: *None*  
- **Body**: *None*  

#### Response

- **Status**: `200 OK`  
- **Body**:
  ```json
  { "status": "OK" }
  ```

#### cURL Example

```bash
curl -X GET http://localhost:3002/api/health
```

#### Postman Example

1. Create a **GET** request: `http://localhost:3002/api/health`.  
2. Click **Send**; expect `{"status":"OK"}`.

---

### Product Endpoint

#### Create/Update Product

- **Endpoint**: `POST /api/product`  
- **Description**: Creates or updates a **Product** using a composite approach. Internally uses `(name_id, localizationId)` as the unique reference.  
- **Validation**: Zod ensures required fields (`full_name`, `price`, `localization`) and correct data types.

##### Request

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
  - **Optional**:
    - `name` (string)  
    - `description` (string/null)  
    - `discount` (number)  
    - `quantity` (string/null)  
    - `img_url` (string)  
    - `price_for_kg` (number)

##### Sample Request Body

```json
{
  "full_name": "Banana Chiquita",
  "name": "Banana Chiquita",
  "description": "Fresh bananas",
  "price": 2.55,
  "discount": 0.1,
  "quantity": "1 bunch",
  "img_url": "https://example.com/banana.jpg",
  "price_for_kg": 2.50,
  "localization": {
    "grocery": "My Grocery",
    "lat": 12.34,
    "lng": 56.78
  }
}
```

##### Response

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
      "discount": 0.1,
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

##### cURL Example

```bash
curl -X POST http://localhost:3002/api/product \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Banana Chiquita",
    "price": 2.55,
    "localization": {
      "grocery": "My Grocery",
      "lat": 12.34,
      "lng": 56.78
    }
  }'
```

##### Postman Example

1. Create a new **POST** request: `http://localhost:3002/api/product`.  
2. Under **Body** → **raw** → **JSON**:
   ```json
   {
     "full_name": "Banana Chiquita",
     "price": 2.55,
     "localization": {
       "grocery": "My Grocery",
       "lat": 12.34,
       "lng": 56.78
     }
   }
   ```
3. Click **Send**; expect a `201 Created`.

---

### Store Endpoint

#### Create/Update Store

- **Endpoint**: `POST /api/store`  
- **Description**: Creates or updates a **Store** (the `Localization` model) using a new composite key: **`(grocery, lat, lng, street)`**. If `street` is omitted, an empty string `""` is used by default for the key.  
- **Validation**: Zod ensures `name`, `lat`, and `lng` exist and are correct types.

##### Request

- **Method**: `POST`  
- **Headers**:  
  - `Content-Type: application/json`
- **Body (JSON)**:
  - **Required**:
    - `name` (string) → stored as `grocery` in the DB  
    - `lat` (number)  
    - `lng` (number)
  - **Optional**:
    - `street` (string) → used in the unique constraint if provided  
    - `city` (string)  
    - `working_hours` (string)  
    - `picks_up_in_shop` (boolean)  
    - `zip_code` (string)

##### Sample Request Body

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

##### Response

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

##### cURL Example

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

##### Postman Example

1. **POST** `http://localhost:3002/api/store`.  
2. **Body** → **raw** → **JSON**:
   ```json
   {
     "name": "My Grocery",
     "lat": 12.34,
     "lng": 56.78
   }
   ```
3. **Send** → `201 Created`.

---

#### Get All Stores

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

#### Get Stores by Grocery/City

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

---

## Validation

**Zod** performs schema validation on incoming JSON bodies:

- **Product**: Requires `full_name` (string), `price` (number), and `localization` with fields `grocery`, `lat`, `lng`.  
- **Store**: Requires `name` (string), `lat` (number), `lng` (number). Other fields are optional.

On failure, the service returns **400 Bad Request** with error details in JSON.

---

## Data Models (Prisma)

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
  street            String?
  city              String?
  zip_code          String?
  working_hours     String?
  picks_up_in_store Boolean?
  products          Product[]

  @@unique(name: "grocery_lat_lng_street", [grocery, lat, lng, street])
}
```

### Key Points

- The **`Localization`** model uses **`@@unique([grocery, lat, lng, street])`** so two stores with the same `lat`, `lng`, `grocery` but different `street` are considered **different**.  
- **Product** no longer uses `document_id` but relies on `(name_id, localizationId)` as its unique reference to avoid duplicates.  
- The service handles **upserting** data within database transactions (`$transaction`).

---

## Dockerfile Overview

A typical Dockerfile might look like:

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

- Installs dependencies.  
- Generates Prisma Client.  
- Exposes port `3002`.  
- Starts via `npm start`.

---

## Starting the Service

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

## Error Handling

- **400 Bad Request**: Triggered by **Zod** validation failures.  
- **500 Internal Server Error**: Database or server-side errors.  

Errors return JSON with `error` and possibly a `details` field.

---

## Logging with Logstash

Every successful **product** creation or update triggers a **Logstash** call with product data.  
You can configure `LOGSTASH_HOST` and `LOGSTASH_PORT`.  
An example Logstash pipeline might look like:

```plaintext
input {
  tcp {
    port => 50000
    codec => json_lines
  }
}

output {
  elasticsearch {
    hosts => ["localhost:9200"]
    index => "product_logs"
  }
}
```

---

## Additional Notes

1. **Transaction-Based Upserts**  
   - Uses `prisma.$transaction()` to upsert product data (and create `ProductHistory` entries).  
   - For stores (`Localization`), uses another upsert approach with the composite key `[grocery, lat, lng, street]`.

2. **Retry Logic** (Product)  
   - If an upsert fails due to known Prisma errors (`P2028`, `P2002`), the service tries up to 3 times with a 1-second delay in between.

3. **Renaming `long` to `lng`**  
   - In both product and store requests, any field named `long` is automatically renamed to `lng`.  

4. **Street Handling**  
   - If `street` is not provided, it may default to an empty string `""`. That way, two stores with the same `(grocery, lat, lng)` but different `street` are considered distinct.

---

**Thank you** for using the **Product Receiver Service**! If you have questions or encounter any issues, please contact the development team or open an issue in the relevant repository.