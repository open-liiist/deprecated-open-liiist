# Global Data Flow Visualization
This document contains **Mermaid** diagrams illustrating the data flows within the system, focusing on **Products**, **Stores**, **Search-Service**, **Elasticsearch**, and their interactions with the database and API endpoints.


```mermaid
flowchart LR
    %% Define subgraphs for logical grouping
    subgraph Frontend
        WebClient[Web Client]
    end

    subgraph Proxy
        Traefik[Traefik]
    end

    subgraph Backend
        AuthService[Auth Service]
        SearchService[Search Service]
        ProductReceiver[Product Receiver Service]
        NotificationAlert[Notification Alert]
        ScrapingService[Scraping Service]
    end

    subgraph Database
        DB[(PostgreSQL)]
        Adminer[Adminer]
    end

    subgraph Search
        Elasticsearch[Elasticsearch]
        Logstash[Logstash]
        Kibana[Kibana]
    end

    subgraph Monitoring
        UptimeKuma[Uptime Kuma]
    end

    %% Frontend to Proxy
    WebClient -->|API Requests| Traefik

    %% Proxy to Backend
    Traefik --> AuthService
    Traefik --> SearchService
    Traefik --> ProductReceiver
    Traefik --> NotificationAlert

    %% Backend to Database
    AuthService --> DB
    SearchService --> DB
    ProductReceiver --> DB
    Adminer --> DB

    %% Backend to Search
    SearchService --> Elasticsearch
    ProductReceiver --> Logstash
    ScrapingService --> ProductReceiver
    ScrapingService --> Logstash
    Logstash --> Elasticsearch
    Elasticsearch --> Kibana

    %% Monitoring
    UptimeKuma --> Traefik
    UptimeKuma --> AuthService
    UptimeKuma --> SearchService
    UptimeKuma --> ProductReceiver

    %% Logging
    Logstash --> Kibana


```


---

## 1. Database Schema Relationships

### Diagram

```mermaid
classDiagram
    direction LR
    class Localization {
        Int id
        String grocery
        Float lat
        Float lng
        String street OPTIONAL
        String city OPTIONAL
        String zip_code OPTIONAL
        String working_hours OPTIONAL
        Boolean picks_up_in_store OPTIONAL
    }

    class Product {
        Int id
        String name_id
        Int localizationId
        String full_name
        String name
        String description
        Float current_price
        Float discount
        Float price_for_kg OPTIONAL
        String image_url OPTIONAL
        String quantity
    }

    class ProductHistory {
        Int id
        Int productId
        Float price
        Float discount
        DATETIME recorded_at
    }

    class SearchIndex {
        String product_id
        String name
        String description
        Float price
        Float discount
        GEO_POINT location
    }

    Localization "1" -- "many" Product : has
    Product "1" -- "many" ProductHistory : has
    Product "1" -- "many" SearchIndex : indexed_by
```

### Explanation

- **Entities**:
  - `Localization`: Represents stores or supermarkets with unique combinations of `grocery`, `lat`, `lng`, and `street`.
  - `Product`: Represents items sold in a specific store.
  - `ProductHistory`: Tracks changes in product prices and discounts over time.
  - `SearchIndex`: Represents the indexed data in Elasticsearch for efficient searching.

- **Relationships**:
  - `Localization "1" -- "many" Product : has`: Each store can have multiple products.
  - `Product "1" -- "many" ProductHistory : has`: Each product can have multiple history entries.
  - `Product "1" -- "many" SearchIndex : indexed_by`: Each product can have multiple search index entries.

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
    - Logs are optionally sent to **Logstash**.
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
    direction LR
    class Localization {
        Int id
        String grocery
        Float lat
        Float lng
        String street OPTIONAL
        String city OPTIONAL
        String zip_code OPTIONAL
        String working_hours OPTIONAL
        Boolean picks_up_in_store OPTIONAL
    }

    class Product {
        Int id
        String name_id
        Int localizationId
        String full_name
        String name
        String description
        Float current_price
        Float discount
        Float price_for_kg OPTIONAL
        String image_url OPTIONAL
        String quantity
    }

    class SearchIndex {
        String product_id
        String name
        String description
        Float price
        Float discount
        GEO_POINT location
    }

    Localization "1" -- "many" Product : has
    Product "1" -- "many" SearchIndex : indexed_by
```

### Explanation

- **Localization**:
  - Unique constraint ensures no duplicate stores based on `grocery`, `lat`, `lng`, and `street`.

- **Product**:
  - Unique constraint ensures no duplicate products within the same store, based on `name_id` and `localizationId`.

- **SearchIndex**:
  - Unique constraint ensures each `product_id` is unique in the search index.

---

## 5. Search-Service Data Flow

### 5.1. Search Request Handling

```mermaid
sequenceDiagram
    participant Client as Client
    participant SearchAPI as Search-Service API
    participant Elasticsearch as Elasticsearch
    participant DB as PostgreSQL Database
    participant Logstash as Logstash

    Client->>SearchAPI: GET /search?query=term
    SearchAPI->>Elasticsearch: Search Query
    Elasticsearch-->>SearchAPI: Search Results
    SearchAPI->>DB: Fetch Additional Data (if needed)
    DB-->>SearchAPI: Additional Data
    SearchAPI->>Logstash: Send Logs (Optional)
    SearchAPI-->>Client: 200 OK with Results
```

### 5.2. Product Existence Check

```mermaid
sequenceDiagram
    participant Client as Client
    participant SearchAPI as Search-Service API
    participant Elasticsearch as Elasticsearch
    participant Logstash as Logstash

    Client->>SearchAPI: POST /product/exists
    SearchAPI->>Elasticsearch: Existence Query
    Elasticsearch-->>SearchAPI: Query Results
    SearchAPI->>Logstash: Send Logs (Optional)
    SearchAPI-->>Client: 200 OK with Existence Status
```

### 5.3. Lowest Price Calculation

```mermaid
sequenceDiagram
    participant Client as Client
    participant SearchAPI as Search-Service API
    participant Elasticsearch as Elasticsearch
    participant Logstash as Logstash

    Client->>SearchAPI: POST /product/lowest-price
    SearchAPI->>Elasticsearch: Fetch Prices for Products
    Elasticsearch-->>SearchAPI: Price Data
    SearchAPI->>SearchAPI: Calculate Lowest Price Combination
    SearchAPI->>Logstash: Send Logs (Optional)
    SearchAPI-->>Client: 200 OK with Lowest Price Combination
```

---

## 6. Elasticsearch Data Flow

### 6.1. Indexing Documents

```mermaid
sequenceDiagram
    participant SearchService as Search-Service
    participant Elasticsearch as Elasticsearch
    participant Logstash as Logstash

    SearchService->>Elasticsearch: Index Product Document
    Elasticsearch-->>SearchService: Indexing Confirmation
    SearchService->>Logstash: Send Log Entry (Optional)
```

### 6.2. Handling Search Queries

```mermaid
sequenceDiagram
    participant SearchService as Search-Service
    participant Elasticsearch as Elasticsearch

    SearchService->>Elasticsearch: Execute Search Query
    Elasticsearch-->>SearchService: Return Search Results
```

### 6.3. Integration with Logstash

```mermaid
sequenceDiagram
    participant SearchService as Search-Service
    participant Logstash as Logstash
    participant Elasticsearch as Elasticsearch

    SearchService->>Logstash: Send Log Data
    Logstash->>Elasticsearch: Ingest Log Data
    Elasticsearch-->>Logstash: Acknowledge Ingestion
```

---

## 7. Logstash Data Flow

### 7.1. Log Ingestion and Processing

```mermaid
sequenceDiagram
    participant Application as Application Services
    participant Logstash as Logstash
    participant Elasticsearch as Elasticsearch
    participant Kibana as Kibana

    Application->>Logstash: Send Log Entries
    Logstash->>Elasticsearch: Ingest Logs
    Elasticsearch-->>Logstash: Acknowledge Ingestion
    Kibana->>Elasticsearch: Query Logs for Visualization
    Elasticsearch-->>Kibana: Return Log Data
```

---

## 8. Elasticsearch Indexing and Search Workflow

### Diagram

```mermaid
sequenceDiagram
    participant SearchService as Search-Service
    participant Elasticsearch as Elasticsearch
    participant Logstash as Logstash
    participant Kibana as Kibana

    SearchService->>Elasticsearch: Index Product Document
    Elasticsearch-->>SearchService: Indexing Confirmation
    SearchService->>Logstash: Send Log Entry (Optional)
    SearchService->>Elasticsearch: Execute Search Query
    Elasticsearch-->>SearchService: Return Search Results
    Logstash->>Elasticsearch: Ingest Logs
    Kibana->>Elasticsearch: Query Logs for Visualization
    Elasticsearch-->>Kibana: Return Log Data
```

---

## 9. Logstash Processing Pipeline

### Diagram

```mermaid
flowchart LR
    A[Application Services] -->|Send Logs| B[Logstash]
    B -->|Parse Logs| C[Elasticsearch]
    C --> D[Kibana]
```

---

## 10. Global Data Flow

### Diagram

```mermaid
flowchart LR
    %% Define subgraphs for logical grouping
    subgraph Frontend
        WebClient[Web Client]
    end

    subgraph Proxy
        Traefik[Traefik]
    end

    subgraph Backend
        AuthService[Auth Service]
        SearchService[Search Service]
        ProductReceiver[Product Receiver Service]
        NotificationAlert[Notification Alert]
        ScrapingService[Scraping Service]
    end

    subgraph Database
        DB[(PostgreSQL)]
        Adminer[Adminer]
    end

    subgraph Search
        Elasticsearch[Elasticsearch]
        Logstash[Logstash]
        Kibana[Kibana]
    end

    subgraph Monitoring
        UptimeKuma[Uptime Kuma]
    end

    %% Frontend to Proxy
    WebClient -->|API Requests| Traefik

    %% Proxy to Backend
    Traefik --> AuthService
    Traefik --> SearchService
    Traefik --> ProductReceiver
    Traefik --> NotificationAlert

    %% Backend to Database
    AuthService --> DB
    SearchService --> DB
    ProductReceiver --> DB
    Adminer --> DB

    %% Backend to Search
    SearchService --> Elasticsearch
    ProductReceiver --> Logstash
    ScrapingService --> ProductReceiver
    ScrapingService --> Logstash
    Logstash --> Elasticsearch
    Elasticsearch --> Kibana

    %% Monitoring
    UptimeKuma --> Traefik
    UptimeKuma --> AuthService
    UptimeKuma --> SearchService
    UptimeKuma --> ProductReceiver

    %% Logging
    Logstash --> Kibana
```

### Diagram Breakdown

- **Frontend**:
  - **Web Client**: The user interface that interacts with backend services via API requests.

- **Proxy**:
  - **Traefik**: Acts as a reverse proxy, routing incoming API requests to the appropriate backend services.

- **Backend Services**:
  - **Auth Service**: Handles authentication processes and communicates with the PostgreSQL database.
  - **Search Service**: Manages search functionalities, interacts with Elasticsearch, and fetches additional data from the PostgreSQL database.
  - **Product Receiver Service**: Receives and processes product data, interacts with the PostgreSQL database, and sends logs to Logstash.
  - **Notification Alert**: Handles notifications and alerts, routed through Traefik.
  - **Scraping Service**: Scrapes data from external sources, communicates with the Product Receiver Service, and sends logs to Logstash.

- **Database**:
  - **PostgreSQL**: Central database accessed by Auth Service, Search Service, and Product Receiver Service.
  - **Adminer**: Web-based database management tool for PostgreSQL.

- **Search Infrastructure**:
  - **Elasticsearch**: Search and analytics engine used by the Search Service.
  - **Logstash**: Log ingestion and processing pipeline, receives logs from various services and forwards them to Elasticsearch.
  - **Kibana**: Visualization tool for logs stored in Elasticsearch.

- **Monitoring**:
  - **Uptime Kuma**: Monitors the health and uptime of key services, including Traefik, Auth Service, Search Service, and Product Receiver Service.

- **Logging**:
  - **Logstash** sends processed logs to **Kibana** for visualization and analysis.
---

