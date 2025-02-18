# # (Alert! Documentation Expired) Integration Guide: Scraping Service to Product Receiver and Database

## Table of Contents

1. [Introduction](#introduction)
2. [System Architecture](#system-architecture)
3. [API Endpoints](#api-endpoints)
    - [Endpoint `/product`](#endpoint-product)
    - [Endpoint `/store`](#endpoint-store)
    - [Health Check Endpoint `/health`](#health-check-endpoint-health)
4. [Data Structures](#data-structures)
    - [Product Payload](#product-payload)
    - [Store Payload](#store-payload)
5. [Example Payloads](#example-payloads)
    - [Product Example](#product-example)
    - [Store Example](#store-example)
6. [Data Processing Flow](#data-processing-flow)
    - [1. Receiving the Request](#1-receiving-the-request)
    - [2. Data Validation](#2-data-validation)
    - [3. Data Transformation](#3-data-transformation)
        - [Transformations for `/product`](#transformations-for-product)
        - [Transformations for `/store`](#transformations-for-store)
    - [4. Database Operations](#4-database-operations)
        - [Product Upsert](#product-upsert)
        - [Store Upsert](#store-upsert)
        - [Product History Recording](#product-history-recording)
    - [5. Logging](#5-logging)
    - [6. Response to Scraping Service](#6-response-to-scraping-service)
7. [Detailed Data Mapping and Transformation](#detailed-data-mapping-and-transformation)
    - [Mapping for Products](#mapping-for-products)
    - [Mapping for Stores](#mapping-for-stores)
8. [Database Schema](#database-schema)
    - [Prisma Models](#prisma-models)
9. [Error Handling](#error-handling)
10. [Logging Mechanism](#logging-mechanism)
11. [Conclusion](#conclusion)
12. [Appendix](#appendix)

---

## Introduction

This comprehensive guide details the integration between the **Scraping Service**, **Product Receiver**, and the **PostgreSQL Database**. The **Scraping Service** extracts data from various supermarkets and sends it to the **Product Receiver** through defined API endpoints. The **Product Receiver** validates, transforms, processes, and stores the data in the database using Prisma ORM. Additionally, it logs pertinent information for monitoring and debugging purposes.

---

## System Architecture

![System Architecture](https://via.placeholder.com/800x400?text=System+Architecture+Diagram)

*Figure: Overview of the integration between Scraping Service, Product Receiver, and Database.*

---

## API Endpoints

The **Product Receiver** exposes the following primary endpoints:

1. **`POST /product`**: Receives product data.
2. **`POST /store`**: Receives store (localization) data.
3. **`GET /health`**: Health check endpoint to verify the service status.
4. **Additional GET endpoints** for fetching store data.

### Endpoint `/product`

- **Method**: `POST`
- **Description**: Receives and processes product data from the Scraping Service.
- **URL**: `/product`
- **Headers**:
  - `Content-Type: application/json`
- **Body**: JSON object adhering to the [Product Payload](#product-payload) structure.

### Endpoint `/store`

- **Method**: `POST`
- **Description**: Receives and processes store (localization) data from the Scraping Service.
- **URL**: `/store`
- **Headers**:
  - `Content-Type: application/json`
- **Body**: JSON object adhering to the [Store Payload](#store-payload) structure.

### Health Check Endpoint `/health`

- **Method**: `GET`
- **Description**: Provides the current status of the Product Receiver service.
- **URL**: `/health`
- **Response**:
  - **Status Code**: `200 OK`
  - **Body**:
    ```json
    {
      "status": "OK"
    }
    ```

---

## Data Structures

### Product Payload

The product data sent to the `/product` endpoint must conform to the following structure:

```json
{
  "full_name": "string",          // **Required**: Full name of the product.
  "name": "string",               // Optional: Short name of the product.
  "description": "string",        // Optional: Description of the product. Can be null.
  "price": 0.0,                   // **Required**: Current price of the product. Must be >= 0.
  "discount": 0.0,                // Optional: Discount on the product. Must be >= 0.
  "quantity": "string",           // Optional: Quantity available. Can be null.
  "img_url": "http://url.com",    // Optional: Valid URL to the product image.
  "price_for_kg": 0.0,            // Optional: Price per kilogram.
  "localization": {               // **Required**: Localization details of the store.
    "grocery": "string",          // **Required**: Name of the grocery store.
    "lat": 0.0,                   // **Required**: Latitude (-90 to 90).
    "lng": 0.0                    // **Required**: Longitude (-180 to 180).
    // "street": "string"          // Optional: Street address of the store.
  }
}
```

### Store Payload

The store data sent to the `/store` endpoint must conform to the following structure:

```json
{
  "name": "string",               // **Required**: Name of the grocery store.
  "lat": 0.0,                     // **Required**: Latitude of the store location (-90 to 90).
  "lng": 0.0,                     // **Required**: Longitude of the store location (-180 to 180).
  "street": "string",             // Optional: Street address. Can be null.
  "city": "string",               // Optional: City where the store is located.
  "working_hours": "string",      // Optional: Operating hours of the store.
  "picks_up_in_shop": true,       // Optional: Indicates if in-store pickup is available.
  "zip_code": "string"            // Optional: ZIP code of the store location.
}
```

---

## Example Payloads

### Product Example

```json
{
  "full_name": "Organic Whole Milk 1L",
  "name": "Whole Milk 1L",
  "description": "Fresh organic whole milk in a 1-liter bottle.",
  "price": 2.50,
  "discount": 0.25,
  "quantity": "Available",
  "img_url": "http://example.com/images/organic_whole_milk_1l.png",
  "price_for_kg": 2.50,
  "localization": {
    "grocery": "HealthMart",
    "lat": 40.7128,
    "lng": -74.0060,
    "street": "123 Wellness Blvd"
  }
}
```

### Store Example

```json
{
  "name": "HealthMart",
  "lat": 40.7128,
  "lng": -74.0060,
  "street": "123 Wellness Blvd",
  "city": "New York",
  "working_hours": "08:00-22:00",
  "picks_up_in_shop": true,
  "zip_code": "10001"
}
```

---

## Data Processing Flow

Upon receiving data from the **Scraping Service**, the **Product Receiver** processes and stores the information in the database. The following steps outline this flow:

### 1. Receiving the Request

- The **Scraping Service** sends a `POST` request to either `/product` or `/store` with the corresponding payload.
- The **Product Receiver** captures this request, logging the incoming data for traceability.

### 2. Data Validation

Before any processing, the received data undergoes strict validation to ensure it adheres to the predefined schemas.

#### Validation Mechanism

- **Library Used**: [Zod](https://github.com/colinhacks/zod) for schema validation.
- **Schemas Defined**:
  - `productSchema` for `/product` endpoint.
  - `storeSchema` for `/store` endpoint.

#### Validation Process

1. **Product Validation**:
    - Applied in the `validateProduct` middleware.
    - Ensures all required fields are present and correctly formatted.
2. **Store Validation**:
    - Applied in the `validateStore` middleware.
    - Ensures all required fields are present and correctly formatted.

**Middleware Code Snippet**:

```typescript
function validateProduct(req: Request, res: Response, next: NextFunction) {
  const result = productSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ 
      error: 'Validation error', 
      details: result.error.format() 
    });
  }
  res.locals.productData = result.data;
  next();
}

function validateStore(req: Request, res: Response, next: NextFunction) {
  const result = storeSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ 
      error: 'Validation error', 
      details: result.error.format() 
    });
  }
  res.locals.storeData = result.data;
  next();
}
```

- **On Success**: Data is stored in `res.locals.productData` or `res.locals.storeData` for further processing.
- **On Failure**: Responds with `400 Bad Request` and validation error details.

### 3. Data Transformation

After validation, data undergoes transformation to align with the database schema and ensure consistency.

#### Transformations for `/product`

1. **Renaming Fields**:
    - **Function**: `renameLongToLng`
    - **Purpose**: Ensures consistency in field naming, particularly renaming `long` to `lng` if present.
    
    ```typescript
    function renameLongToLng(data: any): any {
      const cloned = { ...data };
      if (cloned.localization?.long !== undefined) {
        cloned.localization.lng = cloned.localization.long;
        delete cloned.localization.long;
      }
      if (cloned.location?.long !== undefined) {
        cloned.location.lng = cloned.location.long;
        delete cloned.location.long;
      }
      return cloned;
    }
    ```
    
2. **Sanitizing `name_id`**:
    - **Function**: `sanitizeString`
    - **Purpose**: Generates a unique identifier (`name_id`) for products based on their `full_name` or `name`.
    
    ```typescript
    function sanitizeString(s: string): string {
      return s
        .toString()
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .replace(/_+$/g, '');
    }
    ```
    
3. **Field Mapping**:
    - **`full_name`** and **`name`**:
        - Used to create `name_id`.
        - `full_name` is stored directly.
    - **`description`**, **`price`**, **`discount`**, **`quantity`**, **`img_url`**, **`price_for_kg`**:
        - Mapped directly to corresponding database fields.
    - **`localization`**:
        - Nested object mapped to `Localization` model.

#### Transformations for `/store`

1. **Renaming Fields**:
    - **`name`** (from payload) is mapped to **`grocery`** in the `Localization` table.
    
    ```typescript
    grocery: data.name, // 'name' from payload mapped to 'grocery' in DB
    ```
    
2. **Field Mapping**:
    - **`lat`**, **`lng`**, **`street`**, **`city`**, **`working_hours`**, **`picks_up_in_shop`**, **`zip_code`**:
        - Mapped directly to corresponding database fields.
    - **`name`**:
        - Mapped to **`grocery`** in the database.

---

## Detailed Data Mapping and Transformation

This section provides an in-depth analysis of how incoming data from the **Scraping Service** is transformed and mapped to the database schema within the **Product Receiver**. Each field is meticulously traced from the payload to its final representation in the database, highlighting any transformations, renamings, default values, and sanitizations applied.

### Mapping for Products

Incoming data from the **Scraping Service** to the `/product` endpoint undergoes several transformations before being stored in the database.

#### 1. Field Renaming and Sanitization

##### a. `full_name` and `name` to `name_id`

- **Incoming Fields**:
  - `full_name`: **Required**
  - `name`: Optional

- **Transformation Process**:
  1. **Selection**:
     - If `full_name` is provided, it is used; otherwise, `name` is used.
  2. **Sanitization**:
     - The selected string is sanitized using the `sanitizeString` function to create `name_id`.
  
- **Function**: `sanitizeString`

  ```typescript
  function sanitizeString(s: string): string {
    return s
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .replace(/_+$/g, '');
  }
  ```
  
- **Steps in `sanitizeString`**:
  1. **Lowercasing**: Converts the string to lowercase to ensure uniformity.
  2. **Removing Non-Alphanumeric Characters**: Strips out any characters that are not letters, numbers, or spaces.
  3. **Replacing Spaces with Underscores**: Transforms one or more whitespace characters into a single underscore to maintain readability and prevent issues with database constraints.
  4. **Trimming Trailing Underscores**: Ensures that the resulting `name_id` does not end with unnecessary underscores.

- **Result**:
  - A consistent and sanitized `name_id` that serves as a unique identifier for the product within a specific store location.

##### b. Example

- **Input**:
  
  ```json
  {
    "full_name": "Organic Whole Milk 1L",
    "name": "Whole Milk 1L"
  }
  ```
  
- **Transformation**:
  
  ```typescript
  const name_id = sanitizeString("Organic Whole Milk 1L"); // "organic_whole_milk_1l"
  ```

#### 2. Localization Handling

##### a. `localization` Object

- **Incoming Fields**:
  - `grocery`: **Required**
  - `lat`: **Required**
  - `lng`: **Required**
  - `street`: Optional

- **Transformation Process**:
  1. **Field Renaming**:
     - No direct renaming; `grocery` remains as is but is mapped to the `Localization.grocery` field in the database.
  2. **Default Values**:
     - If `street` is not provided, it defaults to an empty string (`''`) to maintain the uniqueness constraint.

- **Function**: `renameLongToLng`

  ```typescript
  function renameLongToLng(data: any): any {
    const cloned = { ...data };
    if (cloned.localization?.long !== undefined) {
      cloned.localization.lng = cloned.localization.long;
      delete cloned.localization.long;
    }
    if (cloned.location?.long !== undefined) {
      cloned.location.lng = cloned.location.long;
      delete cloned.location.long;
    }
    return cloned;
  }
  ```
  
- **Purpose**:
  - Ensures that any occurrence of the field `long` is renamed to `lng` for consistency with the database schema.
  - This function is applied to both `/product` and `/store` payloads to handle any potential inconsistencies in field naming.

##### b. Example

- **Input**:
  
  ```json
  {
    "localization": {
      "grocery": "HealthMart",
      "lat": 40.7128,
      "lng": -74.0060,
      "street": "123 Wellness Blvd"
    }
  }
  ```
  
- **Transformation**:
  
  - Since `lng` is already correctly named, no changes occur.
  
  ```typescript
  const transformedData = renameLongToLng(data); // No changes
  ```

##### c. Upsert Localization

- **Composite Key**: `[grocery, lat, lng, street]`
- **Purpose**: Ensures that each store location is uniquely identified based on its name and geographic coordinates.

#### 3. Direct Field Mappings

After processing `name_id` and handling localization, the remaining fields are mapped directly from the payload to the database with minimal or no transformation.

| Incoming Field       | Transformation                            | Database Field          | Notes                                                          |
|----------------------|-------------------------------------------|-------------------------|----------------------------------------------------------------|
| `full_name`          | Stored directly                           | `Product.full_name`     | **Required**                                                   |
| `name`               | Used for `name_id` if `full_name` absent  | `Product.name`          | **Optional**; mapped directly                                |
| `description`        | Stored directly                           | `Product.description`   | **Optional**; can be null                                     |
| `price`              | Stored directly                           | `Product.current_price` | **Required**; must be >= 0                                    |
| `discount`           | Stored directly; defaults to `0.0`        | `Product.discount`      | **Optional**; must be >= 0                                    |
| `quantity`           | Stored directly; defaults to `''`         | `Product.quantity`      | **Optional**; can be null                                     |
| `img_url`            | Stored directly                           | `Product.image_url`     | **Optional**; must be a valid URL                             |
| `price_for_kg`       | Stored directly                           | `Product.price_for_kg`  | **Optional**; can be null                                     |
| `localization.grocery` | Mapped directly                          | `Localization.grocery`  | **Required**                                                   |
| `localization.lat`   | Mapped directly                           | `Localization.lat`      | **Required**; must be between -90 and 90                      |
| `localization.lng`   | Mapped directly                           | `Localization.lng`      | **Required**; must be between -180 and 180                    |
| `localization.street`| Mapped directly; defaults to `''`         | `Localization.street`   | **Optional**; defaults to `''` if not provided                |
| `name`               | Mapped to `Localization.grocery` (for `/store`) | `Localization.grocery` | **Required**; from `/store` payload                           |
| `city`               | Mapped directly                           | `Localization.city`     | **Optional**; from `/store` payload                           |
| `working_hours`      | Mapped directly                           | `Localization.working_hours` | **Optional**; from `/store` payload                       |
| `picks_up_in_shop`   | Mapped directly                           | `Localization.picks_up_in_store` | **Optional**; from `/store` payload                  |
| `zip_code`           | Mapped directly                           | `Localization.zip_code` | **Optional**; from `/store` payload                           |

---

### Mapping for Stores

Incoming data from the **Scraping Service** to the `/store` endpoint undergoes transformations to align with the database schema.

#### 1. Field Renaming

##### `name` to `grocery`

- **Incoming Field**: `name` (**Required**)
- **Transformation**:
  - Renamed to `grocery` to match the database schema.
  
- **Code Snippet**:
  
  ```typescript
  grocery: data.name, // 'name' from payload mapped to 'grocery' in DB
  ```
  
- **Purpose**:
  - Ensures semantic clarity within the database schema, distinguishing between the store's name and product names.

#### 2. Field Mapping

| Incoming Field       | Transformation                            | Database Field                 | Notes                                                        |
|----------------------|-------------------------------------------|--------------------------------|--------------------------------------------------------------|
| `name`               | Renamed to `grocery`                      | `Localization.grocery`         | **Required**                                                 |
| `lat`                | Stored directly                           | `Localization.lat`             | **Required**; must be between -90 and 90                    |
| `lng`                | Stored directly                           | `Localization.lng`             | **Required**; must be between -180 and 180                  |
| `street`             | Stored directly; defaults to `''`         | `Localization.street`          | **Optional**; defaults to `''` if not provided              |
| `city`               | Stored directly                           | `Localization.city`            | **Optional**                                                |
| `working_hours`      | Stored directly                           | `Localization.working_hours`   | **Optional**                                                |
| `picks_up_in_shop`   | Stored directly                           | `Localization.picks_up_in_store` | **Optional**; boolean indicating in-store pickup availability |
| `zip_code`           | Stored directly                           | `Localization.zip_code`        | **Optional**                                                |

#### 3. Default Values

- **`street`**:
  - If not provided, defaults to an empty string (`''`) to maintain the uniqueness constraint.
  
- **Other Optional Fields**:
  - Handled as `NULL` in the database if not provided, as per the Prisma schema definitions.

#### 4. Example

- **Input**:
  
  ```json
  {
    "name": "HealthMart",
    "lat": 40.7128,
    "lng": -74.0060,
    "city": "New York",
    "working_hours": "08:00-22:00",
    "picks_up_in_shop": true,
    "zip_code": "10001"
  }
  ```
  
- **Transformation**:
  
  ```typescript
  const storeData = {
    grocery: "HealthMart",
    lat: 40.7128,
    lng: -74.0060,
    street: "", // Defaulted to empty string since not provided
    city: "New York",
    working_hours: "08:00-22:00",
    picks_up_in_store: true,
    zip_code: "10001"
  };
  ```

---

## Database Operations

Data insertion and updates are handled through Prisma ORM, ensuring transactional integrity and efficiency.

### Product Upsert (`/product` Endpoint)

**Function**: `upsertProductWithRetry`

**Process**:

1. **Generate `name_id`**:
    - Uses `sanitizeString` on `full_name` or `name`.

    ```typescript
    const name_id = sanitizeString(data.full_name || data.name);
    ```

2. **Handle Localization**:
    - **Upsert Localization** based on `grocery`, `lat`, `lng`, and `street`.
    - Ensures each store location is uniquely identified.

    ```typescript
    const loc = await tx.localization.upsert({
      where: {
        grocery_lat_lng_street: {
          grocery: data.localization.grocery,
          lat: data.localization.lat,
          lng: data.localization.lng,
          street: streetForConstraint,
        },
      },
      update: {},
      create: {
        grocery: data.localization.grocery,
        lat: data.localization.lat,
        lng: data.localization.lng,
        street: streetForConstraint,
      },
    });
    ```

3. **Upsert Product**:
    - **Composite Key**: `name_id` + `localizationId` ensures uniqueness per store.
    - **Create or Update**: Depending on the existence, inserts a new product or updates the existing one.

    ```typescript
    const product = await tx.product.upsert({
      where: {
        name_id_localizationId: {
          name_id,
          localizationId: loc.id,
        },
      },
      create: {
        name_id,
        full_name: data.full_name,
        discount: data.discount || 0.0,
        quantity: data.quantity || '',
        description: data.description || '',
        name: name_id,
        current_price: data.price,
        localizationId: loc.id,
        image_url: data.img_url,
        price_for_kg: data.price_for_kg,
      },
      update: {
        full_name: data.full_name,
        discount: data.discount,
        description: data.description || '',
        name: name_id,
        current_price: data.price,
        image_url: data.img_url,
        price_for_kg: data.price_for_kg,
        quantity: data.quantity || '',
      },
    });
    ```

4. **Record Product History**:
    - Logs changes in price and discount in the `ProductHistory` table.

    ```typescript
    await tx.productHistory.create({
      data: {
        productId: product.id,
        price: data.price,
        discount: product.discount,
      },
    });
    ```

5. **Logging to Logstash**:
    - Optionally sends product data to Logstash for monitoring.

    ```typescript
    try {
      await sendToLogstash({
        ...data,
        name_id,
        action: existingProduct ? 'updated' : 'created',
      });
    } catch (logErr) {
      console.error('Logstash Error:', logErr);
    }
    ```

6. **Retry Mechanism**:
    - Implements retries for transient errors (e.g., timeouts, unique constraint violations).

    ```typescript
    async function upsertProductWithRetry(data: any, maxRetries = 3, retryDelay = 1000) {
      let attempt = 0;
      const name_id = sanitizeString(data.full_name || data.name);
      const streetForConstraint = data.localization?.street || '';

      while (attempt < maxRetries) {
        try {
          const result = await prisma.$transaction(async (tx) => {
            // Upsert operations as shown above
          });
          return result;
        } catch (err: any) {
          attempt++;
          console.error(`Attempt ${attempt} failed:`, err);

          if (err.code === 'P2028' || err.code === 'P2002') {
            console.warn('Transient error encountered, retrying...');
            await new Promise((r) => setTimeout(r, retryDelay));
          } else {
            throw err;
          }
        }
      }

      return null;
    }
    ```

**Code Snippet**:

```typescript
async function upsertProductWithRetry(data: any, maxRetries = 3, retryDelay = 1000) {
  let attempt = 0;
  const name_id = sanitizeString(data.full_name || data.name);
  const streetForConstraint = data.localization?.street || '';

  while (attempt < maxRetries) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const loc = await tx.localization.upsert({
          where: {
            grocery_lat_lng_street: {
              grocery: data.localization.grocery,
              lat: data.localization.lat,
              lng: data.localization.lng,
              street: streetForConstraint,
            },
          },
          update: {},
          create: {
            grocery: data.localization.grocery,
            lat: data.localization.lat,
            lng: data.localization.lng,
            street: streetForConstraint,
          },
        });

        const existingProduct = await tx.product.findUnique({
          where: {
            name_id_localizationId: {
              name_id,
              localizationId: loc.id,
            },
          },
        });

        const product = await tx.product.upsert({
          where: {
            name_id_localizationId: {
              name_id,
              localizationId: loc.id,
            },
          },
          create: {
            name_id,
            full_name: data.full_name,
            discount: data.discount || 0.0,
            quantity: data.quantity || '',
            description: data.description || '',
            name: name_id,
            current_price: data.price,
            localizationId: loc.id,
            image_url: data.img_url,
            price_for_kg: data.price_for_kg,
          },
          update: {
            full_name: data.full_name,
            discount: data.discount,
            description: data.description || '',
            name: name_id,
            current_price: data.price,
            image_url: data.img_url,
            price_for_kg: data.price_for_kg,
            quantity: data.quantity || '',
          },
        });

        await tx.productHistory.create({
          data: {
            productId: product.id,
            price: data.price,
            discount: product.discount,
          },
        });

        try {
          await sendToLogstash({
            ...data,
            name_id,
            action: existingProduct ? 'updated' : 'created',
          });
        } catch (logErr) {
          console.error('Logstash Error:', logErr);
        }

        return { product, action: existingProduct ? 'updated' : 'created' };
      });
      return result;
    } catch (err: any) {
      attempt++;
      console.error(`Attempt ${attempt} failed:`, err);

      if (err.code === 'P2028' || err.code === 'P2002') {
        console.warn('Transient error encountered, retrying...');
        await new Promise((r) => setTimeout(r, retryDelay));
      } else {
        throw err;
      }
    }
  }

  return null;
}
```

### Store Upsert (`/store` Endpoint)

**Function**: `createOrUpdateStoreHandler`

**Process**:

1. **Handle Localization**:
    - **Upsert Localization** based on `grocery`, `lat`, `lng`, and `street`.
    - Ensures each store location is uniquely identified.
    
    ```typescript
    const store = await tx.localization.upsert({
      where: {
        grocery_lat_lng_street: {
          grocery: data.name, // 'name' from payload mapped to 'grocery' in DB
          lat: data.lat,
          lng: data.lng,
          street: streetForConstraint,
        },
      },
      update: {
        street: data.street ?? '',
        city: data.city,
        working_hours: data.working_hours,
        picks_up_in_store: data.picks_up_in_shop,
        zip_code: data.zip_code,
      },
      create: {
        grocery: data.name, // 'name' from payload mapped to 'grocery' in DB
        lat: data.lat,
        lng: data.lng,
        street: streetForConstraint,
        city: data.city,
        working_hours: data.working_hours,
        picks_up_in_store: data.picks_up_in_shop,
        zip_code: data.zip_code,
      },
    });
    ```

2. **Logging to Logstash**:
    - Optionally sends store data to Logstash for monitoring.

    ```typescript
    try {
      await sendToLogstash({
        ...data,
        action,
      });
    } catch (logErr) {
      console.error('Logstash Error:', logErr);
    }
    ```

3. **Retry Mechanism**:
    - Similar to product upsert, implements retries for transient errors.

**Code Snippet**:

```typescript
async function createOrUpdateStoreHandler(req: Request, res: Response) {
  try {
    console.log('Received store data:', req.body);
    const data = renameLongToLng(res.locals.storeData);
    const streetForConstraint = data.street || '';

    const result = await prisma.$transaction(async (tx) => {
      const existingStore = await tx.localization.findUnique({
        where: {
          grocery_lat_lng_street: {
            grocery: data.name, // 'name' from payload mapped to 'grocery' in DB
            lat: data.lat,
            lng: data.lng,
            street: streetForConstraint,
          },
        },
      });

      const store = await tx.localization.upsert({
        where: {
          grocery_lat_lng_street: {
            grocery: data.name, // 'name' from payload mapped to 'grocery' in DB
            lat: data.lat,
            lng: data.lng,
            street: streetForConstraint,
          },
        },
        update: {
          street: data.street ?? '',
          city: data.city,
          working_hours: data.working_hours,
          picks_up_in_store: data.picks_up_in_shop,
          zip_code: data.zip_code,
        },
        create: {
          grocery: data.name, // 'name' from payload mapped to 'grocery' in DB
          lat: data.lat,
          lng: data.lng,
          street: streetForConstraint,
          city: data.city,
          working_hours: data.working_hours,
          picks_up_in_store: data.picks_up_in_shop,
          zip_code: data.zip_code,
        },
      });

      return { store, action: existingStore ? 'updated' : 'created' };
    });

    if (!result) {
      return res.status(500).json({ error: 'Failed to save store' });
    }

    const { store, action } = result;
    console.info(`Store ${action}: ${store.grocery}`);

    // Optionally send to Logstash
    try {
      await sendToLogstash({
        ...data,
        action,
      });
    } catch (logErr) {
      console.error('Logstash Error:', logErr);
    }

    return res.status(201).json({
      message: 'Store saved',
      store,
      action,
    });
  } catch (error: any) {
    console.error('Store saving error:', error);
    return res.status(500).json({ error: error.message });
  }
}
```

#### 4. Recording Product History

Every time a product is created or updated, its price and discount are logged in the `ProductHistory` table to maintain a historical record.

**Code Snippet**:

```typescript
await tx.productHistory.create({
  data: {
    productId: product.id,
    price: data.price,
    discount: product.discount,
  },
});
```

---

## Database Schema

The database is managed using [Prisma ORM](https://www.prisma.io/), which provides a type-safe interface for database operations. Below are the Prisma models defining the database schema.

### Prisma Models

#### `Product` Model

```prisma
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
```

- **Fields**:
    - `id`: Primary key.
    - `name_id`: Sanitized identifier for the product.
    - `full_name`: Complete name of the product.
    - `name`: Short name of the product.
    - `description`: Product description.
    - `current_price`: Current price.
    - `discount`: Current discount.
    - `localizationId`: Foreign key referencing `Localization`.
    - `created_at`: Timestamp of creation.
    - `updated_at`: Timestamp of the last update.
    - `history`: Relation to `ProductHistory`.
    - `price_for_kg`, `image_url`, `quantity`: Optional fields.

- **Constraints**:
    - Unique composite key on `[name_id, localizationId]` to prevent duplicate products in the same store.

#### `ProductHistory` Model

```prisma
model ProductHistory {
    id          Int      @id @default(autoincrement())
    product     Product  @relation(fields: [productId], references: [id])
    productId   Int
    price       Float
    discount    Float
    recorded_at DateTime @default(now())
}
```

- **Fields**:
    - `id`: Primary key.
    - `productId`: Foreign key referencing `Product`.
    - `price`: Recorded price.
    - `discount`: Recorded discount.
    - `recorded_at`: Timestamp of the record.

#### `Localization` Model

```prisma
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

- **Fields**:
    - `id`: Primary key.
    - `grocery`: Name of the grocery store.
    - `lat`: Latitude.
    - `lng`: Longitude.
    - `street`, `city`, `zip_code`, `working_hours`, `picks_up_in_store`: Optional fields.
    - `products`: Relation to `Product`.

- **Constraints**:
    - Unique composite key on `[grocery, lat, lng, street]` to uniquely identify each store location.

---

## Error Handling

Robust error handling ensures the system remains reliable and issues are promptly identified and addressed.

### Validation Errors

- **Scenario**: Received data does not conform to the required schema.
- **Response**: `400 Bad Request`
- **Body**:
    ```json
    {
      "error": "Validation error",
      "details": {
        // Detailed validation errors from Zod
      }
    }
    ```

### Database Operation Errors

- **Transient Errors**:
    - **Examples**: Timeouts (`P2028`), unique constraint violations (`P2002`).
    - **Handling**: Implement retry mechanisms with exponential backoff.
  
- **Non-Transient Errors**:
    - **Examples**: Syntax errors, data type mismatches.
    - **Handling**: Log the error and respond with `500 Internal Server Error`.

### Logging Errors

- **Scenario**: Failure in sending logs to Logstash.
- **Handling**: Log the error to the console for manual review. Does not impede the primary data processing flow.

### General Error Response

- **Status Code**: `500 Internal Server Error`
- **Body**:
    ```json
    {
      "error": "Detailed error message"
    }
    ```

---

## Logging Mechanism

Effective logging is vital for maintaining system health and diagnosing issues.

### Console Logging

- **Usage**:
    - Logs incoming requests, successful operations, and errors.
    - Example:
      ```typescript
      console.log('Received product data:', req.body);
      console.error('Product saving error:', error);
      ```

### Logstash Integration

- **Purpose**: Centralized logging for advanced analysis and monitoring.
- **Data Sent**:
    - Product or store data along with the action performed (`created` or `updated`).
- **Implementation**:
    - Utilizes TCP sockets to send JSON-formatted logs.
    - Handles connection errors gracefully to avoid disrupting primary operations.

**Code Snippet**:

```typescript
async function sendToLogstash(data: any): Promise<void> {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    const logstashHost = process.env.LOGSTASH_HOST || 'localhost';
    const logstashPort = parseInt(process.env.LOGSTASH_PORT || '50000', 10);

    client.connect(logstashPort, logstashHost, () => {
      client.write(JSON.stringify(data) + '\n');
      client.end();
    });

    client.on('error', (err) => reject(err));
    client.on('close', () => resolve());
  });
}
```

- **Usage**:
    - Invoked after a successful upsert operation.
    - Sends a JSON payload containing product or store data along with the action performed (`created` or `updated`).
- **Error Handling**:
    - Errors during logging do not affect the primary data processing.
    - Errors are logged to the console for further investigation.

---

## Conclusion

This comprehensive guide outlines the technical integration between the **Scraping Service**, **Product Receiver**, and the **PostgreSQL Database**. By adhering to the defined API contracts, data structures, and processing flows, the system ensures reliable data ingestion, validation, transformation, and storage. Key highlights include:

- **Strict Data Validation**: Ensures data integrity and consistency using Zod schemas.
- **Data Transformation and Mapping**: Aligns incoming data with database schemas, ensuring consistency and uniqueness.
- **Transactional Database Operations**: Utilizes Prisma's transactional capabilities to maintain database consistency.
- **Robust Error Handling**: Differentiates between transient and non-transient errors, implementing retry mechanisms where appropriate.
- **Comprehensive Logging**: Facilitates monitoring and debugging through both console logs and Logstash integration.
- **Scalable Architecture**: Designed to handle data from multiple sources efficiently, ensuring scalability as the number of supermarkets increases.

By following this guide, developers and system integrators can ensure seamless data flow from the Scraping Service to the Product Receiver and ultimately to the database, maintaining a reliable and scalable data infrastructure.

For further assistance or to report issues, please contact the development team.

---

## Appendix

### Source Code Overview

For reference, here is an overview of the key components involved in the data processing flow.

#### Middleware for Validation

```typescript
// src/routes.ts

import express, { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const router = express.Router();

// Product schema
const productSchema = z.object({
  full_name: z.string().min(1, 'full_name is required'),
  name: z.string().optional(),
  description: z.string().nullable().optional(),
  price: z.number().min(0),
  discount: z.number().min(0).optional(),
  quantity: z.string().nullable().optional(),
  img_url: z.string().url().optional(),
  price_for_kg: z.number().min(0).optional(),
  localization: z.object({
    grocery: z.string().min(1, 'grocery is required'),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    // street is optional
  }),
});

// Store schema
const storeSchema = z.object({
  name: z.string().min(1, 'name is required'),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  street: z.string().nullable().optional(),
  city: z.string().optional(),
  working_hours: z.string().optional(),
  picks_up_in_shop: z.boolean().optional(),
  zip_code: z.string().optional(),
});

// Validation middleware
function validateProduct(req: Request, res: Response, next: NextFunction) {
  const result = productSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ 
      error: 'Validation error', 
      details: result.error.format() 
    });
  }
  res.locals.productData = result.data;
  next();
}

function validateStore(req: Request, res: Response, next: NextFunction) {
  const result = storeSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ 
      error: 'Validation error', 
      details: result.error.format() 
    });
  }
  res.locals.storeData = result.data;
  next();
}
```

#### Routes Definition

```typescript
// src/routes.ts

// Health Check
router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK' });
});

// POST /product
router.post('/product', validateProduct, createOrUpdateProductHandler);

// POST /store
router.post('/store', validateStore, createOrUpdateStoreHandler);

// GET /store
router.get('/store', async (_req, res) => {
  try {
    const stores = await prisma.localization.findMany();
    return res.status(200).json({ stores });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch stores', details: error.message });
  }
});

// GET /store/:grocery/:city
router.get('/store/:grocery/:city', async (req, res) => {
  try {
    const { grocery, city } = req.params;
    if (!grocery || !city) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const stores = await prisma.localization.findMany({
      where: { grocery, city },
    });
    return res.status(200).json({ stores });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch stores', details: error.message });
  }
});

export default router;
```

#### Product Handler

```typescript
// src/routes.ts

async function createOrUpdateProductHandler(req: Request, res: Response) {
  try {
    console.log('Received product data:', req.body);
    const data = renameLongToLng(res.locals.productData);

    const result = await upsertProductWithRetry(data);
    if (!result) {
      return res.status(500).json({ error: 'Failed to save product' });
    }
    const { product, action } = result;
    console.info(`Product ${action}: ${product.full_name}`);

    return res.status(201).json({ message: 'Product saved', product, action });
  } catch (error: any) {
    console.error('Product saving error:', error);
    return res.status(500).json({ error: error.message });
  }
}
```

#### Store Handler

```typescript
// src/routes.ts

async function createOrUpdateStoreHandler(req: Request, res: Response) {
  try {
    console.log('Received store data:', req.body);
    const data = renameLongToLng(res.locals.storeData);
    const streetForConstraint = data.street || '';

    const result = await prisma.$transaction(async (tx) => {
      const existingStore = await tx.localization.findUnique({
        where: {
          grocery_lat_lng_street: {
            grocery: data.name, // 'name' from payload mapped to 'grocery' in DB
            lat: data.lat,
            lng: data.lng,
            street: streetForConstraint,
          },
        },
      });

      const store = await tx.localization.upsert({
        where: {
          grocery_lat_lng_street: {
            grocery: data.name, // 'name' from payload mapped to 'grocery' in DB
            lat: data.lat,
            lng: data.lng,
            street: streetForConstraint,
          },
        },
        update: {
          street: data.street ?? '',
          city: data.city,
          working_hours: data.working_hours,
          picks_up_in_store: data.picks_up_in_shop,
          zip_code: data.zip_code,
        },
        create: {
          grocery: data.name, // 'name' from payload mapped to 'grocery' in DB
          lat: data.lat,
          lng: data.lng,
          street: streetForConstraint,
          city: data.city,
          working_hours: data.working_hours,
          picks_up_in_store: data.picks_up_in_shop,
          zip_code: data.zip_code,
        },
      });

      return { store, action: existingStore ? 'updated' : 'created' };
    });

    if (!result) {
      return res.status(500).json({ error: 'Failed to save store' });
    }

    const { store, action } = result;
    console.info(`Store ${action}: ${store.grocery}`);

    // Optionally send to Logstash
    try {
      await sendToLogstash({
        ...data,
        action,
      });
    } catch (logErr) {
      console.error('Logstash Error:', logErr);
    }

    return res.status(201).json({
      message: 'Store saved',
      store,
      action,
    });
  } catch (error: any) {
    console.error('Store saving error:', error);
    return res.status(500).json({ error: error.message });
  }
}
```

---

## Additional Resources

- **Prisma Documentation**: [https://www.prisma.io/docs/](https://www.prisma.io/docs/)
- **Zod Documentation**: [https://github.com/colinhacks/zod](https://github.com/colinhacks/zod)
- **Logstash Documentation**: [https://www.elastic.co/logstash](https://www.elastic.co/logstash)
- **Express.js Documentation**: [https://expressjs.com/](https://expressjs.com/)

For further assistance or to report issues, please contact the development team.