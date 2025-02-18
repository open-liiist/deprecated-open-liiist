# # (Alert! Documentation Expired)  Data Flow Visualization

This document contains **Mermaid** diagrams illustrating the data flows within the system, focusing on **Products**, **Stores**, and their relationships with the database and API endpoints.
**(Alert! Documentation Expired)**  
The documentation is currently under revision and updates. Some sections may be incomplete or undergoing modifications.
---

## 1. Database Schema Relationships

### Diagram

```mermaid
erDiagram
    Product {
        INT id
        STRING name_id
        STRING full_name
        STRING name
        STRING description
        FLOAT current_price
        FLOAT discount
        INT localizationId
        DATETIME created_at
        DATETIME updated_at
        FLOAT price_for_kg
        STRING image_url
        STRING quantity
    }
    ProductHistory {
        INT id
        INT productId
        FLOAT price
        FLOAT discount
        DATETIME recorded_at
    }
    Localization {
        INT id
        STRING grocery
        FLOAT lat
        FLOAT lng
        STRING street
        STRING city
        STRING zip_code
        STRING working_hours
        BOOLEAN picks_up_in_store
    }

    Product ||--o{ ProductHistory : has
    Localization ||--o{ Product : has

```

### Explanation

- **Entities**:
  - `Product` represents an item sold in a specific location.
  - `ProductHistory` tracks changes in product prices and discounts over time.
  - `Localization` represents stores or supermarkets with unique combinations of `grocery`, `lat`, `lng`, and `street`.
- **Relationships**:
  - Each `Product` is associated with one `Localization`.
  - Each `Product` can have multiple `ProductHistory` entries.

---

## 2. API Data Flow: Product Creation/Update

### Diagram

```mermaid
sequenceDiagram
    participant Client as Client
    participant API as Product Receiver (API)
    participant DB as PostgreSQL Database
    participant Logstash as Logstash

    Client->>API: POST /product
    API->>API: Validate Product Data (Zod)
    alt Validation Success
        API->>DB: Upsert Localization
        API->>DB: Upsert Product
        API->>DB: Create ProductHistory Entry
        API->>Logstash: Send Logs (Optional)
        API-->>Client: 201 Created
    else Validation Failure
        API-->>Client: 400 Validation Error
    end
```

### Explanation

- **Flow**:
  - Client sends a `POST /product` request.
  - Data is validated using **Zod**.
  - On success:
    - `Localization` is upserted.
    - `Product` is upserted with a unique combination of `name_id` and `localizationId`.
    - A `ProductHistory` entry is created.
    - Logs are optionally sent to Logstash.
  - On failure, the client receives a validation error response.

---

## 3. API Data Flow: Store Creation/Update

### Diagram

```mermaid
sequenceDiagram
    participant Client as Client
    participant API as Product Receiver (API)
    participant DB as PostgreSQL Database

    Client->>API: POST /store
    API->>API: Validate Store Data (Zod)
    alt Validation Success
        API->>DB: Upsert Store (Localization)
        API-->>Client: 201 Created
    else Validation Failure
        API-->>Client: 400 Validation Error
    end
```

### Explanation

- **Flow**:
  - Client sends a `POST /store` request.
  - Store data is validated using **Zod**.
  - On success:
    - `Localization` (store) is upserted with a unique combination of `grocery`, `lat`, `lng`, and `street`.
  - On failure, the client receives a validation error.

---

## 4. Composite Unique Constraints

### Diagram

```mermaid
classDiagram
    class Localization {
        Int id
        String grocery
        Float lat
        Float lng
        String street OPTIONAL
        @@unique(grocery, lat, lng, street)
    }

    class Product {
        Int id
        String name_id
        Int localizationId
        @@unique(name_id, localizationId)
    }
```

### Explanation

- **Localization**:
  - Unique constraint ensures no duplicate stores based on `grocery`, `lat`, `lng`, and `street`.
- **Product**:
  - Unique constraint ensures no duplicate products within the same store, based on `name_id` and `localizationId`.
