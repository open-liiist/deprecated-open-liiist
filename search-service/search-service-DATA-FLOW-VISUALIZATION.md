Below are the **Mermaid** diagrams illustrating the data flows for the **search-service**, **Elasticsearch**, and **Logstash**. 
---

## 1. Database Schema Relationships

### Diagram

```mermaid
classDiagram
    direction LR
    class Product {
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
    class Localization {
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
    class SearchIndex {
        STRING product_id
        STRING name
        STRING description
        FLOAT price
        FLOAT discount
        GEO_POINT location
    }

    Localization "1" -- "many" Product : has
    Product "1" -- "many" SearchIndex : indexed_by
```

---

## 2. Search-Service Data Flow

### 2.1. Search Request Handling

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

### 2.2. Product Existence Check

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

### 2.3. Lowest Price Calculation

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

## 3. Elasticsearch Data Flow

### 3.1. Indexing Documents

```mermaid
sequenceDiagram
    participant SearchService as Search-Service
    participant Elasticsearch as Elasticsearch
    participant Logstash as Logstash

    SearchService->>Elasticsearch: Index Product Document
    Elasticsearch-->>SearchService: Indexing Confirmation
    SearchService->>Logstash: Send Log Entry (Optional)
```

### 3.2. Handling Search Queries

```mermaid
sequenceDiagram
    participant SearchService as Search-Service
    participant Elasticsearch as Elasticsearch

    SearchService->>Elasticsearch: Execute Search Query
    Elasticsearch-->>SearchService: Return Search Results
```

### 3.3. Integration with Logstash

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

## 4. Logstash Data Flow

### 4.1. Log Ingestion and Processing

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

## 5. Composite Unique Constraints

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

---

## 6. Elasticsearch Indexing and Search Workflow

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

## 7. Logstash Processing Pipeline

### Diagram

```mermaid
flowchart LR
    A[Application Services] -->|Send Logs| B[Logstash]
    B -->|Parse Logs| C[Elasticsearch]
    C --> D[Kibana]
```

---